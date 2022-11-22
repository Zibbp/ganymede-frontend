import { useState } from "react";
import axios from "axios";
import useUserStore, { Role } from "../store/user";
import { showNotification } from "@mantine/notifications";
import getConfig from "next/config";

export const useLogin = () => {
  const { publicRuntimeConfig } = getConfig();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (inputUsername: string, inputPassword: string) => {
    setIsLoading(true);

    try {
      const response: any = await axios.post(
        `${publicRuntimeConfig.API_URL}/api/v1/auth/login`,
        { username: inputUsername, password: inputPassword },
        { withCredentials: true }
      );
      setIsLoading(false);

      const { id, username, role, updatedAt, createdAt } = response.data;

      useUserStore.setState({
        isLoggedIn: true,
        id,
        username,
        role,
        updatedAt,
        createdAt,
      });
    } catch (error) {
      setIsLoading(false);
      setError(error);
      showNotification({
        autoClose: 5000,
        title: "Login Failed",
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
      return error;
    }
  };
  return { login, error, isLoading };
};
