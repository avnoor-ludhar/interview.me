import axios from 'axios';

// Create an Axios instance with base URL and credentials enabled
const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL,
    withCredentials: true, // Important for sending cookies with requests
});

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    response => response, // Pass through successful responses unchanged
    async error => { // Handle responses that are errors
        const originalRequest = error.config; // Save the original request configuration
        // Check if the error status is 401 (Unauthorized) and if the request hasn't been retried yet
        if (error.response.status === 401 && !(originalRequest.url === "/api/user/refresh-token") && !(originalRequest.url === "/api/user/register") && !(originalRequest.url === "/api/user/login")) {
            try {
                // Attempt to get a new access token using the refresh token
                const response = await api.get('/api/user/refresh-token');
                const { accessToken } = response.data; // Extract the new access token from response

                // Set the new access token as the default authorization header
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                // Update the original request's authorization header with the new access token
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                // Retry the original request with the new access token
                return api(originalRequest);
            } catch (err) {
                // If the refresh token request fails, reject the promise with the error
                return Promise.reject(err);
            }
        }

        // If the error is not 401 or the request has already been retried, reject the promise with the original error
        return Promise.reject(error);
    }
);

export default api;
