import React, { useState, useEffect } from 'react'
import classes from "./blocked-vods.module.css"
import { Authorization, ROLES } from '../../components/ProtectedRoute'
import { Button, Code, Container, Title } from '@mantine/core'
import { useDocumentTitle } from '@mantine/hooks'
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import sortBy from "lodash/sortBy";
import {
  ActionIcon,
  Group,
  Modal,
  TextInput,
} from "@mantine/core";
import { IconPencil, IconSearch, IconTrash } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import GanymedeLoader from "../../components/Utils/GanymedeLoader";
import { useApi } from '../../hooks/useApi'
import { showNotification } from '@mantine/notifications'


type Props = {}

const BlockedVideos = (props: Props) => {
  const queryClient = useQueryClient();
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

  useDocumentTitle("Ganymede - Admin - Blocked VODs");

  const [activeBlockedVideo, setActiveBlockedVideo] = useState(null);
  const [createModal, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [deleteModal, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

  const [blockedVideoId, setBlockedVideoId] = useState("");

  const openDeleteModalHandler = (blockedVideo) => {
    setActiveBlockedVideo(blockedVideo);
    openDeleteModal()
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ["admin-blocked-vods"],
    queryFn: async () =>
      useApi(
        { method: "GET", url: "/api/v1/blocked-video", withCredentials: true },
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
        data.filter((blockedVideos) => {
          return (
            blockedVideos.id.includes(debouncedQuery)
          );
        })
      );
    }
  }, [data, page, perPage, sortStatus, debouncedQuery]);

  const createBlockedVideo = useMutation({
    mutationKey: ["create-blocked-vod"],
    mutationFn: (id: string) => {
      return useApi(
        {
          method: "POST",
          url: `/api/v1/blocked-video/${id}`,
          withCredentials: true,
        },
        false
      )
        .then(() => {
          queryClient.invalidateQueries(["admin-blocked-videos"]);
          closeCreateModal();
          setBlockedVideoId("");
        })
    },
  });

  const deleteBlockedVideo = useMutation({
    mutationKey: ["create-blocked-video"],
    mutationFn: () => {
      return useApi(
        {
          method: "DELETE",
          url: `/api/v1/blocked-video/${activeBlockedVideo.id}`,
          withCredentials: true,
        },
        false
      )
        .then(() => {
          queryClient.invalidateQueries(["admin-blocked-videos"]);
          closeDeleteModal();
        })
    },
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <Authorization allowedRoles={[ROLES.ARCHIVER, ROLES.EDITOR, ROLES.ADMIN]}>
      <div>
        <Container size="2xl">
          <div className={classes.header}>
            <div>
              <Title order={2}>Blocked VODs</Title>
            </div>
            <div className={classes.right}>
              <Button
                onClick={openCreateModal}
                variant="outline"
                color="green"
                mr={5}
              >
                Create
              </Button>
            </div>
          </div>

          {/* table */}
          <div>
            <div>
              <TextInput
                sx={{ flexBasis: "60%" }}
                placeholder="Search blocked vods..."
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
                  accessor: "created_at",
                  title: "Created At",
                  sortable: true,
                  width: 180,
                  render: ({ created_at }) => (
                    <div>{dayjs(created_at).format("YYYY/MM/DD")}</div>
                  ),
                },
                {
                  accessor: "actions",
                  title: "Actions",
                  width: 50,
                  render: (blockedVideo) => (
                    <Group>
                      <ActionIcon
                        onClick={() => openDeleteModalHandler(blockedVideo)}
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
            />
          </div>
        </Container>

      </div>
      <Modal opened={createModal} onClose={closeCreateModal} title="Create Blocked VOD">
        <div>
          <TextInput
            label="External VOD ID"
            placeholder="123456789"
            value={blockedVideoId}
            onChange={(event) => setBlockedVideoId(event.currentTarget.value)}
          />
          <Button fullWidth mt="md" variant="filled" color="green" onClick={() => createBlockedVideo.mutate(blockedVideoId)}>Create</Button>
        </div>
      </Modal>
      <Modal opened={deleteModal} onClose={closeDeleteModal} title="Delete Blocked VOD">
        <div>
          {activeBlockedVideo && (<Code>{activeBlockedVideo.id}</Code>)}
          <Button fullWidth mt="md" variant="filled" color="red" onClick={() => deleteBlockedVideo.mutate()}>Delete</Button>
        </div>
      </Modal>
    </Authorization>
  )
}

export default BlockedVideos