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

import AdminMultiUserDelete from "../Users/MultiDelete";
import AdminQueueDrawer from "./Drawer";
import AdminQueueDelete from "./Delete";
import AdminMultiQueueDelete from "./MultiDelete";
import AdminWatchedDrawer from "./Drawer";
import AdminWatchedDelete from "./Delete";
import AdminMultiWatchedDelete from "./MultiDelete";
import classes from "./Watched.module.css"

const AdminWatchedTable = () => {
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
  const [activeWatched, setActiveWatched] = useState(null);
  const [deletedOpened, setDeletedOpened] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<[]>([]);
  const [multiDeleteOpened, setMultiDeleteOpened] = useState(false);

  const { isLoading, error, data } = useQuery({
    queryKey: ["admin-watched"],
    queryFn: async () =>
      useApi(
        { method: "GET", url: "/api/v1/live", withCredentials: true },
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
        data.filter((watched) => {
          return (
            watched.id.toString().includes(debouncedQuery) ||
            watched.edges.channel.id.toString().includes(debouncedQuery) ||
            watched.edges.channel.name
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase())
          );
        })
      );
    }
  }, [data, page, perPage, sortStatus, debouncedQuery]);

  const openDrawer = (watched) => {
    setActiveWatched(watched);
    setDrawerOpened(true);
  };

  const closeDrawerCallback = () => {
    setDrawerOpened(false);
  };

  const openDeleteModal = (watched) => {
    setActiveWatched(watched);
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
                ? "one selected watched channel"
                : `${selectedRecords.length} selected watched channels`
              }`
              : "Select watched channels to delete"}
          </Button>
        )}
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
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        records={records}
        columns={[
          { accessor: "id", title: "ID" },
          {
            accessor: "edges.channel.display_name",
            title: "Channel",
            sortable: true,
          },
          {
            accessor: "watch_live",
            title: "Watch Live",
            sortable: true,
            render: ({ watch_live }) => {
              return watch_live ? "true" : "false";
            },
          },
          {
            accessor: "watch_vod",
            title: "Watch Videos",
            sortable: true,
            render: ({ watch_vod }) => {
              return watch_vod ? "true" : "false";
            },
          },

          {
            accessor: "actions",
            title: "Actions",
            textAlignment: "right",
            render: (watched) => (
              <Group spacing={4} position="right" noWrap>
                <ActionIcon
                  onClick={() => openDrawer(watched)}
                  className={classes.actionButton}
                  variant="light"
                >
                  <IconPencil size={18} />
                </ActionIcon>
                <ActionIcon
                  onClick={() => openDeleteModal(watched)}
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
        className={classes.queueDrawer}
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="Watched Channel"
        padding="xl"
        size="xl"
        position="right"
      >
        <AdminWatchedDrawer
          watched={activeWatched}
          handleClose={closeDrawerCallback}
          mode="edit"
        />
      </Drawer>
      <Modal
        opened={deletedOpened}
        onClose={() => setDeletedOpened(false)}
        title="Delete Watched Channel"
      >
        <AdminWatchedDelete
          watched={activeWatched}
          handleClose={closeDeleteModalCallback}
        />
      </Modal>
      <Modal
        opened={multiDeleteOpened}
        onClose={() => setMultiDeleteOpened(false)}
        title="Delete Watched Channel"
      >
        <AdminMultiWatchedDelete
          watched={selectedRecords}
          handleClose={closeMultiDeleteModalCallback}
        />
      </Modal>
    </div>
  );
};

export default AdminWatchedTable;
