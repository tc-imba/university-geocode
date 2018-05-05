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
let tasks = [];

console.log(schools);
for (let i = 0; i < schools.length; i++) {
    const school = schools[i];
    school_map[school] = i;
    data.push({
        name: school,
        loc: {},
    });
    tasks.push(async (callback) => {
        try {
            const response = await googleMapsClient.geocode({address: school}).asPromise();
            const results = response.json.results;
            data[school_map[school]].loc = results[0].geometry.location;
            console.log(school, results[0].geometry.location);
            ++success;
        } catch (e) {
            console.log(e);
            ++error;
        }
        callback();
    });
}

setTimeout(async () => {
    await async.parallelLimit(
        tasks,
        6,
        (err, results) => {
            if (err) {
                console.log(err);
            } else {
                //console.log(data);
                fs.writeFileSync('university-geocode.json', JSON.stringify(data, null, 4));
            }
        }
    );
}, 0);


/**/








