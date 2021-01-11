var zoomedIn = false;
var aqLayerOn = true;
var routeVisible = false;

function changeBackgroundImage(imagePath) {
    document.body.style.backgroundImage = "url('" + imagePath + "')";
}

function getImagePath() {
    path = "";
    if (zoomedIn) {
        path = "images/wagga_";
    } else {
        path = "images/nsw_";
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
function toggleAQLayer() {
    checkbox = document.getElementById("aq-layer-toggle");
    
    aqLayerOn = checkbox.checked;

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
    routeVisible = true;

    document.getElementById("close-directions").style.visibility = "visible";

    document.getElementById("route-info").style.visibility = "visible";

    changeBackgroundImage(getImagePath());
}

function searchLocation() {
    location = document.getElementById("location-search-bar").value;
    console.log(location)
}
