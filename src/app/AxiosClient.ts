import axios from "axios";

const AxiosClient = axios.create({
  baseURL: "http://3.37.232.216:8080/api",
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// 요청 인터셉터
// AxiosClient.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const token = localStorage.getItem("token") || sessionStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   }
//   return config;
// });

AxiosClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  const isFormData = config.data instanceof FormData;
  if (!isFormData) {
    config.headers = config.headers || {};
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default AxiosClient;
