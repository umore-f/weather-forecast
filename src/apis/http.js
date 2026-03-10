import axios from "axios";

// 和风天气API
const httpInstance = axios.create({
  baseURL: 'http://127.0.0.1:9000',
  timeout: 10000,
});

export default httpInstance;


