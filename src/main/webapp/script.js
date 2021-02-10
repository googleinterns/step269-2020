let map;
let aqLayer;
let refreshAQLayerTimeout;
let searchMarker;

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
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
        },
        streetViewControl: false,
        fullscreenControl: false,
    });
    // Initialise places autocomplete in search bar
    const searchbar = document.getElementById("location-search-bar");
    searchMarker = new google.maps.Marker({
        map,
        anchorPoint: new google.maps.Point(0,-29), // position the marker icon relative to the origin
    });
    searchMarker.setVisible(false);
    const autocomplete = new google.maps.places.Autocomplete(searchbar);
    autocomplete.setFields(["geometry","name"]);
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
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(aqLayerControlDiv);
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
        loadHeatmap(aqData);
        scoreRoute(data);
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
            radius: 10, // Arbitrary value.
        });
    }
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