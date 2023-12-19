import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useApi } from "../../../hooks/useApi";
import GanymedeLoader from "../../Utils/GanymedeLoader";
import sortBy from "lodash/sortBy";
import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Modal,
  TextInput,
} from "@mantine/core";
import { IconPencil, IconSearch, IconTrash } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import AdminUserDrawer from "./Drawer";
import AdminUserDelete from "./Delete";
import AdminMultiUserDelete from "./MultiDelete";
import classes from "./Users.module.css"

const AdminUsersTable = () => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [records, setRecords] = useState(null);
  const [initialRecords, setInitialRecords] = useState(false);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "name",
    direction: "asc",
  });
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const [activeUser, setActiveUser] = useState(null);
  const [deletedOpened, setDeletedOpened] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<[]>([]);
  const [multiDeleteOpened, setMultiDeleteOpened] = useState(false);

  const { isLoading, error, data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () =>
      useApi(
        { method: "GET", url: "/api/v1/user", withCredentials: true },
        false
      ).then((res) => res?.data),
  });

  useEffect(() => {
    if (data && !initialRecords) {
      setRecords(data.slice(0, perPage));
      setInitialRecords(true);
    }
    if (data) {
      const from = (page - 1) * perPage;
      const to = from + perPage;
      setRecords(data.slice(from, to));
    }
    if (data) {
      const tmpData = sortBy(data, sortStatus.columnAccessor);
      setRecords(sortStatus.direction === "desc" ? tmpData.reverse() : tmpData);
    }
    if (data && debouncedQuery != "") {
      // Search by ID, name, or display_name
      setRecords(
        data.filter((user) => {
          return (
            user.id.toString().includes(debouncedQuery) ||
            user.username.toLowerCase().includes(debouncedQuery.toLowerCase())
          );
        })
      );
    }
  }, [data, page, perPage, sortStatus, debouncedQuery]);

  const openDrawer = (user) => {
    setActiveUser(user);
    setDrawerOpened(true);
  };

  const closeDrawerCallback = () => {
    setDrawerOpened(false);
  };

  const openDeleteModal = (user) => {
    setActiveUser(user);
    setDeletedOpened(true);
  };

  const closeDeleteModalCallback = () => {
    setDeletedOpened(false);
  };

  const closeMultiDeleteModalCallback = () => {
    setMultiDeleteOpened(false);
    setSelectedRecords([]);
  };

  const openMultiDeleteModal = () => {
    setMultiDeleteOpened(true);
  };

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <div>
      <div>
        {selectedRecords.length > 0 && (
          <Button
            mb={5}
            leftIcon={<IconTrash size={16} />}
            color="red"
            disabled={!selectedRecords.length}
            onClick={() => {
              openMultiDeleteModal();
            }}
          >
            {selectedRecords.length
              ? `Delete ${selectedRecords.length === 1
                ? "one selected user"
                : `${selectedRecords.length} selected users`
              }`
              : "Select users to delete"}
          </Button>
        )}
        <TextInput
          sx={{ flexBasis: "60%" }}
          placeholder="Search users..."
          icon={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          mb={10}
        />
      </div>
      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        records={records}
        columns={[
          { accessor: "id", title: "ID" },
          { accessor: "username", title: "Username", sortable: true },
          { accessor: "role", title: "Role", sortable: true },
          {
            accessor: "oauth",
            title: "Auth Method",
            sortable: true,
            render: ({ oauth }) => {
              return oauth ? "SSO" : "Local";
            },
          },
          {
            accessor: "created_at",
            title: "Created At",
            sortable: true,
            render: ({ created_at }) => (
              <div>{dayjs(created_at).format("YYYY/MM/DD")}</div>
            ),
          },
          {
            accessor: "actions",
            title: "Actions",
            render: (user) => (
              <Group spacing={4} position="right" noWrap>
                <ActionIcon
                  onClick={() => openDrawer(user)}
                  className={classes.actionButton}
                  variant="light"
                >
                  <IconPencil size={18} />
                </ActionIcon>
                <ActionIcon
                  onClick={() => openDeleteModal(user)}
                  className={classes.actionButton}
                  variant="light" color="red"
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
        // pagination
        totalRecords={data.length}
        page={page}
        recordsPerPage={perPage}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={[20, 40, 100]}
        onRecordsPerPageChange={setPerPage}
        // sorting
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        // select
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
      />
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="User"
        padding="xl"
        size="xl"
        position="right"
      >
        <AdminUserDrawer
          user={activeUser}
          handleClose={closeDrawerCallback}
          mode="edit"
        />
      </Drawer>
      <Modal
        opened={deletedOpened}
        onClose={() => setDeletedOpened(false)}
        title="Delete User"
      >
        <AdminUserDelete
          user={activeUser}
          handleClose={closeDeleteModalCallback}
        />
      </Modal>
      <Modal
        opened={multiDeleteOpened}
        onClose={() => setMultiDeleteOpened(false)}
        title="Delete Users"
      >
        <AdminMultiUserDelete
          handleClose={closeMultiDeleteModalCallback}
          users={selectedRecords}
        />
      </Modal>
    </div>
  );
};

export default AdminUsersTable;
