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
    const directionsRenderer = new google.maps.DirectionsRenderer();
    const directionsService = new google.maps.DirectionsService();
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
    new AutocompleteDirectionsHandler(map);
}

class AutocompleteDirectionsHandler {
    constructor(map) {
        this.map = map;
        this.originPlaceId = "";
        this.destinationPlaceId = "";
        this.travelMode = google.maps.TravelMode.WALKING; ////BECASE  HERE DONT HAVE IN INDEX 
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer();
        this.directionsRenderer.setMap(map);
        // Put directions in the directions panel
        directionsRenderer.setPanel(document.getElementById("direction-panel"));

        // Retrieve what was input by user 
        const searchbar = document.getElementById("location-search-bar");
        searchMarker = new google.maps.Marker({
            map,
            anchorPoint: new google.maps.Point(0,-29), // position the marker icon relative to the origin
        });
        searchMarker.setVisible(false);

        const originInput = document.getElementById("origin-search-bar");
        const destinationInput = document.getElementById("destination-search-bar");
        const modeSelector = document.getElementById("mode-selector"); ////BECASE  HERE DONT HAVE IN INDEX 

        // Initialise places autocomplete in search bar
        const autocomplete = new google.maps.places.Autocomplete(searchbar);
        autocomplete.setFields(["geometry","name", "place_id"]);
        const originAutocomplete = new google.maps.places.Autocomplete(originInput);
        originAutocomplete.setFields(["place_id"]);
        const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
        destinationAutocomplete.setFields(["place_id"]);


        //for individual search and marker function, temporarily contained here for test runs
        autocomplete.addListener("place_changed", () => {
            searchMarker.setVisible(false);
            const place = autocomplete.getPlace(); //THE PLACE THAT IS AUTOCOMPLETED -> for marker and single search piuposes

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

        this.setupClickListener(
            "changemode-walking",
            google.maps.TravelMode.WALKING
        );
        this.setupClickListener(
            "changemode-transit",
            google.maps.TravelMode.TRANSIT
        );
        this.setupClickListener(
            "changemode-driving",
            google.maps.TravelMode.DRIVING
        );
        
        //put in user inputs and calculate direction
        this.setupPlaceChangedListener(originAutocomplete, "ORIG");
        this.setupPlaceChangedListener(destinationAutocomplete, "DEST");

        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);

        // Initialise visualisation
        populateAQVisualisationData();

        const aqLayerControlDiv = document.createElement("div");
        aqLayerControl(aqLayerControlDiv, map);
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(aqLayerControlDiv);

    }

    // Sets a listener on a radio button to change the travel mode on Places Autocomplete.
    //NOT IMPLEMENTED IN HTML YET 
    setupClickListener(id, mode) {
        const radioButton = document.getElementById(id);
        radioButton.addEventListener("click", () => {
          this.travelMode = mode;
          this.route();
        });
    }

    setupPlaceChangedListener(autocompletedInput, journeyPoint) {
        autocompletedInput.bindTo("bounds", this.map);
        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
      
            if (!place.place_id) {
              window.alert("Please select an option from the dropdown list.");
              return;
            }
      
            if (journeyPoint === "ORIG") {
              this.originPlaceId = place.place_id;
            } else {
              this.destinationPlaceId = place.place_id;
            }
            this.route();
          });
    }

    route() {
        if (!this.originPlaceId || !this.destinationPlaceId) {
            return;
        }
        const me = this;
        this.directionsService.route(
            {
                origin: { placeId: this.originPlaceId },
                destination: { placeId: this.destinationPlaceId },
                travelMode: this.travelMode,
            },
            (response, status) => {
                if (status === "OK") {
                    me.directionsRenderer.setDirections(response);
                } else {
                    window.alert("Directions request failed due to " + status);
                }
            }
        );   
    }
}

/*

        // Call setMap() on DirectionsRenderer to bind it to the passed map. 
        directionsRenderer.setMap(map);
        // Put directions in the directions panel
        directionsRenderer.setPanel(document.getElementById("direction-panel"));
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
            const place = autocomplete.getPlace(); //THE PLACE THAT IS AUTOCOMPLETED -> for marker and single search piuposes

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

        //Calculate and Display routes from origin to destination
        const onChangeHandler = function () {
            calculateAndDisplayRoute(directionsService, directionsRenderer);
        };
        //BE CARE OF HER ID START AND END HERE!!!!!!!!!!!!!! ==================
        document.getElementById("start").addEventListener("change", onChangeHandler); //=========
        document.getElementById("end").addEventListener("change", onChangeHandler); ////========
    }
*/

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    const start = document.getElementById("start").value;
    const userStartInput = document.getElementById("location-info");
    const end = document.getElementById("end").value;
    directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
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

function setEndpoint(place) {
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