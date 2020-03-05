/**
 * @fileoverview
 * Grabs a copy of the data at build time to include with the app code as a fall
 * back in case the user does not have network connectivity and their browser
 * can not directly access the json file.
 */
const axios = require('axios');
const fs = require('fs');

const timestamp = new Date().toISOString();

const fetchData = async () => {
  const { data } = (
    await axios.get(
      'https://s3.amazonaws.com/public-data.elizabethwarren/ia-caucus-locations/latest.json'
    )
  ).data;
  return data;
};

fetchData().then((data) => {
  const precincts = data.reduce((obj, item) => {
    const id = item.van_precinct_id;
    if (!id) {
      return obj;
    }
    obj[id] = {
      county: item.van_county,
      delegates: parseInt(item.county_delegates, 10),
      id,
      code: item.van_precinct_code,
      location: {
        name: item.actual_location,
        address: item.actual_address,
        city: item.actual_city,
        state: 'IA',
        zip: item.actual_zip,
      },
    };
    return obj;
  }, {});
  fs.writeFile(
    './data/precinctData.json',
    JSON.stringify({ timestamp, precincts }),
    (err) => {
      if (err) throw err;
      console.log('data generated');
    }
  );
});
