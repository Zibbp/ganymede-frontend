import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useApi } from "../../../hooks/useApi";
import GanymedeLoader from "../../Utils/GanymedeLoader";
import sortBy from "lodash/sortBy";
import {
  ActionIcon,
  createStyles,
  Drawer,
  Group,
  Modal,
  TextInput,
} from "@mantine/core";
import { IconPencil, IconSearch, IconTrash } from "@tabler/icons";
import { useDebouncedValue } from "@mantine/hooks";
import AdminChannelDrawer from "./Drawer";
import AdminChannelsDelete from "./Delete";

const useStyles = createStyles((theme) => ({
  actionButton: {
    cursor: "pointer",
  },
  actionButtons: {
    display: "flex",
  },
}));

const AdminChannelsTable = () => {
  const { classes, cx, theme } = useStyles();
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
  const [activeChannel, setActiveChannel] = useState(null);
  const [deletedOpened, setDeletedOpened] = useState(false);

  const { isLoading, error, data } = useQuery({
    queryKey: ["admin-channels"],
    queryFn: async () =>
      useApi(
        { method: "GET", url: "/api/v1/channel", withCredentials: true },
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
        data.filter((channel) => {
          return (
            channel.id.toString().includes(debouncedQuery) ||
            channel.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            channel.display_name
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase())
          );
        })
      );
    }
  }, [data, page, perPage, sortStatus, debouncedQuery]);

  const openDrawer = (channel) => {
    setActiveChannel(channel);
    setDrawerOpened(true);
  };

  const closeDrawerCallback = () => {
    setDrawerOpened(false);
  };

  const openDeleteModal = (channel) => {
    setActiveChannel(channel);
    setDeletedOpened(true);
  };

  const closeDeleteModalCallback = () => {
    setDeletedOpened(false);
  };

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <div>
      <div>
        <TextInput
          sx={{ flexBasis: "60%" }}
          placeholder="Search channels..."
          icon={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          mb={10}
        />
      </div>
      <DataTable
        withBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        records={records}
        columns={[
          { accessor: "id", title: "ID" },
          { accessor: "ext_id", title: "External ID" },
          { accessor: "name", title: "Name", sortable: true },
          { accessor: "display_name", title: "Display Name", sortable: true },
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
            textAlignment: "right",
            render: (channel) => (
              <Group spacing={4} position="right" noWrap>
                <ActionIcon
                  onClick={() => openDrawer(channel)}
                  className={classes.actionButton}
                >
                  <IconPencil size={18} />
                </ActionIcon>
                <ActionIcon
                  onClick={() => openDeleteModal(channel)}
                  className={classes.actionButton}
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
      />
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="Channel"
        padding="xl"
        size="xl"
        position="right"
      >
        <AdminChannelDrawer
          channel={activeChannel}
          handleClose={closeDrawerCallback}
          mode="edit"
        />
      </Drawer>
      <Modal
        opened={deletedOpened}
        onClose={() => setDeletedOpened(false)}
        title="Delete Channel"
      >
        <AdminChannelsDelete
          handleClose={closeDeleteModalCallback}
          channel={activeChannel}
        />
      </Modal>
    </div>
  );
};

export default AdminChannelsTable;
