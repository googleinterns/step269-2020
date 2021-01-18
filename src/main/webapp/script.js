let map;
let aqLayer;

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
        center: { lat: 37.775, lng: -122.434 },
        zoom: 13,
        // zoom for nsw view
        // center: { lat: -34.397, lng: 150.644 },
        //zoom: 8,
        mapTypeControl: true,
        mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT,
        },
        streetViewControl: false,
        fullscreenControl: false,
    });

    const heatmapData = [
        {location: new google.maps.LatLng(37.782, -122.447), weight: 0.5},
        new google.maps.LatLng(37.782, -122.445),
        {location: new google.maps.LatLng(37.782, -122.443), weight: 2},
        {location: new google.maps.LatLng(37.782, -122.441), weight: 3},
        {location: new google.maps.LatLng(37.782, -122.439), weight: 2},
        new google.maps.LatLng(37.782, -122.437),
        {location: new google.maps.LatLng(37.782, -122.435), weight: 0.5},
        {location: new google.maps.LatLng(37.785, -122.447), weight: 3},
        {location: new google.maps.LatLng(37.785, -122.445), weight: 2},
        new google.maps.LatLng(37.785, -122.443),
        {location: new google.maps.LatLng(37.785, -122.441), weight: 0.5},
        new google.maps.LatLng(37.785, -122.439),
        {location: new google.maps.LatLng(37.785, -122.437), weight: 2},
        {location: new google.maps.LatLng(37.785, -122.435), weight: 3}
    ];
    aqLayer = new google.maps.visualization.HeatmapLayer({
        data: heatmapData
    });
    aqLayer.setMap(map);

    const aqLayerControlDiv = document.createElement("div");
    aqLayerControl(aqLayerControlDiv, map);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(aqLayerControlDiv);
}

function toggleAQLayer() {
    aqLayer.setMap(aqLayer.getMap() ? null : map);
}

function searchLocation() {
    const locationString = document.getElementById("location-search-bar").value;

    const locationInfo = document.getElementById("location-info");
    locationInfo.style.visibility = "visible";

    if (locationString !== "wagga wagga") {
        locationInfo.innerHTML = "The only location supported by this prototype is `wagga wagga`";
        return;
    }

    htmlString = ""
    htmlString += "<h3>Wagga Wagga</h3>\n";
    htmlString += "<p>Current AQ score: 40 (Pretty good)</p>\n";
    locationInfo.innerHTML = htmlString;
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
    const sidebarVisibility = window.getComputedStyle(sidebar).getPropertyValue("visibility");
    
    if (sidebarVisibility === "visible") {
        sidebar.style.visibility = "hidden";
        toggleButton.innerHTML = "open sidebar";
        toggleButton.style.left = "5px";
    } else {
        sidebar.style.visibility = "visible";
        toggleButton.innerHTML = "close sidebar";
        toggleButton.style.left = "300px";
    }
}