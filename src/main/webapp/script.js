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

function toggleAQLayer() {
    const checkbox = document.getElementById("aq-layer-toggle");
    
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