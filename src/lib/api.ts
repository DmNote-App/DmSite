import axios from "axios";

const api = axios.create({
  baseURL: "https://v-archive.net",
  timeout: 15000
});

export default api;
