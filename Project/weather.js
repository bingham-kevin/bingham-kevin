/* ***API info*** */
//Current and forecast data
const apiKey = "d4fb5f3d39fd411cbb3205304182111";
const foreWeatherUrl = "https://api.apixu.com/v1/forecast.json?key=";
//Reverse Geocoding data
const geoApi = "&apikey=e72d98ec79024cd5b1fd1f39f75d0b81&format=json&notStore=false&version=4.10";
const geoUrl = "https://geoservices.tamu.edu/Services/ReverseGeocoding/WebService/v04_01/Rest/?";

let currentZipCode;
let favoriteCities = [];

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
  let currentUrl = currWeatherUrl + apiKey + "&q=" + zipCode + '&days=5';
  return currentUrl;
};

function getForecastUrl(forecastZipCode) {
  let forecastUrl = foreWeatherUrl + apiKey + "&q=" + forecastZipCode + '&days=6';
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

function weather(data) {
  let current = data;
  let forecast = data.forecast.forecastday[0].day;
  document.getElementById('zipcode').innerHTML = currentZipCode;
  document.getElementById('city').innerHTML = current.location.name;
  document.getElementById('currentTemp').innerHTML = current.current.temp_f.toFixed(0) + "&deg;";
  document.getElementById('condition').innerHTML = current.current.condition.text;
  document.getElementById('condIcon').innerHTML = conditionIcon(current.current.condition.text);
  document.getElementById('high').innerHTML = "High: " + forecast.maxtemp_f.toFixed(0) + "&deg; F";
  document.getElementById('low').innerHTML = "Low: " + forecast.mintemp_f.toFixed(0) + "&deg; F";
};

// function srchWeather(searchData) {
//   document.getElementById('zipcode').innerHTML = currentZipCode;
//   document.getElementById('city').innerHTML = searchData.location.name;
//   document.getElementById('currentTemp').innerHTML = searchData.current.temp_f.toFixed(0) + "&deg;";
//   document.getElementById('condition').innerHTML = searchData.current.condition.text;
//   document.getElementById('condIcon').innerHTML = condtionIcon(searchData.current.condition.icon);
// };

function favoritesWeatherData(jsonData) {
  favoriteCities.push(jsonData);
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

function favCityWeather(favoriteZip) {
  return new Promise(function(resolve, reject) {
    let value = true;
    if (true) {
      let zipCode = favoriteZip;
      resolve(zipCode);
    } else {
      reject(error);
    }
  })
};

// Get local weather & local forecast
function localWeather() {
  getLocation()
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
    .then(result => getForecastUrl(result))
    .then(forUrl => getRequest(forUrl))
    .then(response => weather(response))
    .then(iconsAnimation => skyconsStart())
};

function searchLocationWeather() {
  currentZipCode = document.getElementById('searchBox').value;

  getCityWeather()
    .then(values => clearDiv())
    .then(result => getForecastUrl(currentZipCode))
    .then(forUrl => getRequest(forUrl))
    .then(response => weather(response))
    .then(iconsAnimation => skyconsStart())
};

function favoriteCurrentWeather(favoriteZip) {
  favCityWeather(favoriteZip)
    .then(searchResult => getForecastUrl(searchResult))
    .then(result => getRequest(result))
    .then(data => favoritesWeatherData(data))
};

function newFavorite(city, zip) {
  this.cityName = city;
  this.zipCode = zip;
}

function addFavorite(index) {
  let city = document.getElementById('city').innerHTML;
  let zip = document.getElementById('zipcode').innerHTML;
  if (index === 0) {
    let array = [];
    array[index] = new newFavorite(city, zip);
    localStorage.setItem('city', JSON.stringify(array));
  } else {
    let array = JSON.parse(localStorage.getItem('city'));
    array.push({
      "cityName": city,
      "zipCode": zip
    })
    localStorage.setItem('city', JSON.stringify(array));
  }
};

function favorite() {
  var count = localStorage.length;
  if (count === 0) {
    addFavorite(0);
  } else if (count === 1) {
    addFavorite(1);
  } else {
    addFavorite(count);
  }
  // if (typeof localStorage === 'undefined') {
  //   addFavorite(count);
  // } else if (localStorage) {
  //   let item = JSON.parse(localStorage.getItem('city'));
  //   favoriteWeather(item[count].zipCode);
  // }
  // localStorage.setItem('cities', JSON.stringify(favs));
  // let favList = JSON.parse(localStorage.getItem('cities'));
  // console.log(favList);
};

//Clear location div
function clearDiv() {
  var myNode = document.getElementById("location");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
}

//Get facvorite weather
function parseFavoritesWeather() {
  let favsObj = JSON.parse(localStorage.getItem('city'));
  for (var i = 0; i < favsObj.length; i++) {
    let favoriteZip = favsObj[i].zipCode;
    favoriteCurrentWeather(favoriteZip);
    favoriteForecastWeather(favoriteZip);
  }
};

function conditionIcon(condition) {
  let lowerCondtion = condition.toLowerCase();
  switch (lowerCondtion) {
    case "cloudy":
      return '<canvas id="cloudy" width="64" height="64"></canvas>'
      break;
    case "overcast":
      return '<canvas id="cloudy" width="64" height="64"></canvas>'
      break;
    case "sunny":
      return '<canvas id="clear-day" width="64" height="64"></canvas>'
      break;
    case "clear":
      return '<canvas id="clear-night" width="64" height="64"></canvas>'
      break;
    case "partly cloudy":
      return '<canvas id="partly-cloudy-night" width="64" height="64"></canvas>'
      break;
    case "blowing snow":
      return '<canvas id="snow" width="64" height="64"></canvas>'
      break;
    case "blizzard":
      return '<canvas id="snow" width="64" height="64"></canvas>'
      break;
    case "light snow showers":
      return '<canvas id="snow" width="64" height="64"></canvas>'
      break;
    case "moderate or heavy snow showers":
      return '<canvas id="snow" width="64" height="64"></canvas>'
      break;
    case "heavy snow":
      return '<canvas id="snow" width="64" height="64"></canvas>'
      break;
    case "moderate snow":
      return '<canvas id="snow" width="64" height="64"></canvas>'
      break;
    case "moderate rain":
      return '<canvas id="rain" width="64" height="64"></canvas>'
      break;
    case "mist":
      return '<canvas id="fog" width="64" height="64"></canvas>'
      break;
    case "fog":
      return '<canvas id="fog" width="64" height="64"></canvas>'
      break;
    case "light sleet showers":
      return '<canvas id="sleet" width="64" height="64"></canvas>'
      break;
    case "moderate or heavy sleet showers":
      return '<canvas id="sleet" width="64" height="64"></canvas>'
      break;
    case "light sleet":
      return '<canvas id="sleet" width="64" height="64"></canvas>'
      break;
    case "ice pellets":
      return '<img src="./assets/weathericons/Cloud-Hail.svg">'
      break;
    case "moderate or heavy sleet":
      return '<canvas id="sleet" width="64" height="64"></canvas>'
      break;
    default:
      return '<img src="./assets/weathericons/Cloud-Download.svg">'
  }
};

function skyconsStart() {
  var icons = new Skycons({
      "color": "black"
    }),
    list = [
      "clear-day", "clear-night", "partly-cloudy-day",
      "partly-cloudy-night", "cloudy", "rain", "sleet", "snow", "wind",
      "fog"
    ],
    i;

  for (i = list.length; i--;)
    icons.set(list[i], list[i]);

  icons.play();
};

//Listeners
//window.onload = favorite();
document.getElementById('currentLocation').addEventListener('click', localWeather, true);
document.getElementById('currentLocation').addEventListener('touchstart', localWeather, true);
document.getElementById('navMenu').addEventListener('click', toggleNavMenu, true);
document.getElementById('getlocal').addEventListener('click', favorite, true);
document.getElementById('parse').addEventListener('click', parseFavoritesWeather, true);
document.getElementById('locationButton').addEventListener('click', searchLocationWeather, true);