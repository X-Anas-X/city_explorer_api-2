'use strict';


// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get('/', (request, response) => {
  response.send('Home Page!');
});

// Route Definitions
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);  //******
app.use('*', notFoundHandler);
app.use(errorHandler);

// Route Handlers
let trailArr = [];
function locationHandler(request, response) {
  // try {
  //   const geoData = require('./data/geo.json');
  //   const city = request.query.city;
  //   const locationData = new Location(city, geoData);
  //   console.log(locationData);
  //   response.status(200).send(locationData);
  // } catch (error) {
  //   errorHandler(
  //     'an error happened while fetching your data!\n' + error,
  //     request,
  //     response
  //   );
  // }
  
  const city = request.query.city;
  superagent(
    `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`
  )
    .then((res) => {
        // console.log(`this is res1 : ` , res);
        
      const geoData = res.body;
      // console.log(`geo thing` , geoData);
      
      const locationData = new Location(city, geoData);
      response.status(200).json(locationData);
    })
    .catch((err) => errorHandler(err, request, response));
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
  trailArr.push(this.latitude, this.longitude);
  // Location.all.push(this);
  

}
// Location.all = [];
// console.log(trailArr);




/////////////////////////////////////////////////////////////////////////////////////////

function weatherHandler(request, response) {
  // try {
  //   const weatherRes = require('./data/darksky.json');
  //   const weatherSummaries = weatherRes.data.map((day) => {
  //     return new Weather(day);
  //   });
  //   response.status(200).json(weatherSummaries);
  // } catch (error) {
  //   errorHandler(
  //     'So sorry, something went wrong with weather.',
  //     request,
  //     response
  //   );
  // }
  superagent(
    `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`
  )
    .then((weatherRes) => {
      // console.log(weatherRes);
      const weatherSummaries = weatherRes.body.data.map((day) => {
        return new Weather(day);
      });
      response.status(200).json(weatherSummaries);
    })
    .catch((err) => errorHandler(err, request, response));
}

function Weather(day) {
  this.forecast = day.weather.description;
  this.time = new Date(day.valid_date).toString().slice(0, 15);
}




//////////////////////////////////////////////////////////////////////////////////////////////////


function trailHandler (request, response){
    superagent(
        `https://www.hikingproject.com/data/get-trails?lat=${request.query.latitude}&lon=${request.query.longitude}&maxDistance=400&key=${process.env.TRAIL_API_KEY}`)
        .then ((trailRes) => {
      // console.log(request.query.latitude, request.query.longitude);
      
        const trailSummery=trailRes.body.trails.map((trailInfo)=>{
          // console.log('this',key); 
  
            return new Trails(trailInfo);                 
        });
        // getTrails(key,lat,lon)
        // .then(allTrails => res.status(200).json(trailSummery));
        // console.log('here console', trailSummery);
        response.status(200).json(trailSummery);
    })
    .catch((err) => errorHandler(err, request, response));
}
function Trails(trailInfo){
    this.name = trailInfo.name;
    this.location = trailInfo.location;
    this.length = trailInfo.length;
    this.stars = trailInfo.stars;
    this.star_votes = trailInfo.starVotes;
    this.summary = trailInfo.summary;
    this.trail_url = trailInfo.url;
    this.conditions = trailInfo.conditionStatus;
    this.condition_date = trailInfo.conditionDate.slice(0, 9);
    this.condition_time = trailInfo.conditionDate.slice(11, 8);
    //.toString().slice(12, 19);
}
// error handeling
function notFoundHandler(request, response) {
    response.status(404).send('huh?');
  }
  function errorHandler(error, request, response) {
    response.status(500).send(error);
  }
  // Make sure the server is listening for requests
  app.listen(PORT, () => console.log(`App is listening on ${PORT}`));