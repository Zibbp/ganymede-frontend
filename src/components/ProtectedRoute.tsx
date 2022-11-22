import { useRouter } from "next/router";
import * as React from "react";
import useUserStore from "../store/user";
import { Unauthorized } from "./Error/Unauthorized";

export enum ROLES {
  ADMIN = "admin",
  EDITOR = "editor",
  ARCHIVER = "archiver",
  USER = "user",
}

type RoleTypes = keyof typeof ROLES;

export const useAuthorization = () => {
  const user = useUserStore((state) => state);

  let loggedIn = true;

  if (!user.isLoggedIn) {
    loggedIn = false;
  }

  const checkAccess = React.useCallback(
    ({ allowedRoles }: { allowedRoles: RoleTypes[] }) => {
      if (allowedRoles && allowedRoles.length > 0) {
        return allowedRoles?.includes(user.role);
      }

      return true;
    },
    [user.role]
  );

  return { checkAccess, role: user.role, loggedIn };
};

type AuthorizationProps = {
  forbiddenFallback?: React.ReactNode;
  children: React.ReactNode;
} & (
  | {
      allowedRoles: RoleTypes[];
      policyCheck?: never;
    }
  | {
      allowedRoles?: never;
      policyCheck: boolean;
    }
);

export const Authorization = ({
  policyCheck,
  allowedRoles,
  children,
}: AuthorizationProps) => {
  const { checkAccess, loggedIn } = useAuthorization();

  let canAccess = false;

  if (allowedRoles) {
    canAccess = checkAccess({ allowedRoles });
  }

  if (allowedRoles == null) {
    canAccess = true;
  }

  return <>{canAccess && loggedIn ? children : <Unauthorized />}</>;
};
