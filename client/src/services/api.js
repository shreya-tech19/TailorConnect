
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// =====================================
// IDENTIFY TAILOR REQUEST
// =====================================

const isTailorRequest = (requestUrl) => {
  return (
    requestUrl.startsWith("/tailors") ||
    requestUrl.includes("/orders/tailor/") ||
    (
      requestUrl.includes("/orders/") &&
      (
        requestUrl.includes("/review") ||
        requestUrl.includes("/clarification") ||
        requestUrl.includes("/status") ||
        requestUrl.includes("/measurement-appointment") ||
        requestUrl.includes("/measurement-complete") ||
        requestUrl.includes("/home-visit-visitor") ||
        requestUrl.includes("/home-visit-otp")
      )
    )
  );
};

// =====================================
// IDENTIFY DELIVERY PARTNER REQUEST
// =====================================

const isDeliveryRequest = (requestUrl) => {
  return (
    requestUrl.startsWith("/delivery") ||
    requestUrl.startsWith("/delivery-partners")
  );
};

// =====================================
// ADD CORRECT TOKEN TO REQUEST
// =====================================

API.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || "";

    const token = isTailorRequest(requestUrl)
      ? localStorage.getItem("tailorToken")
      : isDeliveryRequest(requestUrl)
      ? localStorage.getItem("deliveryToken")
      : localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =====================================
// HANDLE UNAUTHORIZED RESPONSE
// =====================================

API.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";

      if (isTailorRequest(requestUrl)) {
        localStorage.removeItem("tailorToken");
        localStorage.removeItem("tailor");
      } else if (isDeliveryRequest(requestUrl)) {
        localStorage.removeItem("deliveryToken");
        localStorage.removeItem("deliveryPartner");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("customer");
      }
    }

    return Promise.reject(error);
  }
);

export default API;
