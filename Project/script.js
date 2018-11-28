/* API info */
const apiKey = "d4fb5f3d39fd411cbb3205304182111";
const weatherUrl = "https://api.apixu.com/v1/current.json?key=";

const geoApi = "&apikey=e72d98ec79024cd5b1fd1f39f75d0b81&format=json&notStore=false&version=4.10";
const geoUrl = "https://geoservices.tamu.edu/Services/ReverseGeocoding/WebService/v04_01/Rest/?";
const decimalPlaces = 2;

/*Get current location
var latitude = 0;
var longitude = 0;
*/
/*
var lat = round(latitude, decimalPlaces);
var lon = round(longitude, decimalPlaces);
*/
var currLoc = document.getElementById('currentLocation');

function getLocation(callback) {
  if (navigator.geolocation) {
    var lat_lng = navigator.geolocation.getCurrentPosition(function(position) {
      console.log(position);
      var user_position = {};
      user_position.lat = position.coords.latitude;
      user_position.lng = position.coords.longitude;
      callback(user_position);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}
getLocation(function(lat_lng) {
  console.log(lat_lng);
});

currLoc.addEventListener('touchstart', currentLocation, true);
currLoc.addEventListener('click', gpsWeather(getRequest));

/* Format Numbers */
function round(value, decimals) {
  if (value != 0) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  }
};

//var url = weatherUrl + apiKey + "&q=" + zipCode;
//var url = geoUrl + "lat=" + lat + "&lon=" + lon + geoApi;
//location = locResponse.StreetAddresses[0].Zip;
//document.getElementById('locationFav').innerHTML = JSON.stringify(objectResponse);

function getRequest(url) {
  var xhr = new XMLHttpRequest();
  var objectResponse;
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      objectResponse = JSON.parse(this.responseText);
      return objectResponse;
    } else if (xhr.readyState != XMLHttpRequest.DONE) {
      console.log('There was an error ' + this.status + this.statusText)
    }
  }
  xhr.open('GET', url, true);
  xhr.send();
};
/*
getLocation(function(lat_lng) {
  var userCoords = "lat=" + round(userPosition.lat, 2) + "&lon=" + round(userPosition.lng, 2);
  return userCoords;
})
*/

function gpsWeather(callback) {
  var geoLoc = getLocation(function(lat_lng) {
    return "lat=" + round(lat_lng.lat, 2) + "&lon=" + round(lat_lng.lng, 2);
  });
  var getUrl = geoUrl + geoLoc + geoApi;
  alert(callback(getUrl).StreetAddresses[0].Zip);
};
/* Search Location */
var search = document.getElementById('searchBox');

function searchLocation() {
  currLoc.innerHTML = search.value;
};

document.getElementById('locationButton').addEventListener('touchend', searchLocation, true);
document.getElementById('locationButton').addEventListener('click', searchLocation);