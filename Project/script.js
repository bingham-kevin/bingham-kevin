/* API info */
const apiKey = "d4fb5f3d39fd411cbb3205304182111";
const weatherUrl = "https://api.apixu.com/v1/current.json?key=";

const geoApi = "&apikey=e72d98ec79024cd5b1fd1f39f75d0b81&format=json&notStore=false&version=4.10";
const geoUrl = "https://geoservices.tamu.edu/Services/ReverseGeocoding/WebService/v04_01/Rest/?";

/*Get current location*/
var latitude = 0;
var longitude = 0;
var lat;
var lon;

var currLoc = document.getElementById('currentLocation');

function currentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    currLoc.innerHTML = "Geolocation is not supported by this browser.";
  }
  formatLoc();
};

function showPosition(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
};

currLoc.addEventListener('touchstart', currentLocation);
currLoc.addEventListener('click', currentLocation);

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};
var lat;
var lon;

function formatLoc() {
  if (latitude != 0 && longitude != 0) {
    lat = round(latitude, 2);
    lon = round(longitude, 2);
  }
  getLocRequest();
};

var objectResponse;

function getWeatherRequest(location) {
  var url = weatherUrl + apiKey + "&q=" + location;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      objectResponse = JSON.parse(this.responseText);
    } else if (xhr.readyState != XMLHttpRequest.DONE) {
      console.log('There was an error ' + this.status + this.statusText)
    }
  }
  xhr.open('GET', url, true);
  xhr.send();
  //document.getElementById('locationFav').innerHTML = objectResponse[1];
};

function getLocRequest() {
  var url = geoUrl + "lat=" + lat + "&lon=" + lon + geoApi;
  var locResponse;
  var location;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      locResponse = JSON.parse(this.responseText);
      location = locResponse.StreetAddresses[0].City;
    } else if (xhr.readyState != XMLHttpRequest.DONE) {
      console.log('There was an error ' + this.status + this.statusText)
    }
  }
  xhr.open('GET', url, true);
  xhr.send();
  getWeatherRequest(location);
};

/* Search Location */
var search = document.getElementById('searchBox');

function searchLocation() {
  currLoc.innerHTML = search.value;
};

document.getElementById('locationButton').addEventListener('touchend', searchLocation);