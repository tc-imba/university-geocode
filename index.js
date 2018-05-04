const csv = require('csv');
const fs = require('fs');
const async = require('neo-async');

const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAB5EIyEBpUvw4mPPzSqSZGnRc1VIKW3wY',
  // only useful in Mainland China (use ss on localhost:1080)
  makeUrlRequest: require('./make-url-request-proxy'),
  Promise: Promise,
});

const stream = fs.createReadStream('country-info.csv');
const parser = csv.parse({delimiter: ','});

let first = true;
let schools = [];

stream.pipe(parser).pipe(csv.transform(function(record) {
  if (first) {
    first = false;
  } else {
    schools.push(record[0]);
  }
}));

let school_map = {};
let data = [];
let success = 0;
let error = 0;

stream.on('end', async () => {
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
        console.log(data);
      }
    }
  );
});


/**/








