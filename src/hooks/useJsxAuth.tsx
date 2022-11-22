import useUserStore from "../store/user";

interface IAuth {
  loggedIn: boolean;
  roles: ROLES[];
}

export enum ROLES {
  ADMIN = "admin",
  EDITOR = "editor",
  ARCHIVER = "archiver",
  USER = "user",
}

export const useJsxAuth = ({ loggedIn, roles }: IAuth) => {
  const user = useUserStore((state) => state);
  // Check if user is logged in
  if (loggedIn && !user.isLoggedIn) {
    return false;
  }
  // If no roles return true
  if (roles && roles.length == 0) {
    return true;
  }
  // Check roles
  if (roles && roles.length > 0) {
    return roles?.includes(user.role);
  }

  return false;
};
