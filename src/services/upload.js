import api from './api';
import axios from 'axios';

const getUploadUrl = async ({ phone_number, precinct_id, extension }) => {
  const { url, s3_object_key } = (
    await api.post('/upload_url', {
      phone_number,
      precinct_id,
      extension,
    })
  ).data;
  return { url, s3_object_key };
};

const upload = async ({ file, phone_number, precinct_id }) => {
  const extension = file.name.split('.').slice(-1)[0];
  const { url, s3_object_key } = await getUploadUrl({
    extension,
    phone_number,
    precinct_id,
  });
  await axios.put(url, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
  return { url, s3_object_key };
};

export default upload;
