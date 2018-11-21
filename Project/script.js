/* API info */
const apiKey = "&APPID=97afec932383104561d92e3b162e110c";
const openWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?";

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
  console.log(lat +","+lon);
  getRequest();
};

currLoc.addEventListener('touchstart', currentLocation);
currLoc.addEventListener('click', currentLocation);

function getRequest() {
 var url = openWeatherUrl + "lat=" + lat + "&lon=" + lon + apiKey;
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
};
/* Search Location */
var search = document.getElementById('searchBox');

function searchLocation(){
  currLoc.innerHTML = search.value;
};

document.getElementById('locationButton').addEventListener('touchend', searchLocation);
