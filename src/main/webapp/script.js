let zoomedIn = false;
let aqLayerOn = true;
let routeVisible = false;

function changeBackgroundImage(imagePath) {
    document.body.style.backgroundImage = `url('${imagePath}')`;
}

function getImagePath() {
    let path = "";
    if (zoomedIn) {
        path = "/images/wagga_";
    } else {
        path = "/images/nsw_";
    }

    if (aqLayerOn) {
        path += "gradient";
    } else {
        path += "plain";
    }

    if (routeVisible) {
        path += "_route.png";
    } else {
        path += ".png";
    }

    return path;
}

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

    changeBackgroundImage(getImagePath());
}

function hideRoutes() {
    routeVisible = false;

    document.getElementById("close-directions").style.visibility = "hidden";

    document.getElementById("route-info").style.visibility = "hidden";

    changeBackgroundImage(getImagePath());
}

function showRoutes() {
    zoomedIn = false; //images do not exist for a zoomed in route view in the current prototype
    document.getElementById("location-info").style.visibility = "hidden";

    routeVisible = true;

    document.getElementById("close-directions").style.visibility = "visible";

    document.getElementById("route-info").style.visibility = "visible";

    changeBackgroundImage(getImagePath());
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

    zoomedIn = true;

    routeVisible = false; //no image available for zoomed in and routes visible
    document.getElementById("close-directions").style.visibility = "hidden";
    document.getElementById("route-info").style.visibility = "hidden";

    changeBackgroundImage(getImagePath());
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