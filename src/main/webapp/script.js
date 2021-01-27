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
    // Initialise places autocomplete in search bar
    const searchbar = document.getElementById("location-search-bar");
    const searchMarker = new google.maps.Marker({
        map,
        anchorPoint: new google.maps.Point(0,-29),
    });
    searchMarker.setVisible(false);
    const autocomplete = new google.maps.places.Autocomplete(searchbar);
    autocomplete.setFields(["address_components","geometry","icon","name"]);
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
        searchMarker.setPosition(place.geometry.location);
        searchMarker.setVisible(true);
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


// UUID v4 generation
function generateNewUUID() {
    const templateString = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    let uuid = "";

    for (char of templateString) {
        newChar = char;
        if (char === "x") {
            newChar = genRandomIntInclusive(0, 15).toString(16);
        }
        if (char === "y") {
            newChar = genRandomIntInclusive(8, 11).toString(16);
        }
        uuid += newChar;
    }

    return uuid;
}

// min and max are inclusive positive integer bounds
function genRandomIntInclusive(min, max) {
    const randomBuffer = new Uint8Array(1);

    window.crypto.getRandomValues(randomBuffer);

    let randomNumber = randomBuffer[0] / 0xff; //convert to be between 0 and 1

    return Math.floor(randomNumber * (max - min)) + min;
}