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
        center: new google.maps.LatLng(-34.397, 150.644),
        zoom: 8,
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
        },
        streetViewControl: false,
        fullscreenControl: false,
    });

    loadAQVisualisationData();

    const aqLayerControlDiv = document.createElement("div");
    aqLayerControl(aqLayerControlDiv, map);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(aqLayerControlDiv);
}

function toggleAQLayer() {
    aqLayer.setMap(aqLayer.getMap() ? null : map);
}

function loadAQVisualisationData() {
    fetch("/visualisation").then(response => response.json()).then((data) => {
        const aqData = [];
        for (i = 0; i < data.length; i++) {
            const dataItem = data[i];
            let dataPoint = {};
            dataPoint.location = new google.maps.LatLng(data[i].lat,data[i].long);
            dataPoint.weight = dataItem.aqi;
            aqData.push(dataPoint);
        }
        aqData.push({location: new google.maps.LatLng(-37.785, 150.435), weight: 3})
        loadHeatmap(aqData);
    });
}

function loadHeatmap(data) {
    let aqLayer = new google.maps.visualization.HeatmapLayer({
        data: data,
    });
    aqLayer.setMap(map);
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
        toggleButton.innerHTML = "<i class=material-icons>navigate_next</i>";
        toggleButton.style.left = "5px";
    } else {
        sidebar.style.visibility = "visible";
        toggleButton.innerHTML = "<i class=material-icons>navigate_before</i>";
        toggleButton.style.left = "300px";
    }
}