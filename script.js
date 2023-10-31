document.addEventListener("DOMContentLoaded", function () {
    const birdEntryForm = document.getElementById("bird-entry-form");
    const birdNameInput = document.getElementById("bird-name");
    const birdCountInput = document.getElementById("bird-count");
    const locationInput = document.getElementById("location");
    const birdList = document.getElementById("bird-names");
    const mapDiv = document.getElementById("map");

    // Initialize the map
    const map = L.map(mapDiv).setView([0, 0], 2); // Default view

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
    }).addTo(map);

    let marker;

    // Variable to track if manual location mode is enabled
    let isManualLocationMode = false;

    // Function to update the list with the stored bird data
    function updateBirdList() {
        birdList.innerHTML = ""; // Clear the list
        birdDataArray.forEach(function (birdData) {
            const listItem = document.createElement("li");
            listItem.textContent = `${birdData.name} (Count: ${birdData.count}) - Location: ${birdData.location}`;
            birdList.appendChild(listItem);
        });
    }

    // Initialize the bird data array with data from localStorage
    const birdDataArray = JSON.parse(localStorage.getItem("birdDataArray")) || [];

    // Function to save bird data to localStorage
    function saveBirdDataToStorage() {
        localStorage.setItem("birdDataArray", JSON.stringify(birdDataArray));
    }

    // Function to add bird data to the array and update the list
    function addBirdData(birdName, birdCount, location) {
        const birdData = {
            name: birdName,
            count: birdCount,
            location: location,
        };
        birdDataArray.push(birdData);
        updateBirdList();
        saveBirdDataToStorage(); // Save to localStorage

        // Clear the form inputs
        birdNameInput.value = "";
        birdCountInput.value = "";
        locationInput.value = "";
        if (marker) {
            map.removeLayer(marker); // Remove the existing marker
        }
    }

    // Submit form data
    birdEntryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const birdName = birdNameInput.value.trim();
        const birdCount = birdCountInput.value.trim();
        const location = locationInput.value.trim();

        if (birdName && birdCount && location) {
            addBirdData(birdName, birdCount, location);
        } else {
            alert("Please fill in all fields.");
        }
    });

    // Download the bird list as a JSON file
    const downloadButton = document.getElementById("download-list");
    downloadButton.addEventListener("click", function () {
        if (birdDataArray.length > 0) {
            const data = JSON.stringify(birdDataArray, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "bird_list.json";
            document.body.appendChild(a);
            a.click();

            // Clean up
            window.URL.revokeObjectURL(url);
        } else {
            alert("The bird list is empty.");
        }
    });

    // Toggle manual location input
    const manualLocationToggle = document.getElementById("manual-location-toggle");
    const manualLocationGroup = document.getElementById("manual-location-group");

    manualLocationToggle.addEventListener("click", () => {
        isManualLocationMode = !isManualLocationMode;

        if (isManualLocationMode) {
            manualLocationGroup.style.display = "block";
            locationInput.value = ""; // Clear the automatic location
            if (marker) {
                map.removeLayer(marker); // Remove the existing marker
            }
        } else {
            manualLocationGroup.style.display = "none";
        }
    });

    // Handle map click events in manual location mode
    map.on("click", function (e) {
        if (isManualLocationMode) {
            const latitude = e.latlng.lat.toFixed(6);
            const longitude = e.latlng.lng.toFixed(6);
            const locationString = `Latitude: ${latitude}, Longitude: ${longitude}`;
            locationInput.value = locationString;

            // Add a marker to the map
            if (marker) {
                map.removeLayer(marker); // Remove the existing marker
            }
            marker = L.marker([latitude, longitude]).addTo(map);
        }
    });

    // Get location when "Get Location" button is clicked in automatic location mode
const getLocationButton = document.getElementById("get-location");
getLocationButton.addEventListener("click", () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const locationString = `Latitude: ${latitude}, Longitude: ${longitude}`;
            locationInput.value = locationString;

            // Add a marker to the map for the automatic location
            if (marker) {
                map.removeLayer(marker); // Remove the existing marker
            }
            marker = L.marker([latitude, longitude]).addTo(map);
        });
    } else {
        locationInput.value = "Geolocation is not supported in this browser.";
    }
});

    // Initialize manual location mode to off
    manualLocationToggle.click();
});