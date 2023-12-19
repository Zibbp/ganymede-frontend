import {
  Container,
  Text,
  Button,
  Drawer,
  Title,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import React, { useState } from "react";
import AdminVodDrawer from "../../components/Admin/Vods/Drawer";
import AdminVodsTable from "../../components/Admin/Vods/Table";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import classes from "./vods.module.css"

const AdminVodsPage = () => {
  const [drawerOpened, setDrawerOpened] = useState(false);

  useDocumentTitle("Ganymede - Admin - VODs");

  const closeDrawerCallback = () => {
    setDrawerOpened(false);
  };

  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <div>
        <Container size="2xl">
          <div className={classes.header}>
            <div>
              <Title order={2}>VODs</Title>
            </div>
            <div className={classes.right}>
              <Button
                onClick={() => setDrawerOpened(true)}
                variant="outline"
                color="green"
                mr={5}
              >
                Create
              </Button>
            </div>
          </div>
          <AdminVodsTable />
        </Container>
        <Drawer
          className={classes.vodDrawer}
          opened={drawerOpened}
          onClose={() => setDrawerOpened(false)}
          title="VOD"
          padding="xl"
          size="xl"
          position="right"
        >
          <AdminVodDrawer handleClose={closeDrawerCallback} mode="create" />
        </Drawer>
      </div>
    </Authorization>
  );
};

export default AdminVodsPage;
