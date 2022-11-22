import { showNotification } from "@mantine/notifications";
import axios from "axios";
import getConfig from "next/config";
import useUserStore from "../store/user";

interface Config {
  method: string;
  url: string;
  data?: any;
  params?: any;

  // Axios config
  headers?: any;
  timeout?: number;
  withCredentials?: boolean;
}

export const useApi = async (config: Config, allowFail: boolean) => {
  const { publicRuntimeConfig } = getConfig();
  console.log(publicRuntimeConfig);
  // Axios intercetpor
  const axiosInstance = axios.create({
    baseURL: publicRuntimeConfig.API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.response.use(
    function (response) {
      return response;
    },
    async (err) => {
      const prevRequest = err?.config;
      if (err.response.status === 401 && !prevRequest?.sent) {
        console.debug(
          "Response status 401 detected - attempting to refresh access token"
        );
        prevRequest.sent = true;
        try {
          if (useUserStore.getState().oauth == true) {
            await refreshOAuthAccessToken();
          } else {
            await refreshAccessToken();
          }

          console.debug("New access token received - retrying request");
          prevRequest.headers["Content-Type"] = "application/json";
          delete prevRequest.headers;
          return axiosInstance.request(prevRequest);
        } catch (err) {
          console.error(
            "Failed to refresh access token - redirecting to login"
          );
        }
      }
      return Promise.reject(err);
    }
  );

  try {
    const response = await axiosInstance.request(config);
    return response;
  } catch (error) {
    if (allowFail) {
      return;
    }
    console.error("HTTP API error", error);
    showNotification({
      autoClose: 5000,
      title: "Request Failed",
      message: error.response.data.message,
      styles: (theme) => ({
        root: {
          backgroundColor: theme.colors.red[6],
          borderColor: theme.colors.red[6],

          "&::before": { backgroundColor: theme.white },
        },

        title: { color: theme.white },
        description: { color: theme.white },
        closeButton: {
          color: theme.white,
          "&:hover": { backgroundColor: theme.colors.blue[7] },
        },
      }),
    });
    throw error;
  }
};

const refreshAccessToken = async () => {
  const { publicRuntimeConfig } = getConfig();
  return await axios.post(
    `${publicRuntimeConfig.API_URL}/api/v1/auth/refresh`,
    {},
    { withCredentials: true }
  );
};

const refreshOAuthAccessToken = async () => {
  const { publicRuntimeConfig } = getConfig();
  return await axios.get(
    `${publicRuntimeConfig.API_URL}/api/v1/auth/oauth/refresh`,
    { withCredentials: true }
  );
};
