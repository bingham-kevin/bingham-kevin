/* API info */
const dsKey = "e15447b0a2e5880dd508fdd93b7b9268";
const dsUrl = "https://api.darksky.net/forecast/";

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
    return latitude + ","+ longitude;
  };
  function getRequest() {
    var url = dsUrl + dsKey + "/" + latitude + "," + longitude;
    var xhr = new XMLHttpRequest();
    var objectResponse = {};
    xhr.onreadystatechange = function() {
      if (xhr.readyState == XMLHttpRequest.DONE) {
        objectResponse = JSON.parse(this.responseText);
        console.log(objectResponse);
      } else if (xhr.readyState != XMLHttpRequest.DONE) {
        console.log('There was an error ' + this.status + this.statusText)
      }
    }
    xhr.open('GET', url, true);
    xhr.send();
  };

currLoc.addEventListener('touchstart', currentLocation);


/* Search Location */
var search = document.getElementById('searchBox');

function searchLocation(){
  currLoc.innerHTML = search.value;
};

document.getElementById('locationButton').addEventListener('touchend', searchLocation);
