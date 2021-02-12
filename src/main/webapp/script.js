let map; // Defining a global script variable
let routeHandler; //in the globar scope, there is a thing call route handlers 
let aqLayer;
let refreshAQLayerTimeout;
let searchMarker;
let printDebugData = false;

// key = zoom level, value = point radius in pixels
let heatmapPointRadius = new Map([
    [7, 1],
    [8, 2],
    [9, 6],
    [10, 12],
    [11, 24],
    [12, 46],
    [13, 105],
    [14, 195],
    [15, 390],
    [16, 800]
]);

function aqLayerControl(controlDiv) {
    const controlUI = document.createElement("div");
    controlUI.className = "mapControlUI";
    controlUI.title = "Click to toggle the AQ layer";
    controlDiv.appendChild(controlUI);

    const controlText = document.createElement("div");
    controlText.className = "mapControlText";
    controlText.innerHTML = "Toggle AQ Layer";
    controlUI.appendChild(controlText);

    controlUI.addEventListener("click", () => {
        toggleAQLayer();
    });
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: new google.maps.LatLng(-34.397, 150.644),
        zoom: 8,
        minZoom: 7,
        maxZoom: 16,
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
        },
        streetViewControl: false,
        fullscreenControl: false,
    });
    routeHandler = new AutocompleteDirectionsHandler(map); //now have a global scope reference to the route handelr to be access in diff places
}

class AutocompleteDirectionsHandler {
    constructor(map) {
        this.map = map;
        this.originPlaceId = "";
        this.destinationPlaceId = "";
        this.travelMode = google.maps.TravelMode.DRIVING; // Set default mode as Driving.
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer();
        this.directionsRenderer.setMap(map);
        this.directionsResponse = null;
        
        // Put directions in the directions panel
        this.directionsRenderer.setPanel(document.getElementById("direction-panel"));

        // Retrieve what was input by user for the location search bar.  
        const searchbar = document.getElementById("location-search-bar");
        searchMarker = new google.maps.Marker({
            map,
            anchorPoint: new google.maps.Point(0,-29), // position the marker icon relative to the origin
        });
        searchMarker.setVisible(false);

        const originInput = document.getElementById("origin-input");
        const destinationInput = document.getElementById("destination-input");

        // Initialise places autocomplete in search bar
        const autocomplete = new google.maps.places.Autocomplete(searchbar);
        autocomplete.setFields(["geometry","name", "place_id"]);
        const originAutocomplete = new google.maps.places.Autocomplete(originInput);
        originAutocomplete.setFields(["place_id"]);
        const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
        destinationAutocomplete.setFields(["place_id"]);

        //for individual search and marker function, temporarily contained here for test runs
        autocomplete.addListener("place_changed", () => {
            searchMarker.setVisible(false);
            const place = autocomplete.getPlace(); 

            if (!place.geometry) {
                console.log(`No details available for input '${place.name}'`);
                return;
            }

            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.viewport);
                map.setZoom(17); // 17 used because it is used in a sample in the documentation
            }

            setEndPoint(place);
        })

        // Detect if user clicks another travel mode, and changes the mode on the route returned
        this.detectClickListener("changemode-walking", google.maps.TravelMode.WALKING);
        this.detectClickListener("changemode-transit", google.maps.TravelMode.TRANSIT);
        this.detectClickListener("changemode-driving", google.maps.TravelMode.DRIVING); 
        
        // Detect if user has input origin/destination and calculate direction
        this.detectPlaceChangedListener(originAutocomplete, "ORIG");
        this.detectPlaceChangedListener(destinationAutocomplete, "DEST");

        // Initialise visualisation when the bounds of the map changed.
        // map.getBounds() is undefined until the map tiles have finished loading,
        // at which point the bounds change
        google.maps.event.addListener(map, 'bounds_changed', function() {
            if (refreshAQLayerTimeout) {
                clearTimeout(refreshAQLayerTimeout);
            }
            refreshAQLayerTimeout = setTimeout(function() {
                populateAQVisualisationData();
            }, 500);
        });

        const aqLayerControlDiv = document.createElement("div");
        aqLayerControl(aqLayerControlDiv, map);
        this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(aqLayerControlDiv);

        //console.log("print to see if the reponse is saved outside");
        //console.log("this is the same line as directions reponse outside" + this.directionsResponse);
    }

    // Sets a listener on a radio button to change the travel mode on Places Autocomplete.
    detectClickListener(id, mode) {
        const radioButton = document.getElementById(id);
        radioButton.addEventListener("click", () => {
          this.travelMode = mode;
          this.calculateAndDisplayRoute();
        });
    }

    detectPlaceChangedListener(autocompletedInput, journeyPoint) {
        autocompletedInput.bindTo("bounds", this.map);
        autocompletedInput.addListener("place_changed", () => {
            const place = autocompletedInput.getPlace();
      
            if (!place.place_id) {
              window.alert("Please select an option from the dropdown list.");
              return;
            }
      
            if (journeyPoint === "ORIG") {
              this.originPlaceId = place.place_id;
            } else {
              this.destinationPlaceId = place.place_id;
            }
            this.calculateAndDisplayRoute();
          });
    }


    // TODO (Rosanna): implement scoring here
    scoreRoute(griddedData) {
        // Note for Rosanna: griddedData is not exactly a grid, but a grid-like nested map
        //const dataGrid = griddedData.data;
        //let dataGrid = new Map();
        //let map = new Map<Integer, Map<Integer, Double>>()
        const dataGrid =  griddedData.data;
        const aqDataPointsPerDegree = griddedData.aqDataPointsPerDegree;

        // If directions repsonse is null (which means a route isnt calcualted yet), dont score. 
        if (!this.directionsResponse) {
            return;
        }
        console.log("scoring route");
        //when i have calc and displate route. do if... if this.directionsresponse isnt set so dont do things with undefined data
        //the class has repsonse data, pass in gridded data. now have two things to process response with data 
        console.log("printing the first route of response\n");
        console.log(this.directionsResponse["routes"][0]);
        let legs = this.directionsResponse["routes"][0]["legs"];

        let totalValue = 0;
        let totalWeight = 0; 
        for (const leg of legs) {
          console.log("In leg " + legs.indexOf(leg) + "  of the legs array in the 1st route of the response.");
          for (const step of leg["steps"]) {
            //inside a step 
            console.log("printing out start point of a step in a leg. In step " + (leg["steps"].indexOf(step) + 1) + " " + step["start_location"]);
            //choose for each step, what weight ot use. a step has a distance and time on it. pick either of those. 
            //using time as weight

            // The duration value indicates duration in seconds. 
            let stepWeight = step["duration"]["value"];
            let stepStartLat = step["start_location"].lat();
            let stepStartLng = step["start_location"].lng();

            console.log("starting location indv lat lng");
            console.log(stepStartLat);
            console.log(stepStartLng);

            //let aqi = 1; //need to use the coordinates of the start point to find the AQ from the gridded data.
            //use that instead of 1
            //coord, with special data -> row col - > aqi

            // get the grid index
            let mapRowCol = getGridIndex(stepStartLat, stepStartLng, aqDataPointsPerDegree);
            let mapRow = mapRowCol.row;
            let mapCol = mapRowCol.col;

            //get the aqi in that map. 
            console.log(typeof dataGrid); // Object 
            console.log(mapRow);
            console.log(mapCol);
            console.log(aqDataPointsPerDegree); //1000
            console.log(dataGrid);
            
            let rowMap = dataGrid[mapRow];
            console.log(rowMap);

            // AQI is only available for routes passing through the grid exactly. 
            // Or else no data available and will have error saying it is undefined (because it doesnt exist). 

            //===== HAVE SOMETHING FOR WHEN IT DOESNT EXIST AKA THE MAP ROW OR MAP COLM IS NOT EXISTENT COSE IT IS UNDEFINED WITH NO VALUES. =====
            /* 
            if 
            */ 

            let stepAQI = dataGrid[mapRow][mapCol];
            console.log(stepAQI);
            if (!stepAQI) {
                console.log("PRINT !STEPAQI WORKS! IT IS UNDEFINED");
                // if it doesnt have a AQI value cose it doesnt exist in the grid, make the value = 0 
                stepAQI = 0; 
            }
            console.log(stepAQI);
            totalValue += stepWeight * stepAQI;
            totalWeight += stepWeight;
            console.log("so far total value is: " + totalValue + " total weight is: "+ totalWeight);
          }
        }
        let routeScore = totalValue / totalWeight; 
        console.log("total value is: " + totalValue + " totalweight is: " + totalWeight);
        console.log("The Route Score is: " + routeScore);
        //once get values out f gridded data, has a weighted average on the duration of each step . 
        //keep a map of scored route where the key is the scored line, then at the beginning of the function, if i dont have a r epsonse
        /// have a score in the map? 
        // dont have it create one and score in the map 
    }

    calculateAndDisplayRoute() {
        // If PlaceIDs are not placed in yet, dont calculate a route yet. 
        if (!this.originPlaceId || !this.destinationPlaceId) {
            return;
        }
        // Saving the class "this" as "me", as the definition of "this." 
        // changed in the reponse section and does not refer to the AutocompleteDirectionsHandler Class.
        const me = this;
        this.directionsService.route(
            {
                origin: { placeId: this.originPlaceId },
                destination: { placeId: this.destinationPlaceId },
                travelMode: this.travelMode,
                provideRouteAlternatives: true
            },
            (response, status) => {
                if (status === "OK") {
                    // "Me." is used as it is saved as the old "this." 
                    me.directionsResponse = response;
                    //when we trigger the render, it will cause the map will redraw. when it redarws, we score the route. 
                    // when we score the route, we want it somewhere to use it
                    // in the this . directions sreposne. 
                    //directionservice.route the seocnd is is where rspons comma stats becomes a close. is a functiont hat gets called
                    //when the map complete, but will be call from the context of somewhere else, inside the direction service. so "this" has a new meaning
                    //so "me" still ahs the context of the og parent object, but "this" has changed because it is in a class. 
                    me.directionsRenderer.setDirections(response);
                } else {
                    window.alert("Directions request failed due to " + status);
                }
            }
        );   
    }
}

function toggleAQLayer() {
    aqLayer.setMap(aqLayer.getMap() ? null : map);
}

function populateAQVisualisationData() {
    const mapBounds = map.getBounds();
    const swCorner = mapBounds.getSouthWest();
    const neCorner = mapBounds.getNorthEast();
    let fetchURL = `/visualisation?sw-lat=${swCorner.lat()}&sw-long=${swCorner.lng()}&ne-lat=${neCorner.lat()}&ne-long=${neCorner.lng()}`;
    fetch(fetchURL).then(response => response.json()).then((data) => {
        const aqData = convertGriddedDataToWeightedPoints(data);
        if (printDebugData) {console.log(data);}
        loadHeatmap(aqData);
        routeHandler.scoreRoute(data);
    });
}

function loadHeatmap(data) {
    if (!aqLayer) {
        aqLayer = new google.maps.visualization.HeatmapLayer({
            gradient: [
                "rgba(65,169,60,0)",
                "rgba(65, 169, 60, 1)",
                "rgba(238, 201, 0, 1)",
                "rgba(228, 116, 0, 1)",
                "rgba(186, 0, 41, 1)",
                "rgba(86, 3, 23, 1)",
            ],
            maxIntensity: 200,
            dissipating: true,
        });
    }
    const pixelRadius = heatmapPointRadius.get(map.getZoom());
    aqLayer.setOptions({radius: pixelRadius});
    aqLayer.setData(data);
    aqLayer.setMap(map);
}

function convertGriddedDataToWeightedPoints(griddedData) {
    const dataGrid = griddedData.data;
    const aqDataPointsPerDegree = griddedData.aqDataPointsPerDegree;
    let weightedPoints = [];

    for (let [rowNum, row] of Object.entries(dataGrid)) {
	    for (let [colNum, aqi] of Object.entries(row)) {
            const cellCoords = calcCellCoords(rowNum, colNum, aqDataPointsPerDegree);

            // create the weightedLocation for the heatmap
            let weightedPoint = {}
            weightedPoint.location = new google.maps.LatLng(cellCoords.lat, cellCoords.lng);
            weightedPoint.weight = aqi;
            weightedPoints.push(weightedPoint);
        }
    }
    return weightedPoints;
}

function calcCellCoords(rowNum, colNum, aqDataPointsPerDegree) {
    const cellLat = (parseInt(rowNum) + 0.5) / aqDataPointsPerDegree;
    const cellLng = (parseInt(colNum) + 0.5) / aqDataPointsPerDegree;
    return {lat:cellLat, lng:cellLng};
}

function getGridIndex(lat, lng, aqDataPointsPerDegree) {
    row = Math.floor(lat * aqDataPointsPerDegree);
    col = Math.floor(lng * aqDataPointsPerDegree);
    return {row:row, col:col};
}

//coord, with special data -> row col - > aqi 

function setEndPoint(place) {
    const locationInfo = document.getElementById("location-info");
    locationInfo.style.visibility = "visible"; 
    
    searchMarker.setPosition(place.geometry.location);
    searchMarker.setVisible(true);

    locationInfo.innerHTML = `<h3>${place.name}</h3>`;
}

function showRoutes() {
    console.log("Directions not currently supported");
}

function hideRoutes() {
    console.log("Directions not currently supported");
}

function toggleSidebar() {
    const toggleButton = document.getElementById("toggle-sidebar");
    const sidebar = document.querySelector("#sidebar");
    const sidebarDisplay = window.getComputedStyle(sidebar).getPropertyValue("display");

    if (sidebarDisplay === "block") {
        sidebar.style.display = "none";
        toggleButton.innerHTML = "<i class=material-icons>navigate_next</i>";
        toggleButton.style.left = "0px";
    } else {
        sidebar.style.display = "block";
        toggleButton.innerHTML = "<i class=material-icons>navigate_before</i>";
        toggleButton.style.left = "300px";
    }
}