let map;
let aqLayer;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.775, lng: -122.434 },
        zoom: 8,
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

function closeSidebar() {
    document.getElementById("close-sidebar").style.display = "none";
    document.getElementById("open-sidebar").style.display = "inline-block";

    document.getElementById("sidebar").style.visibility = "hidden";
}

function openSidebar() {
    document.getElementById("close-sidebar").style.display = "inline-block";
    document.getElementById("open-sidebar").style.display = "none";

    document.getElementById("sidebar").style.visibility = "visible";
}