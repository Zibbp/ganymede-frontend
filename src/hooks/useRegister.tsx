import { useState } from "react";
import axios from "axios";
import useUserStore, { Role } from "../store/user";
import { showNotification } from "@mantine/notifications";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const useRegister = () => {
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const register = async (inputUsername: string, inputPassword: string) => {
    setIsLoading(true);

    try {
      const response: any = await axios.post(
        `${apiUrl}/api/v1/auth/register`,
        { username: inputUsername, password: inputPassword },
        { withCredentials: true }
      );
      setIsLoading(false);

      showNotification({
        title: "Registration Successful",
        message: "You can now login",
      });
    } catch (error) {
      setIsLoading(false);
      setError(error);
      showNotification({
        autoClose: 5000,
        title: "Registration Failed",
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
  return { register, error, isLoading };
};
