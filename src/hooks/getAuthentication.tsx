import axios from "axios";
import { getCookie } from "cookies-next";
import getConfig from "next/config";
import useUserStore from "../store/user";
import { AuthMeResponse } from "../types/authentication";

const getUserData = async () => {
  const { publicRuntimeConfig } = getConfig();

  const axiosInstance = axios.create({
    baseURL: publicRuntimeConfig.API_URL,
    timeout: 5000,
    withCredentials: true
  })

  return await axiosInstance.get<AuthMeResponse>(
    `/api/v1/auth/me`,
  );
}

const setUserState = (data: AuthMeResponse, oauth: boolean = false) => {
  useUserStore.setState({
    isLoggedIn: true,
    id: data.id,
    username: data.username,
    role: data.role, // @ts-ignore
    updatedAt: data.updated_at,
    createdAt: data.created_at,
    oauth: oauth,
  });
}

export const getAuthentication = async () => {
  const { publicRuntimeConfig } = getConfig();

  const axiosInstance = axios.create({
    baseURL: publicRuntimeConfig.API_URL,
    timeout: 5000,
    withCredentials: true
  })

  console.debug("getAuthentication hook called");

  // Check for user settings stored in localstorage
  const userSettings = localStorage.getItem("ganymedeUserSettings");
  if (userSettings) {
    useUserStore.setState({
      settings: JSON.parse(userSettings),
    });
  }

  const accessTokenCookie = getCookie("access-token");
  const refreshTokenCookie = getCookie("refresh-token");

  const oauthAccessCookie = getCookie("oauth_access_token");
  const oauthRefreshCookie = getCookie("oauth_refresh_token");

  if (refreshTokenCookie) {
    // If refresh token exists, attempt to refresh and get access token
    try {
      await axiosInstance.post(
        `/api/v1/auth/refresh`,
      );
      const response = await getUserData()

      console.log(response)

      setUserState(response.data)

      console.debug("getAuthentication hook: user logged in");
    } catch (error) {
      console.error("Error refreshing token");
      return;
    }
  }

  if (oauthRefreshCookie) {
    try {
      const response = await getUserData()

      setUserState(response.data)

      console.debug("getAuthentication: user logged in via oauth");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status == 401) {
        // attempt refresh
        try {
          await axiosInstance.get(
            `/api/v1/auth/oauth/refresh`,
          );

          const response = await getUserData()

          setUserState(response.data, true

          )
          console.debug(
            "getAuthentication hook: tokens refreshed and user logged in via oauth"
          );
        } catch (error) {
          console.debug(
            "getAuthentication hook: error refreshing oauth tokens - user not logged in"
          );
          return;
        }
      } else {
        console.error(`Unexpected error: ${error}`)
      }

    }
  }

  return;
};
