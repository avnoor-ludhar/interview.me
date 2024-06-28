import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL,
    withCredentials: true, //ensures cookies are sent with requests
});

export default api;