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
  Text,
  Tooltip,
  Button,
} from "@mantine/core";
import { IconPencil, IconSearch, IconTrash } from "@tabler/icons";
import { useDebouncedValue } from "@mantine/hooks";
import AdminVodDrawer from "./Drawer";
import AdminVodDelete from "./Delete";
import AdminMultiVodDelete from "./MutliDelete";

const useStyles = createStyles((theme) => ({
  actionButton: {
    cursor: "pointer",
  },
  actionButtons: {
    display: "flex",
  },
  vodDrawer: {
    overflowY: "scroll",
  },
}));

const AdminVodsTable = () => {
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
  const [activeVod, setActiveVod] = useState(null);
  const [deletedOpened, setDeletedOpened] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<[]>([]);
  const [multiDeleteOpened, setMultiDeleteOpened] = useState(false);

  const { isLoading, error, data } = useQuery({
    queryKey: ["admin-vods"],
    queryFn: async () =>
      useApi(
        { method: "GET", url: "/api/v1/vod", withCredentials: true },
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
      setRecords(
        data.filter((vod) => {
          return (
            vod.id.toString().includes(debouncedQuery) ||
            vod.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            vod.ext_id.toString().includes(debouncedQuery.toLowerCase()) ||
            vod.streamed_at.toString().includes(debouncedQuery.toLowerCase()) ||
            vod.edges.channel.name
              .toLowerCase()
              .includes(debouncedQuery.toLowerCase()) ||
            vod.edges.channel.id
              .toString()
              .includes(debouncedQuery.toLowerCase())
          );
        })
      );
    }
  }, [data, page, perPage, sortStatus, debouncedQuery]);

  const openDrawer = (vod) => {
    setActiveVod(vod);
    setDrawerOpened(true);
  };

  const closeDrawerCallback = () => {
    setDrawerOpened(false);
  };

  const openDeleteModal = (vod) => {
    setActiveVod(vod);
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
                    ? "one selected vod"
                    : `${selectedRecords.length} selected vods`
                }`
              : "Select vods to delete"}
          </Button>
        )}

        <TextInput
          sx={{ flexBasis: "60%" }}
          placeholder="Search vods..."
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
          {
            accessor: "id",
            title: "ID",
            width: 90,
            render: ({ id }) => (
              <Tooltip label={id}>
                <Text lineClamp={1}>{id}</Text>
              </Tooltip>
            ),
          },
          { accessor: "ext_id", title: "External ID" },
          {
            accessor: "edges.channel.display_name",
            title: "Channel",
            sortable: true,
          },
          { accessor: "title", title: "Title", sortable: true },
          { accessor: "type", title: "Type", sortable: true },

          {
            accessor: "streamed_at",
            title: "Streamed At",
            sortable: true,
            render: ({ streamed_at }) => (
              <div title={`${new Date(streamed_at).toLocaleString()}`}>
                {dayjs(streamed_at).format("YYYY/MM/DD")}
              </div>
            ),
          },
          {
            accessor: "created_at",
            title: "Archived At",
            sortable: true,
            render: ({ created_at }) => (
              <div title={`${new Date(created_at).toLocaleString()}`}>
                {dayjs(created_at).format("YYYY/MM/DD")}
              </div>
            ),
          },
          {
            accessor: "actions",
            title: "Actions",
            textAlignment: "right",
            render: (vod) => (
              <Group spacing={4} position="right" noWrap>
                <ActionIcon
                  onClick={() => openDrawer(vod)}
                  className={classes.actionButton}
                >
                  <IconPencil size={18} />
                </ActionIcon>
                <ActionIcon
                  onClick={() => openDeleteModal(vod)}
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
        className={classes.vodDrawer}
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="VOD"
        padding="xl"
        size="xl"
        position="right"
      >
        <AdminVodDrawer
          vod={activeVod}
          handleClose={closeDrawerCallback}
          mode="edit"
        />
      </Drawer>
      <Modal
        opened={deletedOpened}
        onClose={() => setDeletedOpened(false)}
        title="Delete Video"
      >
        <AdminVodDelete
          handleClose={closeDeleteModalCallback}
          vod={activeVod}
        />
      </Modal>
      <Modal
        opened={multiDeleteOpened}
        onClose={() => setMultiDeleteOpened(false)}
        title="Delete Videos"
      >
        <AdminMultiVodDelete
          handleClose={closeMultiDeleteModalCallback}
          vods={selectedRecords}
        />
      </Modal>
    </div>
  );
};

export default AdminVodsTable;
