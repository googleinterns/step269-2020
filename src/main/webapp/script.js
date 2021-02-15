let map; // Defining a global script variable
let routeHandler;
let aqLayer;
let refreshAQLayerTimeout;
let searchMarker;
let placesService;
let cleanAirPlaces = [];
let cleanAirMarkers = [];
let lastOpenedInfoWindow;
let selectedLocation;

let printDebugData = false;
let lastOpenedRouteInfoWindow;
let infoWindowArray = [];
let directionsRendererArray = [];

// Key = zoom level, Value = point radius in pixels
let heatmapPointRadius = new Map([
    [7, 1],
    [8, 2],
    [9, 6],
    [10, 12],
    [11, 24],
    [12, 46],
    [13, 95],
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
    // Have a global scope reference to the route handler to be accessed in various places.
    routeHandler = new AutocompleteDirectionsHandler(map); 
    placesService = new google.maps.places.PlacesService(map);
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

        // Array of Autocomplete object for each waypoint.
        this.waypointAutocompleteArray = [];
        this.waypointCounter = 0;
        
        // Put directions in the directions panel.
        this.directionsRenderer.setPanel(document.getElementById("direction-panel"));

        // Retrieve what was input by user for the location search bar.  
        const searchbar = document.getElementById("location-search-bar");
        searchMarker = new google.maps.Marker({
            map,
            anchorPoint: new google.maps.Point(0,-29), // Position the marker icon relative to the origin
        });
        searchMarker.setVisible(false);

        const originInput = document.getElementById("origin-input");
        const destinationInput = document.getElementById("destination-input");

        // Initialise places autocomplete in search bar.
        const autocomplete = new google.maps.places.Autocomplete(searchbar);
        autocomplete.setFields(["geometry","name", "place_id"]);
        const originAutocomplete = new google.maps.places.Autocomplete(originInput);
        originAutocomplete.setFields(["place_id"]);
        const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
        destinationAutocomplete.setFields(["place_id"]);

        // For individual search and marker function.
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

        // Detect if user clicked on the "add waypoints" button. 
        this.detectAddWaypointButtonListener("waypoint-button");
   
        // Detect if user has input origin/destination and calculate direction
        this.detectPlaceChangedListener(originAutocomplete, "ORIG");
        this.detectPlaceChangedListener(destinationAutocomplete, "DEST");

        // Initialise visualisation when the bounds of the map changed.
        // map.getBounds() is undefined until the map tiles have finished loading,
        // at which point the bounds change.
        google.maps.event.addListener(map, 'bounds_changed', function() {
            if (refreshAQLayerTimeout) {
                clearTimeout(refreshAQLayerTimeout);
            }
            refreshAQLayerTimeout = setTimeout(function() {
                hideCleanAirMarkers();
                cleanAirMarkers = [];
                populateAQVisualisationData();
            }, 500);
        });

        const aqLayerControlDiv = document.createElement("div");
        aqLayerControl(aqLayerControlDiv, map);
        this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(aqLayerControlDiv);
    }

    // Set a listener on a radio button to change the travel mode on Places Autocomplete.
    detectClickListener(id, mode) {
        const radioButton = document.getElementById(id);
        radioButton.addEventListener("click", () => {
          this.travelMode = mode;
          this.calculateAndDisplayRoute();
        });
    }

    // A listener to see if the user changed the input of a waypoint, and update the route. 
    detectWaypointChangedListener(autocompletedInput) {
        autocompletedInput.bindTo("bounds", this.map);
        autocompletedInput.addListener("place_changed", () => {
            const place = autocompletedInput.getPlace();

            if (!place.place_id) {
              window.alert("Please select an option from the dropdown list.");
              return;
            }

            this.calculateAndDisplayRoute();
          });
    }

    // TODO (Rosanna): to account to delete a waypoint container too. 
    detectAddWaypointButtonListener(buttonId) {
        const button = document.getElementById(buttonId);

        // Add listener to append a container onto HTML.
        button.addEventListener("click", () => {
            var wayptContainer = document.getElementById("waypoint-container");
            var waypointInput = document.createElement("input");
            waypointInput.type = "text";
            waypointInput.className = "waypointInput";
            waypointInput.placeholder="Enter a Waypoint location";
            wayptContainer.appendChild(waypointInput); // Put it into the HTML Container.
            waypointInput.id = "waypoint-input" + this.waypointCounter; // Starting at waypoint-input0.
            this.waypointCounter++;

            const waypointAutocomplete = new google.maps.places.Autocomplete(waypointInput);
            waypointAutocomplete.setFields(["place_id", "name"]);
            this.detectWaypointChangedListener(waypointAutocomplete);

            this.waypointAutocompleteArray.push(
                waypointAutocomplete
            );
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

    scoreRoutes(griddedData) {
        const dataGrid =  griddedData.data;
        const aqDataPointsPerDegree = griddedData.aqDataPointsPerDegree;

        // If directions repsonse is null (which means a route isnt calcualted yet), dont score. 
        if (!this.directionsResponse) {
            return;
        }

        for (let routeInfoWindow of infoWindowArray) {
            routeInfoWindow.close();
        } 
        infoWindowArray = [];

        let routes = this.directionsResponse["routes"];
        for (const route of routes) {
            const routeIndex = routes.indexOf(route);
            // Keep console comments to print in console and see if score is working. 
            console.log("In route " + (routeIndex + 1) + " of " + routes.length + "  of the route array of the response.");
            let routeAQIScore = this.scoreIndvRoute(route, griddedData);
            console.log("The score of route " + (routeIndex + 1)  + " of " + routes.length + "in the route array is: " + routeAQIScore);

            routeAQIScore = Math.round((routeAQIScore +  Number.EPSILON) * 100) / 100;

            // If there are waypoints, there is only one route. 
            // If there are no waypoints, there are alternate route suggestions. 
            var center_point = route.overview_path.length / 2;
            var infowindow = new google.maps.InfoWindow();
            infowindow.setContent(
                route.legs[0].distance.text + "<br>" 
                + route.legs[0].duration.text + "<br>" 
                + "RouteAQI Score: " + routeAQIScore + " "
            );

            infoWindowArray.push(infowindow);
            
            // Set the infowindow position to be in the midpoint of the route. 
            infowindow.setPosition(route.overview_path[center_point|0]);
            infowindow.open(map);
        }
    }

    // Given A Route, by going through all of the legs, and each step inside each leg. 
    scoreIndvRoute(Route, griddedData ) {
        const dataGrid =  griddedData.data;
        const aqDataPointsPerDegree = griddedData.aqDataPointsPerDegree;
        let legs = Route["legs"];

        let totalValue = 0;
        let totalWeight = 0; 
        for (const leg of legs) {
            const legIndex = legs.indexOf(leg);
            console.log("In leg " + (legIndex + 1) + "  of "+ legs.length +" the legs array in the 1st route of the response.");

            for (const step of leg["steps"]) {
                const stepIndex = leg["steps"].indexOf(step);
                console.log("Printing out start point of a step in a leg. In step " + (stepIndex + 1) + " of " + leg["steps"].length + step["start_location"]);

                // The duration value indicates duration in seconds. Using that (time) as stepWeight. 
                let stepWeight = step["duration"]["value"];
                let stepStartLat = step["start_location"].lat();
                let stepStartLng = step["start_location"].lng();

                let mapRowCol = getGridIndex(stepStartLat, stepStartLng, aqDataPointsPerDegree);
                let mapRow = mapRowCol.row;
                let mapCol = mapRowCol.col;

                // AQI is only available for routes passing through the grid exactly. 
                // Or else no data available and will have error saying it is undefined (because it doesnt exist). 
                // If the mapRow from getGridIndex of stepAQIdoesnt doesn't exist in the data grid, stepAQI is 0 for now. 
                let stepAQI = 0;
                if (!dataGrid[mapRow]) {
                    console.log("Row map doesnt exist and is undefined.");
                } else if (!dataGrid[mapRow][mapCol]) {
                    console.log("Step aqi dosnt exist because mapCol doesn't exist in mapRow. So cant find and set stepAQI");
                } else {
                    stepAQI = dataGrid[mapRow][mapCol];
                }

                console.log(stepAQI);
                totalValue += stepWeight * stepAQI;
                totalWeight += stepWeight;
                console.log("So far total value is: " + totalValue + " total weight is: "+ totalWeight);
            }

            // Counting the AQI at the end point of the leg as part of the score. 
            // Set duration stepWeight as 60 seconds to account of parking upon arrival at end point. 
            // TODO: Rosanna to rethink on this logic, would it stll apply with waypoints where there are a lot of legs? It can count for stopover time. 
            let legWeight = 60;
            let legEndlat = leg["end_location"].lat();
            let legEndLng = leg["end_location"].lng();

            let endPtRowCol = getGridIndex(legEndlat, legEndLng, aqDataPointsPerDegree);
            let mapRow = endPtRowCol.row;
            let mapCol = endPtRowCol.col;
            let endptAQI = 0;

            // Print to see in console whether mapRow or mapCol is undefined. 
            if (!dataGrid[mapRow]) {
                console.log("Row map doesnt exist and is undefined.");
            } else if (!dataGrid[mapRow][mapCol]) {
                console.log("Step aqi dosnt exist because mapCol doesn't exist in mapRow. So cant find and set stepAQI");
            } else {
                endptAQI = dataGrid[mapRow][mapCol];
            }

            console.log(endptAQI);
            totalValue += legWeight * endptAQI;
            totalWeight += legWeight;
            console.log("So far total value is: " + totalValue + " total weight is: "+ totalWeight);
        }

        // Calculate total route Score 
        let routeScore = totalValue / totalWeight; 
        console.log("Total value is: " + totalValue + " totalweight is: " + totalWeight);
        console.log("The Route Score is: " + routeScore);
        return routeScore;
    }

    calculateAndDisplayRoute() {
        // If PlaceIDs are not placed in yet, dont calculate a route yet. 
        if (!this.originPlaceId || !this.destinationPlaceId) {
            return;
        }
        const waypts = [];
        const wayptAutocompleteArray = this.waypointAutocompleteArray;

        for (const autocompleteObject of wayptAutocompleteArray) {
            waypts.push ({
                location: autocompleteObject.getPlace().name,
                stopover: true,
            })
        }
   
        // Saving the class "this" as "me", as the definition of "this."  
        // is changed in the reponse section and does not refer to the AutocompleteDirectionsHandler Class.
        const me = this;
        this.directionsService.route(
            {
                origin: { placeId: this.originPlaceId },
                destination: { placeId: this.destinationPlaceId },
                travelMode: this.travelMode,
                provideRouteAlternatives: true,
                waypoints: waypts,
                optimizeWaypoints: true,
            },
            (response, status) => {
                if (status === "OK") {
                    // Everytime a route is calculated, refresh renderer Array with the latest routes. 
                    for (const render of directionsRendererArray) {
                      render.setMap(null); 
                    }
                    directionsRendererArray = []; 
                    for (const i = 0; i < response.routes.length; i++) {
                        const renderer = new google.maps.DirectionsRenderer({
                            map: me.map,
                            directions: response,
                            routeIndex: i
                        })
                        directionsRendererArray.push(renderer);
                    }
                    me.directionsResponse = response;
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
        routeHandler.scoreRoutes(data);
        updateCleanAirPlaces(data, mapBounds); // TODO (Rachel): disable clean air button until data is ready
        if (selectedLocation) {updateSelectedLocationInfo(data);}
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

            // Create the weightedLocation for the heatmap
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

function setEndPoint(place) {
    const locationInfo = document.getElementById("location-info");
    locationInfo.style.visibility = "visible"; 
    
    searchMarker.setPosition(place.geometry.location);
    searchMarker.setVisible(true);

    locationInfo.innerHTML = `<h3>${place.name}</h3>`;

    selectedLocation = place;
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

// This function returns the aqi from the data at the specified index.
// If the aqi is unknown at that index, it will return -1.
function getAQI(data, index) {
    let aqi = -1;
    const row = data.data[index.row];
    if (row) {
        if (row[index.col]) {
            aqi = row[index.col];
        }
    }
    return aqi;
}

// Functionality for Clean Air Near Me feature

function updateCleanAirPlaces(data, bounds) {
    // Perform a nearby search bounded by the current viewport.
    // Any locations outside the viewport would not have an AQI.
    placesService.nearbySearch(
        {bounds: bounds, type: "park"},
        (places, status) => {
            if (status !== "OK" || !places) return;
            
            // Update list of clean air places
            cleanAirPlaces = [];
            for (const place of places) {
                if (place.geometry && place.geometry.location) {
                    const index = getGridIndex(place.geometry.location.lat(), place.geometry.location.lng(), data.aqDataPointsPerDegree);
                    let aqi = getAQI(data, index);
                    aqi = aqi === -1 ? "?" : Math.round(aqi).toString();
                    cleanAirPlaces.push({place: place, aqi: aqi});
                }
            }
        }
    )
}

function createCleanAirMarkers() {
    for (const element of cleanAirPlaces) {
        const place = element.place;
        const labelText = element.aqi === "?" ? "?" : Math.round(element.aqi).toString();
        const marker = new google.maps.Marker({
            map,
            icon: {
                url: "http://maps.google.com/mapfiles/kml/paddle/grn-blank.png",
                labelOrigin: new google.maps.Point(32, 20),
            },
            label: labelText,
            position: place.geometry.location,
            title: place.name,
        })
        
        let infoWindowHTML = `<h3>${place.name}</h3>
            <p>This place is close to: ${place.vicinity}</p>`
        const infoWindow = new google.maps.InfoWindow({
            content: infoWindowHTML,
        })
        marker.addListener("click", () => {
            if (lastOpenedInfoWindow) {
                lastOpenedInfoWindow.close();
            }
            infoWindow.open(map, marker);
            lastOpenedInfoWindow = infoWindow;
        })

        cleanAirMarkers.push(marker);
    }
}

function showCleanAirMarkers() {
    if (cleanAirMarkers.length == 0) {
        createCleanAirMarkers();
        return;
    }
    for (const marker of cleanAirMarkers) {
        marker.setMap(map);
    }
}

function hideCleanAirMarkers() {
    for (const marker of cleanAirMarkers) {
        marker.setMap(null);
    }
}

function updateSelectedLocationInfo(data) {
    const index = getGridIndex(selectedLocation.geometry.location.lat(), selectedLocation.geometry.location.lng(), data.aqDataPointsPerDegree);
    const aqi = getAQI(data, index);
    let aqiString;
    if (aqi === -1) {
        aqiString = "AQI is unknown at this location.";
    } else {
        aqiString = `AQI: ${Math.round(aqi)}`;
    }

    const locationInfo = document.getElementById("location-info");
    locationInfo.innerHTML = `<h3>${selectedLocation.name}</h3>`
    locationInfo.innerHTML += `<p>${aqiString}</p>`;
}