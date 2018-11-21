/* API info */
const apiKey = "d4fb5f3d39fd411cbb3205304182111";
const openWeatherUrl = "https://api.apixu.com/v1/current.json?key=";

/*Get current location*/
var latitude = 0;
var longitude = 0;
var lat;
var lon;

var currLoc = document.getElementById('currentLocation');

function currentLocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(showPosition);
  }else{
    currLoc.innerHTML = "Geolocation is not supported by this browser.";
  }
  showPosition();
};

function showPosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    formatLoc();
  };

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
};

function formatLoc(){
  if(latitude != 0 && longitude != 0){
    lat = round(latitude, 6);
    lon = round(longitude, 6);
  }
  getRequest();
};

currLoc.addEventListener('touchstart', currentLocation);
currLoc.addEventListener('click', currentLocation);

function getRequest() {
 var url = openWeatherUrl + apiKey +"&q=Phoenix" ;
  var xhr = new XMLHttpRequest();
  var objectResponse;
  xhr.onreadystatechange = function() {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      objectResponse = JSON.parse(this.responseText);
    } else if (xhr.readyState != XMLHttpRequest.DONE) {
      console.log('There was an error ' + this.status + this.statusText)
    }
  }
  xhr.open('GET', url, true);
  xhr.send();
  console.log(objectResponse);
};
/* Search Location */
var search = document.getElementById('searchBox');

function searchLocation(){
  currLoc.innerHTML = search.value;
};

document.getElementById('locationButton').addEventListener('touchend', searchLocation);
