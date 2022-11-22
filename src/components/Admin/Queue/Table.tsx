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
  createStyles,
  Drawer,
  Group,
  Modal,
  TextInput,
} from "@mantine/core";
import { IconEye, IconPencil, IconSearch, IconTrash } from "@tabler/icons";
import { useDebouncedValue } from "@mantine/hooks";

import AdminMultiUserDelete from "../Users/MultiDelete";
import AdminQueueDrawer from "./Drawer";
import AdminQueueDelete from "./Delete";
import AdminMultiQueueDelete from "./MultiDelete";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  actionButton: {
    cursor: "pointer",
  },
  actionButtons: {
    display: "flex",
  },
  queueDrawer: {
    overflowY: "scroll",
  },
}));

const AdminQueueTable = () => {
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
  const [activeQueue, setActiveQueue] = useState(null);
  const [deletedOpened, setDeletedOpened] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<[]>([]);
  const [multiDeleteOpened, setMultiDeleteOpened] = useState(false);

  const { isLoading, error, data } = useQuery({
    queryKey: ["admin-queue"],
    queryFn: async () =>
      useApi(
        { method: "GET", url: "/api/v1/queue", withCredentials: true },
        false
      ).then((res) => res?.data),
  });

  useEffect(() => {
    if (data && !initialRecords) {
      setRecords(data.slice(0, perPage));
      setInitialRecords(true);
    }
    if (data && initialRecords) {
      const from = (page - 1) * perPage;
      const to = from + perPage;
      setRecords(data.slice(from, to));
    }
    if (data && initialRecords) {
      const tmpData = sortBy(data, sortStatus.columnAccessor);
      const from = (page - 1) * perPage;
      const to = from + perPage;
      if (sortStatus.direction === "desc") {
        tmpData.reverse();
        setRecords(tmpData.slice(from, to));
      } else {
        setRecords(tmpData.slice(from, to));
      }
    }
    if (data && debouncedQuery != "") {
      // Search by ID, name, or display_name
      setRecords(
        data.filter((queue) => {
          return (
            queue.id.toString().includes(debouncedQuery) ||
            queue.edges.vod.id.toString().includes(debouncedQuery) ||
            queue.edges.vod.ext_id.toString().includes(debouncedQuery)
          );
        })
      );
    }
  }, [data, page, perPage, sortStatus, debouncedQuery]);

  const openDrawer = (queue) => {
    setActiveQueue(queue);
    setDrawerOpened(true);
  };

  const closeDrawerCallback = () => {
    setDrawerOpened(false);
  };

  const openDeleteModal = (queue) => {
    setActiveQueue(queue);
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
            uppercase
            mb={5}
            leftIcon={<IconTrash size={16} />}
            color="red"
            disabled={!selectedRecords.length}
            onClick={() => {
              openMultiDeleteModal();
            }}
          >
            {selectedRecords.length
              ? `Delete ${
                  selectedRecords.length === 1
                    ? "one selected queue"
                    : `${selectedRecords.length} selected queues`
                }`
              : "Select queues to delete"}
          </Button>
        )}
        <TextInput
          sx={{ flexBasis: "60%" }}
          placeholder="Search queues..."
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
          { accessor: "edges.vod.id", title: "VOD ID", sortable: true },
          {
            accessor: "edges.vod.ext_id",
            title: "External ID",
            sortable: true,
          },
          {
            accessor: "processing",
            title: "Processing",
            sortable: true,
            render: ({ processing }) => {
              return processing ? "true" : "false";
            },
          },
          {
            accessor: "on_hold",
            title: "On Hold",
            sortable: true,
            render: ({ on_hold }) => {
              return on_hold ? "true" : "false";
            },
          },
          {
            accessor: "live_archive",
            title: "Live Archive",
            sortable: true,
            render: ({ live_archive }) => {
              return live_archive ? "true" : "false";
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
            textAlignment: "right",
            render: (queue) => (
              <Group spacing={4} position="right" noWrap>
                <Link href={"/queue/" + queue.id}>
                  <ActionIcon className={classes.actionButton}>
                    <IconEye size={18} />
                  </ActionIcon>
                </Link>
                <ActionIcon
                  onClick={() => openDrawer(queue)}
                  className={classes.actionButton}
                >
                  <IconPencil size={18} />
                </ActionIcon>
                <ActionIcon
                  onClick={() => openDeleteModal(queue)}
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
        // select
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
      />
      <Drawer
        className={classes.queueDrawer}
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="Queue"
        padding="xl"
        size="xl"
        position="right"
      >
        <AdminQueueDrawer
          queue={activeQueue}
          handleClose={closeDrawerCallback}
          mode="edit"
        />
      </Drawer>
      <Modal
        opened={deletedOpened}
        onClose={() => setDeletedOpened(false)}
        title="Delete Queue"
      >
        <AdminQueueDelete
          queue={activeQueue}
          handleClose={closeDeleteModalCallback}
        />
      </Modal>
      <Modal
        opened={multiDeleteOpened}
        onClose={() => setMultiDeleteOpened(false)}
        title="Delete Queues"
      >
        <AdminMultiQueueDelete
          queues={selectedRecords}
          handleClose={closeMultiDeleteModalCallback}
        />
      </Modal>
    </div>
  );
};

export default AdminQueueTable;
