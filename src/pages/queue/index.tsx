import { Container, Center, Title } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import React from "react";
import { Authorization, ROLES } from "../../components/ProtectedRoute";
import QueueTable from "../../components/Queue/Table";

const QueuePage = () => {
  useDocumentTitle("Queue - Ganymede");
  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <Container mt={10} size="7xl">
        <QueueTable />
      </Container>
    </Authorization>
  );
};

export default QueuePage;
