/* API info */
const apiKey = "&APPID=97afec932383104561d92e3b162e110c";
const openWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?";

/*Get current location*/
var latitude = 0;
var longitude = 0;

var currLoc = document.getElementById('currentLocation');

function currentLocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(showPosition);
  }else{
    currLoc.innerHTML = "Geolocation is not supported by this browser.";
  }
  getRequest();
};

function showPosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
  };

  function getRequest() {
    var url = openWeatherUrl + "lat=" + latitude + "&lon=" + longitude + apiKey;
    var xhr = new XMLHttpRequest();
    var objectResponse;
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        objectResponse = this.responseText;
      } else if (xhr.readyState != XMLHttpRequest.DONE) {
        console.log('There was an error ' + this.status + this.statusText)
      }
    }
    
    xhr.open('GET', url, true);
    xhr.send();
  console.log(JSON.stringify(objectResponse));
  };

currLoc.addEventListener('touchstart', currentLocation);
currLoc.addEventListener('click', currentLocation);

/* Search Location */
var search = document.getElementById('searchBox');

function searchLocation(){
  currLoc.innerHTML = search.value;
};

document.getElementById('locationButton').addEventListener('touchend', searchLocation);
