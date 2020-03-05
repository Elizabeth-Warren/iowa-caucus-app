import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  auth: {
    username: process.env.VUE_APP_API_USER,
    password: process.env.VUE_APP_API_PASSWORD,
  },
  timeout: 10000,
});

export default api;
