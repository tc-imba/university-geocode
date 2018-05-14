const fs = require('fs');
const csv = require('csv');

const stream = fs.createReadStream('country-info.csv');
const parser = csv.parse({delimiter: ','});

let first = true;
let schools = {};

stream.pipe(parser).pipe(csv.transform(function(record) {
  if (first) {
    first = false;
  } else {
    schools[record[0]] = record[1]
  }
}));

stream.on('end', async () => {
  const data = JSON.stringify(schools, null, 4);
  fs.writeFileSync('country-info.json', data);
});

