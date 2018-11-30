/* API info */
const apiKey = "d4fb5f3d39fd411cbb3205304182111";
const currWeatherUrl = "https://api.apixu.com/v1/current.json?key=";
const foreWeatherUrl = "https://api.apixu.com/v1/forecast.json?key=";
const geoApi = "&apikey=e72d98ec79024cd5b1fd1f39f75d0b81&format=json&notStore=false&version=4.10";
const geoUrl = "https://geoservices.tamu.edu/Services/ReverseGeocoding/WebService/v04_01/Rest/?";

let currentZipCode;

function toggleNavMenu() {
  document.getElementById('favoriteList').classList.toggle('hide');
}
//Check for local storage

//Get Current Coordinates of the Device
function getLocation() {
  return new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        resolve(position);
      },
      function(error) {
        reject(error);
      }
    )
  })
};

//Helper Functions
function round(value) {
  let decimals = 2;
  let objectResponse = {};
  objectResponse.myLat = Number(Math.round(value.latitude + 'e' + decimals) + 'e-' + decimals);
  objectResponse.myLong = Number(Math.round(value.longitude + 'e' + decimals) + 'e-' + decimals);
  return objectResponse;
};

function geoCodeUrl(result) {
  let getUrl = geoUrl + "lat=" + result.myLat + "&lon=" + result.myLong + geoApi;
  return getUrl;
};

function getWeatherUrl(zipCode) {
  let currentUrl = currWeatherUrl + apiKey + "&q=" + zipCode;
  return currentUrl;
};

function getForecastUrl(forecastZipCode) {
  let forecastUrl = foreWeatherUrl + apiKey + "&q=" + forecastZipCode;
  return forecastUrl;
};

function weatherLoc(currentUrl) {
  return fetch(currentUrl)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject({
          status: response.status,
          statusText: response.statusText
        })
      }
    })
    .catch(error => {
      if (error.status === 404) {
        console.log('404 Error')
      }
    })
};

function getRequest(url) {
  return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject({
          status: response.status,
          statusText: response.statusText
        })
      }
    })
    .catch(error => {
      if (error.status === 404) {
        console.log('404 Error')
      }
    })
};

function weatherData(data) {
  document.getElementById('city').innerHTML = data.location.name;
  document.getElementById('currentTemp').innerHTML = data.current.temp_f + "&deg;";
  document.getElementById('condition').innerHTML = data.current.condition.text;
  document.getElementById('condIcon').innerHTML = '<img src="https:' + data.current.condition.icon + '">';
};

function forecastWeather(data) {
  let forecast = data.forecast.forecastday[0].day;
  document.getElementById('high').innerHTML = "High: " + forecast.maxtemp_f.toFixed(0) + "&deg; F";
  document.getElementById('low').innerHTML = "Low: " + forecast.mintemp_f.toFixed(0) + "&deg; F";
};

function srchWeather(searchData) {
  document.getElementById('zipcode').innerHTML = currentZipCode;
  document.getElementById('city').innerHTML = searchData.location.name;
  document.getElementById('currentTemp').innerHTML = searchData.current.temp_f + "&deg;";
  document.getElementById('condition').innerHTML = searchData.current.condition.text;
  document.getElementById('condIcon').innerHTML = '<img src="https:' + searchData.current.condition.icon + '">';
};

function getCityWeather() {
  return new Promise(function(resolve, reject) {
    let value = true;
    if (true) {
      let zipCode = document.getElementById('searchBox').value;
      resolve(zipCode);
    } else {
      reject(error);
    }
  })
};

// Get local weather & local forecast
function localWeather() {
  let myPos = getLocation()
    .then(position =>
      ({
        "latitude": position.coords.latitude,
        "longitude": position.coords.longitude
      }))
    //Convert coordinates to two decimal places and prepare for reverse geocoding
    .then(value => round(value))
    // Format URL with rounded coordinates
    .then(result => geoCodeUrl(result))
    //Process reverse geocoding
    .then(url => getRequest(url))
    //get zip code from reverse geocoded JSON
    .then(zipCode => {
      currentZipCode = zipCode.StreetAddresses[0].Zip;
      document.getElementById('zipcode').innerHTML = currentZipCode;
      return currentZipCode;
    })
    .then(setWeatherUrl => getWeatherUrl(setWeatherUrl))
    //Get current weather for current zip code
    .then(zipCode => weatherLoc(zipCode))
    //Place current weather data on the page
    .then(data => weatherData(data))
    .then(result => getForecastUrl(currentZipCode))
    .then(forUrl => getRequest(forUrl))
    .then(response => forecastWeather(response))
};

function searchLocationWeather() {
  currentZipCode = document.getElementById('searchBox').value;

  getCityWeather()
    .then(searchResult => getForecastUrl(searchResult))
    .then(result => getRequest(result))
    .then(data => srchWeather(data))
    .then(result => getForecastUrl(currentZipCode))
    .then(forUrl => getRequest(forUrl))
    .then(response => forecastWeather(response))
};

function newFavorite(city, zip) {
  this.cityName = city;
  this.zipCode = zip;
}

function addFavorite(index) {
  let city = document.getElementById('city').innerHTML;
  let zip = document.getElementById('zipcode').innerHTML;
  let object = new newFavorite(city, zip);
  localStorage.setItem('city' + index, JSON.stringify(object));
};

function favorite() {
  if (!localStorage) {
    addFavorite(0);
  } else if (localStorage) {
    var count = localStorage.length;
    addFavorite(count)
    let item = JSON.parse(localStorage.getItem('city' + count));
    console.log(item);
  }
  // localStorage.setItem('cities', JSON.stringify(favs));
  // let favList = JSON.parse(localStorage.getItem('cities'));
  // console.log(favList);
};



//Listeners
//window.onload = favorite();
document.getElementById('currentLocation').addEventListener('click', localWeather, true);
document.getElementById('currentLocation').addEventListener('touchstart', localWeather, true);
document.getElementById('navMenu').addEventListener('click', toggleNavMenu, true);
document.getElementById('getlocal').addEventListener('click', favorite, true);
document.getElementById('locationButton').addEventListener('click', searchLocationWeather, true);