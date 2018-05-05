const fs = require('fs');
const csv = require('csv');

const stream = fs.createReadStream('generated-author-info.csv');
const parser = csv.parse({delimiter: ','});

let first = true;
let schools = new Set();

stream.pipe(parser).pipe(csv.transform(function(record) {
    if (first) {
        first = false;
    } else {
        if (!schools.has(record[1])) {
            schools.add(record[1])
        }
    }
}));

stream.on('end', async () => {
    const data = JSON.stringify(Array.from(schools), null, 4);
    fs.writeFileSync('university.json', data);
});

