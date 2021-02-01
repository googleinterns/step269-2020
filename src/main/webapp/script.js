let map;
let aqLayer;
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

        setEndpoint(place);
    })
    // Initialise visualisation
    populateAQVisualisationData();

    const aqLayerControlDiv = document.createElement("div");
    aqLayerControl(aqLayerControlDiv, map);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(aqLayerControlDiv);
}

function toggleAQLayer() {
    aqLayer.setMap(aqLayer.getMap() ? null : map);
}

function populateAQVisualisationData() {
    let fetchURL = "/visualisation";
    fetchURL += `?zoom-level=${map.getZoom()}`;
    const mapBounds = map.getBounds();
    const swCorner = mapBounds[0];
    const neCorner = mapBouns[1];
    fetchURL += `&sw-lat=${swCorner.lat()}`;
    fetchURL += `&sw-long=${swCorner.long()}`;
    fetchURL += `&ne-lat=${neCorner.lat()}`;
    fetchURL += `&ne-long=${neCorner.long()}`;
    console.log(fetchURL);
    fetch(fetchURL).then(response => response.json()).then((data) => {
        const aqData = convertGriddedDataToWeightedPoints(data);
        loadHeatmap(aqData);
    });
}

function loadHeatmap(data) {
    aqLayer = new google.maps.visualization.HeatmapLayer({
        data: data,
        gradient: [
            "rgba(65,169,60,0)",
            "rgba(65, 169, 60, 1)",
            "rgba(238, 201, 0, 1)",
            "rgba(228, 116, 0, 1)",
            "rgba(186, 0, 41, 1)",
            "rgba(86, 3, 23, 1)",
        ],
        maxIntensity: 200,
    });
    aqLayer.setMap(map);
}

// This function is not complete
function convertGriddedDataToWeightedPoints(griddedData) {
    let weightedPoints = [];
    return weightedPoints;
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
    const colNum = Math.floor(latDistance/resolution);
    const rowNum = Math.floor(lngDistance/resolution);
    const index = {col:colNum, row:rowNum};
    return index;
}

function haversineDistance(point1, point2) {
    const R = 6371.0710; // Radius of the Earth in kilometres
    const rlat1 = mk1.position.lat * (Math.PI/180); // Convert degrees to radians
    const rlat2 = mk2.position.lat * (Math.PI/180); // Convert degrees to radians
    const difflat = rlat2-rlat1; // Radian difference (latitudes)
    const difflon = (point2.lng-point1.lng) * (Math.PI/180); // Radian difference (longitudes)

    const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
    return d;
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