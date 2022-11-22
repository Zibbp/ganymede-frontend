import axios from "axios";
import { getCookie } from "cookies-next";
import useUserStore from "../store/user";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const getAuthentication = async () => {
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
      await axios.post(
        `${apiUrl}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const response = await axios.get(`${apiUrl}/api/v1/auth/me`, {
        withCredentials: true,
      });

      useUserStore.setState({
        isLoggedIn: true,
        id: response.data.id,
        username: response.data.username,
        role: response.data.role,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.created_at,
      });
      console.debug("getAuthentication hook: user logged in");
    } catch (error) {
      console.error("Error refreshing token");
      return;
    }
  }

  if (oauthRefreshCookie) {
    try {
      const response = await axios.get(`${apiUrl}/api/v1/auth/me`, {
        withCredentials: true,
      });
      useUserStore.setState({
        isLoggedIn: true,
        id: response.data.id,
        username: response.data.username,
        role: response.data.role,
        updatedAt: response.data.updatedAt,
        createdAt: response.data.created_at,
        oauth: true,
      });
      console.debug("[getAuthentication]: user logged in via oauth");
    } catch (error) {
      if (error.response.status === 401) {
        // Attempt a refresh
        try {
          await axios.get(`${apiUrl}/api/v1/auth/oauth/refresh`, {
            withCredentials: true,
          });

          const response = await axios.get(`${apiUrl}/api/v1/auth/me`, {
            withCredentials: true,
          });

          useUserStore.setState({
            isLoggedIn: true,
            id: response.data.id,
            username: response.data.username,
            role: response.data.role,
            updatedAt: response.data.updatedAt,
            createdAt: response.data.created_at,
            oauth: true,
          });
          console.debug(
            "[getAuthentication]: tokens refreshed and user logged in via oauth"
          );
        } catch (error) {
          console.debug(
            "[getAuthentication]: error refreshing oauth tokens - user not logged in"
          );
          return;
        }
      }
    }
  }

  return;
};
