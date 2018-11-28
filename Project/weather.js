/* API info */
const apiKey = "d4fb5f3d39fd411cbb3205304182111";
const weatherUrl = "https://api.apixu.com/v1/current.json?key=";

const geoApi = "&apikey=e72d98ec79024cd5b1fd1f39f75d0b81&format=json&notStore=false&version=4.10";
const geoUrl = "https://geoservices.tamu.edu/Services/ReverseGeocoding/WebService/v04_01/Rest/?";

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

function localWeather() {
  let myPos = getLocation()
    .then(position =>
      ({
        "latitude": position.coords.latitude,
        "longitude": position.coords.longitude
      }))
    .then(function round(value) {
      let decimals = 2;
      let objectResponse = {};
      objectResponse.myLat = Number(Math.round(value.latitude + 'e' + decimals) + 'e-' + decimals);
      objectResponse.myLong = Number(Math.round(value.longitude + 'e' + decimals) + 'e-' + decimals);
      return objectResponse;
    })
    .then(function geocode(result) {
      var getUrl = geoUrl + "lat=" + result.myLat + "&lon=" + result.myLong + geoApi;
      return getUrl;
    })
    .then(function myLoc(url) {
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
            // do something about 404
          }
        })
    })
    .then(zipCode => {
      return zipCode.StreetAddresses[0].Zip;
    })
    .then(function weatherLoc(zipCode) {
      var url = weatherUrl + apiKey + "&q=" + zipCode;
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
            // do something about 404
          }
        })
    })
    .then(function weather(data) {
      document.getElementById('city').innerHTML = data.location.name;
      document.getElementById('currentTemp').innerHTML = data.current.temp_f + "&deg;";
      document.getElementById('condition').innerHTML = data.current.condition.text;
      document.getElementById('condIcon').innerHTML = '<img src="https:' + data.current.condition.icon + '">';
    })
};

document.getElementById('currentLocation').addEventListener('click', localWeather, true);
document.getElementById('currentLocation').addEventListener('touchstart', localWeather, true);