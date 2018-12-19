/* ***API info*** */
//Current and forecast data
const apiKey = "d4fb5f3d39fd411cbb3205304182111";
const foreWeatherUrl = "https://api.apixu.com/v1/forecast.json?key=";
//Reverse Geocoding data
const geoApi = "&apikey=e72d98ec79024cd5b1fd1f39f75d0b81&format=json&notStore=false&version=4.10";
const geoUrl = "https://geoservices.tamu.edu/Services/ReverseGeocoding/WebService/v04_01/Rest/?";

let currentZipCode;
let favoriteCities = [];
let currentCardIndex, currentCardNum = 0;

function toggleNavMenu() {
  document.getElementById('favoriteList').classList.toggle('hide');
  document.getElementById('navMenu').classList.toggle('rotateNav');
}

//Check for local storage
function checkFav() {
  loadFavs();
  let found = checkForFav();
  if (found == -1) {
    document.getElementById('savefav').style.color = 'black';
  } else {
    document.getElementById('savefav').style.color = 'red';
  }
};

function favsFirst() {
  clearDiv('localfavs');
  loadFavs();
  for (let i = 0; i < favoriteCities.length; i++) {
    addElement('localfavs', 'city' + i, 'favsmain', favoriteCities[i].cityName, 'div')
    addElement('favmenu', 'citymenu' + i, 'favsmenu', favoriteCities[i].cityName, 'li')
    addElement('citymenu' + i, 'zipmenu' + i, 'hidden', favoriteCities[i].zipCode, 'span')
  }
  if (favoriteCities.length <= 0) {
    document.getElementById('favorites').classList.add('hidden');
  }
};

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
  clearDiv('currentdata');
  let current = data;
  let cityNow = current.location.name;
  let localtime = current.location.localtime_epoch;
  let forecast = data.forecast.forecastday[0].day;
  let tempNow = current.current.temp_f.toFixed(0) + "&deg;F";
  let condNow = current.current.condition.text;
  let icon = conditionIcon(current.current.condition.text);
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
  addElement('weather', 'savefav', 'savefav', "&hearts;", 'span');
  document.getElementById('savefav').classList.remove('hidden');
  document.getElementById('location').classList.add('hidden');
  document.getElementById('inputFields').classList.add('hidden');
  document.getElementById('gps').classList.add('hidden');
  document.getElementById('locationButton').classList.add('hidden');
  document.getElementById('favorites').classList.add('hidden');
  document.getElementById('localfavs').classList.add('hidden');
  addElement('weather', 'currentweather', 'currentweather', 'Current', 'span');
  addElement('weather', 'currentTemp', 'currentTemp', tempNow, 'span');
  addElement('weather', 'condition', 'condition', condNow, 'span');
  addElement('weather', 'condIcon', 'condIcon', icon, 'span');
  addElement('weather', 'high', 'high', highTemp, 'span');
  addElement('weather', 'low', 'low', lowTemp, 'span');
  checkFav();
  addSaveFavListener();

  //Forcasted Condtions
  if (!forcastDiv) {
    let newDiv = document.createElement('div');
    newDiv.setAttribute('id', 'forecast');
    newDiv.setAttribute('class', 'forecast');
    document.getElementById('currentdata').appendChild(newDiv);
  };

  addElement('forecast', 'currentforecast', 'currentforecast', '5-Day Forecast', 'div');
  let forecasted = current.forecast.forecastday;
  for (let i = 2; i < forecasted.length; i++) {
    addElement('forecast', 'day' + i, 'days', null, 'div');
    addElement('day' + i, 'dayname' + i, 'dayname', changeEpoch(forecasted[i].date_epoch), 'span')
    addElement('day' + i, 'time' + i, 'day', forecasted[i].date.substring(5, 7) + '/' + forecasted[i].date.substring(8, 11), 'span');
    addElement('day' + i, 'icon' + i, 'foreicons', conditionIcon(forecasted[i].day.condition.text), 'span');
    addElement('day' + i, 'temphigh' + i, 'temphigh', "High " + forecasted[i].day.maxtemp_f.toFixed(0) + "&deg;F", 'span');
    addElement('day' + i, 'templow' + i, 'templow', "Low " + forecasted[i].day.mintemp_f.toFixed(0) + "&deg;F", 'span');
  }
  addElement('weather', 'rightArrow', 'rightArrow', null, 'div');
  document.getElementById('rightArrow').innerHTML = "Next";
  addElement('weather', 'leftArrow', 'leftArrow', null, 'div');
  document.getElementById('leftArrow').innerHTML = "Previous";
  leftListener();
  rightListener();
  addElement('weather', 'currentIndex', 'currentIndex hidden', 'gps', 'span');
  let cLoc = document.getElementById('currentIndex').innerHTML;
  if (cLoc == 'gps') {
    document.getElementById('leftArrow').classList.add('hidden');
  }
  if (favoriteCities.length < 1) {
    document.getElementById('rightArrow').classList.add('hidden');
  }
};

function weatherFav(data) {
  loadFavs();
  clearDiv('currentdata');
  let current = data;
  let cityNow = current.location.name;
  let localtime = current.location.localtime_epoch;
  let forecast = data.forecast.forecastday[0].day;
  let tempNow = current.current.temp_f.toFixed(0) + "&deg;F";
  let condNow = current.current.condition.text;
  let icon = conditionIcon(current.current.condition.text);
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
  addElement('weather', 'savefav', 'savefav', "&hearts;", 'span');
  document.getElementById('savefav').classList.remove('hidden');
  document.getElementById('location').classList.add('hidden');
  document.getElementById('inputFields').classList.add('hidden');
  document.getElementById('gps').classList.add('hidden');
  document.getElementById('locationButton').classList.add('hidden');
  document.getElementById('favorites').classList.add('hidden');
  document.getElementById('localfavs').classList.add('hidden');
  addElement('weather', 'currentweather', 'currentweather', 'Current', 'span');
  addElement('weather', 'currentTemp', 'currentTemp', tempNow, 'span');
  addElement('weather', 'condition', 'condition', condNow, 'span');
  addElement('weather', 'condIcon', 'condIcon', icon, 'span');
  addElement('weather', 'high', 'high', highTemp, 'span');
  addElement('weather', 'low', 'low', lowTemp, 'span');
  checkFav();
  addSaveFavListener();

  //Forcasted Condtions
  if (!forcastDiv) {
    let newDiv = document.createElement('div');
    newDiv.setAttribute('id', 'forecast');
    newDiv.setAttribute('class', 'forecast');
    document.getElementById('currentdata').appendChild(newDiv);
  };

  addElement('forecast', 'currentforecast', 'currentforecast', '5-Day Forecast', 'div');
  let forecasted = current.forecast.forecastday;
  for (let i = 2; i < forecasted.length; i++) {
    addElement('forecast', 'day' + i, 'days', null, 'div');
    addElement('day' + i, 'dayname' + i, 'dayname', changeEpoch(forecasted[i].date_epoch), 'span')
    addElement('day' + i, 'time' + i, 'day', forecasted[i].date.substring(5, 7) + '/' + forecasted[i].date.substring(8, 11), 'span');
    addElement('day' + i, 'icon' + i, 'foreicons', conditionIcon(forecasted[i].day.condition.text), 'span');
    addElement('day' + i, 'temphigh' + i, 'temphigh', "High " + forecasted[i].day.maxtemp_f.toFixed(0) + "&deg;F", 'span');
    addElement('day' + i, 'templow' + i, 'templow', "Low " + forecasted[i].day.mintemp_f.toFixed(0) + "&deg;F", 'span');
  }
  addElement('weather', 'rightArrow', 'rightArrow', null, 'div');
  document.getElementById('rightArrow').innerHTML = "Next";
  if (currentCardNum == 0) {
    addElement('weather', 'leftArrow', 'leftArrow', null, 'div');
    document.getElementById('leftArrow').classList.add('hidden');
  } else {
    addElement('weather', 'leftArrow', 'leftArrow', null, 'div');
    document.getElementById('leftArrow').innerHTML = "Previous";
  }
  leftListener();
  rightListener();
};

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
};

function loadFavs() {
  if (localStorage.getItem("city") !== null) {
    favoriteCities = JSON.parse(localStorage.getItem('city'));
  }
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
  document.getElementById('navinput').checked = false;
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

function addCustomIndex(index) {
  addElement('weather', 'currentIndex', 'currentIndex hidden', index, 'span');
  let cLoc = document.getElementById('currentIndex').innerHTML;
  if (cLoc == 'gps') {
    document.getElementById('leftArrow').classList.add('hidden');
  }
  if (favoriteCities.length < 1 || index >= favoriteCities.length - 1) {
    document.getElementById('rightArrow').classList.add('hidden');
  }
  return 'done';
};

function searchLocationWeather() {
  currentCardNum = 0;
  currentZipCode = document.getElementById('searchBox').value;

  getCityWeather()
    .then(values => clearDiv('currentdata'))
    .then(result => getForecastUrl(currentZipCode))
    .then(forUrl => getRequest(forUrl))
    .then(response => weather(response))
    .then(iconsAnimation => skyconsStart())
};

function favoriteCurrentWeather(favoriteZip, index) {
  favCityWeather(favoriteZip)
    .then(searchResult => getForecastUrl(searchResult))
    .then(result => getRequest(result))
    .then(data => weatherFav(data))
    .then(indexing => addCustomIndex(index))
    .then(iconsAnimation => skyconsStart())
};

function newFavorite(city, zip) {
  this.cityName = city;
  this.zipCode = zip;
};

function checkForFav() {
  array = JSON.parse(localStorage.getItem('city'));
  for (var i = 0; i < array.length; i++) {
    if (array[i].zipCode === currentZipCode) {
      return i;
    }
  }
  return -1;
};

function addFavorite(index) {
  let city = document.getElementById('city').innerHTML;
  let zip = document.getElementById('zipcode').innerHTML;
  let array;

  if (index == 0) {
    array = [];
    array[index] = new newFavorite(city, zip);
    localStorage.setItem('city', JSON.stringify(array));
  } else {
    let checkedValue = checkForFav();
    if (checkedValue === -1) {
      array = JSON.parse(localStorage.getItem('city'));
      array[array.length] = new newFavorite(city, zip);
      localStorage.setItem('city', JSON.stringify(array));
    } else {
      array = JSON.parse(localStorage.getItem('city'));
      array.splice(checkedValue, 1);
      localStorage.setItem('city', JSON.stringify(array));
      favoriteCities = JSON.parse(localStorage.getItem('city'));
    }
  }

};

function favorite() {
  if (localStorage.getItem('city') !== null) {
    let array = JSON.parse(localStorage.getItem('city'))
    var count = array.length;
    if (count === 1) {
      addFavorite(1);
    } else {
      addFavorite(count);
    }
  } else {
    addFavorite(0);
  }
  clearDiv('favmenu')
  favsFirst();
  checkFav();
};

//Clear location div
function clearDiv(div) {
  var myNode = document.getElementById(div);
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
  }
};

//Get facvorite weather
function parseFavoritesWeather() {
  if (favoriteCities.length !== 0) {

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

function reloadmainpage() {
  clearDiv('currentdata');
  //addElement(div, id, className, value, elementType)
  addElement('currentdata', 'savefav', 'savefav', "&hearts;", 'span');
  document.getElementById('savefav').classList.add('hidden');
  document.getElementById('location').classList.remove('hidden');
  document.getElementById('inputFields').classList.remove('hidden');
  document.getElementById('gps').classList.remove('hidden');
  document.getElementById('locationButton').classList.remove('hidden');
  document.getElementById('localfavs').classList.remove('hidden');
  document.getElementById('searchBox').setAttribute("placeholder", "Zip Code i.e. 90028");
  document.getElementById('searchBox').value = "";
  addGpsListener();
  addSaveFavListener();
  document.getElementById('navinput').checked = false;
  document.getElementById('favorites').classList.remove('hidden');
};

function menuFavoriteSearch() {

}


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

  for (i = list.length; i--;) {
    var weatherType = list[i],
      elements = document.getElementsByClassName(weatherType);
    for (e = elements.length; e--;) {
      icons.set(elements[e], weatherType);
    }
  }

  icons.play();
};

function addGpsListener() {
  var gpsListener = document.getElementsByClassName('gps');
  for (let i = 0; i < gpsListener.length; i++) {
    gpsListener[i].addEventListener('click', localWeather, true);
    gpsListener[i].addEventListener('touch', localWeather, true);
  }
}

function addSaveFavListener() {
  var saveFavListener = document.getElementsByClassName('savefav');
  for (let i = 0; i < saveFavListener.length; i++) {
    saveFavListener[i].addEventListener('click', favorite, true);
    saveFavListener[i].addEventListener('touch', favorite, true);
  }
};

function leftListener() {
  var arrowLeft = document.getElementsByClassName('leftArrow');
  for (let i = 0; i < arrowLeft.length; i++) {
    arrowLeft[i].addEventListener('click', flipCardLeft, true);
    arrowLeft[i].addEventListener('touch', flipCardLeft, true);
  }
}

function rightListener() {
  var arrowRight = document.getElementsByClassName('rightArrow');
  for (let i = 0; i < arrowRight.length; i++) {
    arrowRight[i].addEventListener('click', flipCardRight, true);
    arrowRight[i].addEventListener('touch', flipCardRight, true);
  }
}

//Flip Cards
function flipCardLeft() {
  currentCardIndex = document.getElementById('currentIndex').innerHTML;
  let previousCard;
  document.getElementById('currentdata').classList.add('weatherFlip');
  setTimeout(clearDiv('currentdata'), 1000);
  if (currentCardNum !== 0 && currentCardIndex <= favoriteCities.length - 1) {
    currentCardNum -= 1;
    previousCard = favoriteCities[currentCardNum].zipCode;
  }
  favoriteCurrentWeather(previousCard, currentCardNum);
  currentZipCode = previousCard;
  setTimeout(function() {
    document.getElementById('currentdata').classList.remove('weatherFlip')
  }, 2000);
  checkFav();
  addSaveFavListener();
}

function flipCardRight() {
  currentCardIndex = document.getElementById('currentIndex').innerHTML;
  let nextCard;
  document.getElementById('currentdata').classList.add('weatherFlip');
  clearDiv('currentdata');
  if (currentCardIndex != 'gps') {
    currentCardNum += 1;
    nextCard = favoriteCities[currentCardNum].zipCode;
  } else {
    nextCard = favoriteCities[0].zipCode;
    currentZipCode = nextCard;
  }
  favoriteCurrentWeather(nextCard, currentCardNum);
  setTimeout(function() {
    document.getElementById('currentdata').classList.remove('weatherFlip')
  }, 2000);
  checkFav();
  addSaveFavListener();
}
//Listeners
window.onload = favsFirst();
document.getElementById('locationButton').addEventListener('click', searchLocationWeather, true);
document.getElementById('locationButton').addEventListener('touch', searchLocationWeather, true);
document.getElementById('reloadmain').addEventListener('click', reloadmainpage, true);
document.getElementById('reloadmain').addEventListener('touch', reloadmainpage, true);
document.getElementById('localWeatherMenu').addEventListener('click', localWeather, true);
document.getElementById('localWeatherMenu').addEventListener('touch', localWeather, true);
addGpsListener();
leftListener();
rightListener();
addSaveFavListener();