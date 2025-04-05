import axios from "axios";

const AxiosClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default AxiosClient;
