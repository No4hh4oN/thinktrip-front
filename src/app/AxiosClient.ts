import axios from "axios";

const AxiosClient = axios.create({
  baseURL: "http://3.37.232.216:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
AxiosClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default AxiosClient;
