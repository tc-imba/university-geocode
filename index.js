const async = require('neo-async');
const fs = require('fs');

const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAB5EIyEBpUvw4mPPzSqSZGnRc1VIKW3wY',
  // only useful in Mainland China (use ss on localhost:1080)
  // makeUrlRequest: require('./make-url-request-proxy'),
  Promise: Promise,
});


let schools = require('./university.json');
let school_map = {};
let data = [];
let success = 0;
let error = 0;

setTimeout(async () => {
  console.log(schools);
  for (let i = 0; i < schools.length; i++) {
    school_map[schools[i]] = i;
    data.push({
      name: schools[i],
      loc: {},
    });
  }
  await async.eachSeries(
    schools,
    async (school, callback) => {
      try {
        const response = await googleMapsClient.geocode({address: school}).
          asPromise();
        const results = response.json.results;
        data[school_map[school]].loc = results[0].geometry.location;
        console.log(school, results[0].geometry.location);
        ++success;
      } catch (e) {
        console.log(e);
        ++error;
      }
      callback();
    },
    (err, results) => {
      if (err) {
        console.log(err);
      } else {
        //console.log(data);
        const data = JSON.stringify(Array.from(schools), null, 4);
        fs.writeFileSync('university-geocode.json', data);
      }
    }
  );
}, 0);


/**/








