const university = require('./university-geocode.json');
const country = require('./country-info');
const fs = require('fs');

university.forEach(u => {
  if (country[u.name]) {
    u.continent = country[u.name];
  } else {
    u.continent = 'northamerica';
  }
});

fs.writeFileSync('university-continent.json', JSON.stringify(university, null, 4));
