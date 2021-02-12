let map;
let aqLayer;
let refreshAQLayerTimeout;
let searchMarker;
let placesService;
let cleanAirPlaces = [];
let cleanAirMarkers = [];
let lastOpenedInfoWindow;

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
    new AutocompleteDirectionsHandler(map);
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
        const modeSelector = document.getElementById("mode-selector"); 

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
                hideCleanAirMarkers();
                cleanAirMarkers = [];
                populateAQVisualisationData();
            }, 500);
        });

        const aqLayerControlDiv = document.createElement("div");
        aqLayerControl(aqLayerControlDiv, map);
        this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(aqLayerControlDiv);

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

    calculateAndDisplayRoute() {
        if (!this.originPlaceId || !this.destinationPlaceId) {
            return;
        }
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
        scoreRoute(data);
        updateCleanAirPlaces(data, mapBounds); // TODO (Rachel): disable clean air button until data is ready
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

// TODO (Rosanna): implement scoring here
function scoreRoute(griddedData) {
    // Note for Rosanna: griddedData is not exactly a grid, but a grid-like nested map
    console.log("scoring route");
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

// Functionality for Clean Air Near Me feature

function updateCleanAirPlaces(data, bounds) {
    // Perform a nearby search bounded by the current viewport
    // Any locations outside the viewport would not have an AQI
    placesService.nearbySearch(
        {bounds: bounds, type: "park"},
        (places, status) => {
            if (status !== "OK" || !places) return;
            
            // update list of clean air places
            cleanAirPlaces = [];
            for (const place of places) {
                if (place.geometry && place.geometry.location) {
                    let aqi = "?";
                    const index = getGridIndex(place.geometry.location.lat(), place.geometry.location.lng(), data.aqDataPointsPerDegree);
                    const row = data.data[index.row];
                    if (row) {
                        if (row[index.col]) {
                            aqi = row[index.col];
                        }
                    }
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