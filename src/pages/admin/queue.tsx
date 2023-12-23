import {
  Container,
  Text,
  Button,
  Drawer,
  Title,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import React, { useState } from "react";
import AdminQueueTable from "../../components/Admin/Queue/Table";
import AdminUsersTable from "../../components/Admin/Users/Table";
import AdminVodDrawer from "../../components/Admin/Vods/Drawer";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import classes from "./queue.module.css"

const AdminQueuePage = () => {
  const [drawerOpened, setDrawerOpened] = useState(false);

  useDocumentTitle("Ganymede - Admin - Queue");

  const closeDrawerCallback = () => {
    setDrawerOpened(false);
  };

  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <div>
        <Container size="2xl">
          <div className={classes.header}>
            <div>
              <Title order={2}>Queue</Title>
            </div>
          </div>
          <AdminQueueTable />
        </Container>
      </div>
    </Authorization>
  );
};

export default AdminQueuePage;
