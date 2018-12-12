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
function checkFav() {
  loadFavs();
  for (let x = 0; x < favoriteCities.length; x++) {
    if (currentZipCode === favoriteCities[x].zipCode) {
      document.getElementById('savefav').style.filter = "invert(0)";
      document.getElementById('savefav').style.color = "red";
    }
  }
};

function favsFirst() {
  loadFavs();
  for (let i = 0; i < favoriteCities.length; i++) {
    addElement('localfavs', 'city' + i, 'favsmain', favoriteCities[i].cityName, 'div')
  }
}

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
  let currentUrl = currWeatherUrl + apiKey + "&q=" + zipCode + '&days=7';
  return currentUrl;
};

function getForecastUrl(forecastZipCode) {
  let forecastUrl = foreWeatherUrl + apiKey + "&q=" + forecastZipCode + '&days=7';
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

function addElement(div, id, className, value, elementType) {
  let element = document.createElement(elementType);
  //let elementValue = document.createTextNode(value);
  element.setAttribute("class", className);
  element.setAttribute('id', id);
  if (className == 'zipcode') {
    element.setAttribute('class', 'hidden');
  }
  //element.appendChild(elementValue);
  document.getElementById(div).appendChild(element);
  if (value !== null) {
    document.getElementById(id).innerHTML = value;
  }
};

function weather(data) {
  loadFavs();
  clearDiv();
  let current = data;
  let cityNow = current.location.name;
  let localtime = current.location.localtime_epoch;
  let forecast = data.forecast.forecastday[0].day;
  let tempNow = current.current.temp_f.toFixed(0) + "&deg;F";
  let condNow = current.current.condition.text;
  let icon = conditionIcon(current.current.condition.text);
  let favIcon = "&hearts;"
  let weatherDiv = document.getElementById('weather');
  let forcastDiv = document.getElementById('forecast');
  let highTemp = "High<br>" + forecast.maxtemp_f.toFixed(0) + "&deg;F";
  let lowTemp = "Low<br>" + forecast.mintemp_f.toFixed(0) + "&deg;F"


  //Current Conditions
  if (!weatherDiv) {
    let newDiv = document.createElement('div');
    newDiv.setAttribute('id', 'weather');
    newDiv.setAttribute('class', 'weather');
    document.getElementById('currentdata').appendChild(newDiv);
  };

  addElement('weather', 'zipcode', 'zipcode', currentZipCode, 'span');
  addElement('weather', 'city', 'city', cityNow, 'span');
  addElement('weather', 'savefav', 'savefav', favIcon, 'span');
  addElement('weather', 'currentweather', 'currentweather', 'Current', 'span');
  addElement('weather', 'currentTemp', 'currentTemp', tempNow, 'span');
  addElement('weather', 'condition', 'condition', condNow, 'span');
  addElement('weather', 'condIcon', 'condIcon', icon, 'span');
  addElement('weather', 'high', 'high', highTemp, 'span');
  addElement('weather', 'low', 'low', lowTemp, 'span');

  checkFav();

  //Forcasted Condtions
  if (!forcastDiv) {
    let newDiv = document.createElement('div');
    newDiv.setAttribute('id', 'forecast');
    newDiv.setAttribute('class', 'forecast');
    document.getElementById('currentdata').appendChild(newDiv);
  };
  addElement('forecast', 'currentforecast', 'currentforecast', '5-Day Forecast');
  let forecasted = current.forecast.forecastday;
  for (let i = 2; i < forecasted.length; i++) {
    addElement('forecast', 'day' + i, 'days', null, 'div');
    addElement('day' + i, 'dayname' + i, 'dayname', changeEpoch(forecasted[i].date_epoch), 'span')
    addElement('day' + i, 'time' + i, 'day', forecasted[i].date.substring(5, 7) + '/' + forecasted[i].date.substring(8, 11), 'span');
    addElement('day' + i, 'icon' + i, 'foreicons', conditionIcon(forecasted[i].day.condition.text), 'span');
    addElement('day' + i, 'temphigh' + i, 'temphigh', "High " + forecasted[i].day.maxtemp_f.toFixed(0) + "&deg;F", 'span');
    addElement('day' + i, 'templow' + i, 'templow', "Low " + forecasted[i].day.mintemp_f.toFixed(0) + "&deg;F", 'span');
  }
};

// function srchWeather(searchData) {
//   document.getElementById('zipcode').innerHTML = currentZipCode;
//   document.getElementById('city').innerHTML = searchData.location.name;
//   document.getElementById('currentTemp').innerHTML = searchData.current.temp_f.toFixed(0) + "&deg;";
//   document.getElementById('condition').innerHTML = searchData.current.condition.text;
//   document.getElementById('condIcon').innerHTML = condtionIcon(searchData.current.condition.icon);
// };

function changeEpoch(value) {
  let date = new Date(value * 1000);

  switch (date.getDay()) {
    case 0:
      return 'Sun'
      break;
    case 1:
      return 'Mon'
      break;
    case 2:
      return 'Tue'
      break;
    case 3:
      return 'Wed'
      break;
    case 4:
      return 'Thu'
      break;
    case 5:
      return 'Fri'
      break;
    case 6:
      return 'Sat'
      break;
  }
}

function loadFavs() {
  if (localStorage.getItem("city") !== null) {
    favoriteCities = JSON.parse(localStorage.getItem('city'));
  }
}

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
      //document.getElementById('zipcode').innerHTML = currentZipCode;
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
  if (localStorage.getItem('city') !== null) {}
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
  checkFav();
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
      return '<canvas class="cloudy" width="64" height="64"></canvas>'
      break;
    case "overcast":
      return '<canvas class="cloudy" width="64" height="64"></canvas>'
      break;
    case "sunny":
      return '<canvas class="clear-day" width="64" height="64"></canvas>'
      break;
    case "clear":
      return '<canvas class="clear-night" width="64" height="64"></canvas>'
      break;
    case "partly cloudy":
      return '<canvas class="partly-cloudy-night" width="64" height="64"></canvas>'
      break;
    case "blowing snow":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "blizzard":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "light snow showers":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "moderate or heavy snow showers":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "heavy snow":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "moderate snow":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "moderate rain":
      return '<canvas class="rain" width="64" height="64"></canvas>'
      break;
    case "moderate or heavy freezing rain":
      return '<img src="./assets/weathericons/Cloud-Rain.svg">'
      break;
    case "heavy rain":
      return '<img src="./assets/weathericons/Cloud-Rain.svg">'
      break;
    case "heavy rain at times":
      return '<img src="./assets/weathericons/Cloud-Rain.svg">'
      break;
    case "moderate rain at times":
      return '<canvas class="rain" width="64" height="64"></canvas>'
      break;
    case "light rain":
      return '<img src="./assets/weathericons/Cloud-Rain-Alt.svg">'
      break;
    case "light freezing rain":
      return '<img src="./assets/weathericons/Cloud-Rain-Alt.svg">'
      break;
    case "patchy light rain":
      return '<img src="./assets/weathericons/Cloud-Rain-Alt.svg">'
      break;
    case "mist":
      return '<canvas class="fog" width="64" height="64"></canvas>'
      break;
    case "fog":
      return '<canvas class="fog" width="64" height="64"></canvas>'
      break;
    case "light sleet showers":
      return '<canvas class="sleet" width="64" height="64"></canvas>'
      break;
    case "moderate or heavy sleet showers":
      return '<canvas class="sleet" width="64" height="64"></canvas>'
      break;
    case "moderate or heavy rain shower":
      return '<canvas class="rain" width="64" height="64"></canvas>'
      break;
    case "light rain shower":
      return '<canvas class="rain" width="64" height="64"></canvas>'
      break;
    case "light sleet":
      return '<canvas class="sleet" width="64" height="64"></canvas>'
      break;
    case "ice pellets":
      return '<img src="./assets/weathericons/Cloud-Hail.svg">'
      break;
    case "light showers of ice pellets":
      return '<img src="./assets/weathericons/Cloud-Hail.svg">'
      break;
    case "moderate or heavy showers of ice pellets":
      return '<img src="./assets/weathericons/Cloud-Hail-Alt.svg">'
      break;
    case "moderate or heavy sleet":
      return '<canvas class="sleet" width="64" height="64"></canvas>'
      break;
    case "patchy sleet possible":
      return '<canvas class="sleet" width="64" height="64"></canvas>'
      break;
    case "patchy snow possible":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "patchy rain possible":
      return '<canvas class="rain" width="64" height="64"></canvas>'
      break;
    case "torrential rain shower":
      return '<canvas class="rain" width="64" height="64"></canvas>'
      break;
    case "freezing fog":
      return '<canvas class="fog" width="64" height="64"></canvas>'
      break;
    case "patchy light drizzle":
      return '<img src="./assets/weathericons/Cloud-Drizzle-Alt.svg">'
      break;
    case "patchy freezing drizzle possible":
      return '<img src="./assets/weathericons/Cloud-Drizzle-Alt.svg">'
      break;
    case "light drizzle":
      return '<img src="./assets/weathericons/Cloud-Drizzle-Alt.svg">'
      break;
    case "light drizzle":
      return '<img src="./assets/weathericons/Cloud-Drizzle-Alt.svg">'
      break;
    case "freezing drizzle":
      return '<img src="./assets/weathericons/Cloud-Drizzle-Alt.svg">'
      break;
    case "heavy freezing drizzle":
      return '<img src="./assets/weathericons/Cloud-Drizzle.svg">'
      break;
    case "patchy light snow":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "light snow":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "patchy moderate snow":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "moderate snow":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "patchy heavy snow":
      return '<canvas class="snow" width="64" height="64"></canvas>'
      break;
    case "thundery outbreaks possible":
      return '<img src="./assets/weathericons/Cloud-Lightning.svg">'
      break;
    case "moderate or heavy snow with thunder":
      return '<img src="./assets/weathericons/Cloud-Lightning.svg">'
      break;
    case "patchy light rain with thunder":
      return '<img src="./assets/weathericons/Cloud-Lightning.svg">'
      break;
    case "patchy light snow with thunder":
      return '<img src="./assets/weathericons/Cloud-Lightning.svg">'
      break;
    case "patchy light snow with thunder":
      return '<img src="./assets/weathericons/Cloud-Lightning.svg">'
      break;
    case "moderate or heavy rain with thunder":
      return '<img src="./assets/weathericons/Cloud-Lightning.svg">'
      break;
    default:
      return '<img src="./assets/weathericons/Cloud-Download.svg">'
  }
};

function skyconsStart() {
  var icons = new Skycons({
      "color": "white"
    }),
    list = [
      "clear-day", "clear-night", "partly-cloudy-day",
      "partly-cloudy-night", "cloudy", "rain", "sleet", "snow", "wind",
      "fog"
    ],
    i;

  for (i = list.length; i--;) {
    var weatherType = list[i],
      elements = document.getElementsByClassName(weatherType);
    for (e = elements.length; e--;) {
      icons.set(elements[e], weatherType);
    }
  }

  icons.play();
};

//Listeners
window.onload = favsFirst();
document.getElementById('navMenu').addEventListener('click', toggleNavMenu, true);
document.getElementById('navMenu').addEventListener('touch', toggleNavMenu, true);
document.getElementById('gps').addEventListener('click', localWeather, true);
document.getElementById('gps').addEventListener('touchstart', localWeather, true);
document.getElementById('getlocal').addEventListener('click', favorite, true);
document.getElementById('getlocal').addEventListener('touch', favorite, true);
document.getElementById('parse').addEventListener('click', parseFavoritesWeather, true);
document.getElementById('locationButton').addEventListener('click', searchLocationWeather, true);
document.getElementById('locationButton').addEventListener('touch', searchLocationWeather, true);