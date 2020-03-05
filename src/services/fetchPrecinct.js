import axios from 'axios';
import { timestamp, precincts } from '../../data/precinctData.json';

const fetchPrecinct = async (id) => {
  let precinct = null;
  try {
    // Attempt to make a request to the live dataset.
    const { data } = (
      await axios.get(
        'https://s3.amazonaws.com/public-data.elizabethwarren/ia-caucus-locations/latest.json'
      )
    ).data;
    const item = data.find((item) => `${item.van_precinct_id}` === id);
    if (item) {
      precinct = {
        county: item.van_county,
        delegates: item.county_delegates,
        id,
        code: item.van_precinct_code,
        location: {
          name: item.actual_location,
          address: item.actual_address,
          city: item.actual_city,
          state: 'IA',
          zip: item.actual_zip,
        },
        updatedAt: new Date().toISOString(),
        fromCache: false,
      };
    }
  } catch (err) {
    // If that fails, use the cached dataset.
    if (id in precincts) {
      precinct = { ...precincts[id], updatedAt: timestamp, fromCache: true };
    }
  }
  return precinct;
};

export default fetchPrecinct;
