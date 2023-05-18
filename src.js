window.initMap = initMap;

function initMap() {
  const map0 = new google.maps.Map(document.getElementById("map0"), {
    center: { lat: -43.532, lng: 172.6306 },
    zoom: 13,
    mapTypeControl: false,
  });
  const map1 = new google.maps.Map(document.getElementById("map1"), {
    center: { lat: 43.3623, lng: -8.4115 },
    zoom: 13,
    mapTypeControl: false,
  });
  const input = document.getElementById("user-location");
  const options = {
    fields: ["formatted_address", "geometry", "name"],
    strictBounds: false,
  };

  const autocomplete = new google.maps.places.Autocomplete(input, options);

  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById("infowindow-content");

  const antipodeInfowindow = new google.maps.InfoWindow();
  const antipodeInfowindowContent = document.getElementById(
    "antipode-infowindow-content"
  );

  infowindow.setContent(infowindowContent);
  antipodeInfowindow.setContent(antipodeInfowindowContent);

  const marker0 = new google.maps.Marker({
    map0,
    anchorPoint: new google.maps.Point(0, -29),
  });

  const marker1 = new google.maps.Marker({
    map1,
    anchorPoint: new google.maps.Point(0, -29),
  });

  function updateMap(place) {
    toggleMarkerVisibility(marker0);
    toggleMarkerVisibility(marker1);

    //Handle how the place is presented on the map
    if (!place.geometry || !place.geometry.location) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }
    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map0.fitBounds(place.geometry.viewport);
    } else {
      map0.setCenter(place.geometry.location);
      map0.setZoom(17);
    }

    marker0.setMap(map0);
    marker0.setPosition(place.geometry.location);
    toggleMarkerVisibility(marker0);
    infowindowContent.children["place-name"].textContent = place.name;
    infowindowContent.children["place-address"].textContent =
      place.formatted_address;
    document.getElementById("place0-coordinates").textContent =
      "Coordinates: " +
      place.geometry.location.lat().toFixed(5) +
      ", " +
      place.geometry.location.lng().toFixed(5);

    const antipodalCoordinates = getAntipodalCoordinates(
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );

    const formattedAntipodalCoordinates =
      formatCoordinates(antipodalCoordinates);

    document.getElementById("place1-coordinates").textContent =
      "Coordinates: " +
      antipodalCoordinates[0].toFixed(5) +
      ", " +
      antipodalCoordinates[1].toFixed(5);

    const geocoder2 = new google.maps.Geocoder();

    async function codeAddress() {
      return new Promise((resolve, reject) => {
        geocoder2.geocode(
          { location: formattedAntipodalCoordinates },
          function (results, status) {
            if (status == "OK") {
              resolve(results);
            } else {
              reject(status);
            }
          }
        );
      });
    }

    codeAddress();

    function codeAddress() {
      geocoder2.geocode(
        { location: formattedAntipodalCoordinates },
        function (results, status) {
          if (status == "OK") {
            if (results[1]) {
              var index = 0;
              for (var i = 0; i < results.length - 1; i++) {
                if (results[i].types[0] == "locality") {
                  index = i;
                  break;
                }
              }
              var [city, region, country] = ["", "", ""];
              for (var j = 0; j < results[i].address_components.length; j++) {
                if (results[i].address_components[j].types[0] == "locality") {
                  //this is the object you are looking for City
                  city = results[i].address_components[j].long_name;
                }
                if (
                  results[i].address_components[j].types[0] ==
                  "administrative_area_level_1"
                ) {
                  //this is the object you are looking for State
                  region = results[i].address_components[j].long_name;
                }
                if (results[i].address_components[j].types[0] == "country") {
                  //this is the object you are looking for
                  country = results[i].address_components[j].long_name;
                }
              }
              address = [city, region, country].filter(Boolean).join(", ");
            } else {
              address = getWaterQuote();
            }
            antipodeInfowindowContent.children[
              "antipode-place-address"
            ].textContent = address;
          } else {
            alert("Geocode was not successful");
          }
        }
      );
    }
    antipodeInfowindow.open(map1, marker1);
    map1.setCenter(new google.maps.LatLng(formattedAntipodalCoordinates));
    marker1.setPosition(formattedAntipodalCoordinates);
    toggleMarkerVisibility(marker1);
    marker1.setMap(map1);
    infowindow.open(map0, marker0);
  }

  function toggleMarkerVisibility(marker) {
    marker.setVisible(!marker.getVisible());
  }

  function getAntipodalCoordinates(lat, lng) {
    antipodalLat = -lat;
    const antipodalLng = lng >= 0 ? lng - 180 : lng + 180;
    return [antipodalLat, antipodalLng];
  }

  function formatCoordinates(coordinates) {
    //Format coordinates for reverse geocoding
    const formattedCoordinates = {
      lat: coordinates[0],
      lng: coordinates[1],
    };
    return formattedCoordinates;
  }

  async function searchPlace(query) {
    const service = new google.maps.places.PlacesService(map0);
    return new Promise((resolve, reject) => {
      service.textSearch({ query: query }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const place = results[0];
          resolve(place);
        } else {
          const error = new Error("Place searche failed");
          reject(error);
        }
      });
    });
  }

  const examples = document.querySelectorAll(".example");
  examples.forEach((example) => {
    example.addEventListener("click", (event) => {
      const text = event.target.textContent.split("-")[0];
      searchPlace(text).then((place) => {
        updateMap(place);
        var target = document.getElementById("map0");
        target.scrollIntoView({ behavior: "smooth" });
      });
    });
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    updateMap(place);
  });
}
const waterQuotes = [
  "Thousands have lived without love, not one without water",
  "When the well is dry, we know the worth of water",
  "Water, water everywhere, but not a drop to drink...",
  "At least there's plenty of vitamin sea",
  "Don't forget that 71% of the Earth's surface is water",
];

function getWaterQuote() {
  quote = waterQuotes[Math.floor(Math.random() * waterQuotes.length)];
  return quote;
}
