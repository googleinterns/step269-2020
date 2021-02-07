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
    let fetchURL = `/visualisation?zoom-level=${map.getZoom()}&sw-lat=${swCorner.lat()}&sw-long=${swCorner.lng()}&ne-lat=${neCorner.lat()}&ne-long=${neCorner.lng()}`;
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
            radius: 100, // arbitrary value used to make the points easily visible
        });
    }
    aqLayer.setData(data);
    aqLayer.setMap(map);
}

function convertGriddedDataToWeightedPoints(griddedData) {
    const dataGrid = griddedData.data;
    const originCoords = {lat: griddedData.origin.Latitude, lng: griddedData.origin.Longitude};
    const resolution = griddedData.resolution;

    let weightedPoints = [];
    for (let rowNum = 0; rowNum < dataGrid.length; rowNum++) {
        // const verticalDistance = resolution / 2 + rowNum * resolution;
        for (let colNum = 0; colNum < dataGrid[0].length; colNum++) {
            if (dataGrid[rowNum][colNum] === 0) {
                continue;
            }
            const cellCoords = calcCellCoords(originCoords, rowNum, colNum, resolution);

            //create the WeightedLocation for the heatmap
            let weightedPoint = {}
            weightedPoint.location = new google.maps.LatLng(cellCoords.lat, cellCoords.lng);
            weightedPoint.weight = dataGrid[rowNum][colNum];
            weightedPoints.push(weightedPoint);
        }
    }
    return weightedPoints;
}

// TODO (Rosanna): implement scoring here
function scoreRoute(griddedData) {
    // note for Rosanna: griddedData is not exactly a grid, but a grid-like nested map
    console.log("scoring route");
}

/**
 * @param {int} resolution The size of each grid cell in metres
 * @param {coordinate pair} originCoords The lat & long of the top left corner of the grid
 * @param {coordinate pair} targetCoords The lat & long of the location that is being converted to a grid index
 * @return {index object} An object containing the zero-indexed column and row number for the grid index of the target location
 */
function getGridIndex(resolution, originCoords, targetCoords) {
    /*
    * Layout of coordinates:
    * originCoords -------------------- sameLngCoords
    *       |                                  |
    *       |                                  |
    *       |                                  |
    * sameLatCoords -------------------- targetCoords
    * 
    * Note: Due to the curvature of the earth, the actual shape bounded by the four
    * points may not be exactly rectangular, however it should be close enough
    * for small distances.
    */
    const sameLatCoords = {lng:originCoords.lng, lat:targetCoords.lat};
    const sameLngCoords = {lng:targetCoords.lng, lat:originCoords.lat};

    const latDistance = Math.abs(haversineDistance(originCoords, sameLatCoords));
    const lngDistance = Math.abs(haversineDistance(originCoords, sameLngCoords));
    const colNum = Math.floor(latDistance / resolution);
    const rowNum = Math.floor(lngDistance / resolution);
    const index = {col:colNum, row:rowNum};
    return index;
}

/**
 * Returns the distance between two coordinate points in metres,
 * taking into account the curvature of the earth
 */
function haversineDistance(point1, point2) {
    const R = 6370e3; // Radius of the Earth in metres
    const rlat1 = degToRad(point1.lat);
    const rlat2 = degToRad(point2.lat);
    const difflat = rlat2 - rlat1;
    const difflon = degToRad(point2.lng-point1.lng);

    const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2)*Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2)*Math.sin(difflon / 2)));
    return d;
}

function calcLngFromWEDist(lng1, distance) {
    return lng1 + distance / 92000;
}

function calcLatFromNSDist(lat1, distance) {
    return lat1 - distance / 110000;
}

function calcCellCoords(originCoords, rowNum, colNum, resolution) {
    const nsDistance = resolution / 2 + resolution * rowNum;
    const weDistance = resolution / 2 + resolution * colNum;
    return {lat:calcLatFromNSDist(originCoords.lat, nsDistance), lng:calcLngFromWEDist(originCoords.lng, weDistance)};
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
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