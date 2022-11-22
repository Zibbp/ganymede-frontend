import {
  Container,
  createStyles,
  Text,
  Button,
  Drawer,
  Title,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import React, { useState } from "react";
import AdminUsersTable from "../../components/Admin/Users/Table";
import AdminVodDrawer from "../../components/Admin/Vods/Drawer";
import { Authorization, ROLES } from "../../components/ProtectedRoute";

const useStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  },
  right: {
    marginLeft: "auto",
    order: 2,
  },
  vodDrawer: {
    overflowY: "scroll",
  },
}));

const AdminUsersPage = () => {
  const { classes, cx, theme } = useStyles();
  const [drawerOpened, setDrawerOpened] = useState(false);

  useDocumentTitle("Ganymede - Admin - Users");

  const closeDrawerCallback = () => {
    setDrawerOpened(false);
  };

  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <div>
        <Container size="2xl">
          <div className={classes.header}>
            <div>
              <Title order={2}>Users</Title>
            </div>
          </div>
          <AdminUsersTable />
        </Container>
      </div>
    </Authorization>
  );
};

export default AdminUsersPage;
