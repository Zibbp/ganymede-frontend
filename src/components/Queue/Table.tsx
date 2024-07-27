import {
  ActionIcon,
  Button,
  Loader,
  Modal,
  Switch,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import GanymedeLoader from "../Utils/GanymedeLoader";
import { DataTable } from "mantine-datatable";
import {
  IconCheck,
  IconEye,
  IconPlayerPause,
  IconPlayerStop,
  IconSquareX,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { showNotification } from "@mantine/notifications";
import classes from "./Table.module.css"
import { useDisclosure } from "@mantine/hooks";

const QueueTable = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [records, setRecords] = useState(null);
  const [initialRecords, setInitialRecords] = useState(false);
  const [loading, setLoading] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [activeQueue, setActiveQueue] = useState(null);
  const [cancelQueueLoading, setCancelQueueLoading] = useState(false);
  const [deleteVideoAndFiles, setDeleteVideoAndFiles] = useState(false);
  const [blockVideoId, setBlockVideoId] = useState(false);

  const { isLoading, error, data } = useQuery({
    queryKey: ["queue"],
    queryFn: async () =>
      useApi(
        {
          method: "GET",
          url: "/api/v1/queue?processing=true",
          withCredentials: true,
        },
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
  }, [data, page, perPage]);

  const cancelQueueItem = useMutation({
    mutationKey: ["cancel-queue"],
    mutationFn: async () => {
      if (activeQueue == null) return;
      setCancelQueueLoading(true);
      try {
        await useApi(
          {
            method: "POST",
            url: `/api/v1/queue/${activeQueue.id}/stop`,
            withCredentials: true,
          },
          false
        )

        if (deleteVideoAndFiles) {
          await useApi(
            {
              method: "DELETE",
              url: `/api/v1/vod/${activeQueue.edges.vod.id}?delete_files=true`,
              withCredentials: true,
            },
            false
          )
        }

        if (blockVideoId) {
          await useApi(
            {
              method: "POST",
              url: `/api/v1/blocked-video/${activeQueue.edges.vod.ext_id}`,
              withCredentials: true,
            },
            false
          )
        }

        queryClient.invalidateQueries(["queue"]);
        showNotification({
          title: "Queue Item Cancelled",
          message: "Queue item has been cancelled successfully",
        });
        close();
        setCancelQueueLoading(false);
        setActiveQueue(null);
      } catch (err) {
        setCancelQueueLoading(false);
      }
    },
  });

  const checkFailed = (record) => {
    if (
      record.task_vod_create_folder == "failed" ||
      record.task_vod_create_folder == "failed" ||
      record.task_vod_save_info == "failed" ||
      record.task_video_download == "failed" ||
      record.task_video_convert == "failed" ||
      record.task_video_move == "failed" ||
      record.task_chat_download == "failed" ||
      record.task_chat_convert == "failed" ||
      record.task_chat_render == "failed" ||
      record.task_chat_move == "failed"
    ) {
      return true;
    }
    return false;
  };

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <div>
      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        records={records}
        columns={[
          {
            accessor: "id",
            title: "ID",
          },
          { accessor: "edges.vod.ext_id", title: "External ID" },
          {
            accessor: "processing",
            title: "Status",
            render: (value) => (
              <div>
                {checkFailed(value) && (
                  <div>
                    <Tooltip label="Task in 'failed' state">
                      <Text className={classes.errBadge}>ERROR</Text>
                    </Tooltip>
                  </div>
                )}
                {value.processing && !checkFailed(value) && !value.on_hold && (
                  <div>
                    <Tooltip label="Processing">
                      <Loader mt={2} color="green" size="sm" />
                    </Tooltip>
                  </div>
                )}
                {value.processing && !checkFailed(value) && value.on_hold && (
                  <div>
                    <Tooltip label="On Hold">
                      <ThemeIcon variant="outline" color="orange">
                        <IconPlayerPause />
                      </ThemeIcon>
                    </Tooltip>
                  </div>
                )}
              </div>
            ),
          },

          {
            accessor: "live_archive",
            title: "Live Archive",
            render: ({ live_archive }) => (
              <Text>{live_archive ? "true" : "false"}</Text>
            ),
          },
          {
            accessor: "created_at",
            title: "Created At",
            render: ({ created_at }) => (
              <Text>{new Date(created_at).toLocaleString()}</Text>
            ),
          },
          {
            accessor: "actions",
            title: "Actions",
            render: (record) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Link href={"/queue/" + record.id}>
                  <Tooltip label="View queue item" withinPortal>
                    <ActionIcon >
                      <IconEye size="1.125rem" />
                    </ActionIcon>
                  </Tooltip>
                </Link>
                <Tooltip label="Stop queue item" withinPortal>
                  <ActionIcon
                    color="red"
                    onClick={() => {
                      setActiveQueue(record);
                      open();
                    }}
                  >
                    <IconSquareX size="1.125rem" />
                  </ActionIcon>
                </Tooltip>
              </div>
            ),
          },
        ]}
        totalRecords={data.length}
        page={page}
        recordsPerPage={perPage}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={[10, 20, 50]}
        onRecordsPerPageChange={setPerPage}
      />
      <Modal opened={opened} onClose={close} title="Cancel Queue Item">
        <div>
          <Text>Are you sure you want to cancel the queue item?</Text>
          <Text size="sm" fs="italic">For live archives this will stop the video and chat download then proceed with post-processing. For VOD archives this will stop all the tasks.</Text>
          <Switch
            mt={5}
            defaultChecked
            color="red"
            label="Delete video and video files"
            checked={deleteVideoAndFiles}
            onChange={(event) => setDeleteVideoAndFiles(event.currentTarget.checked)}
          />
          {(activeQueue != null && !activeQueue.live_archive) && (<Switch
            mt={5}
            defaultChecked
            color="violet"
            label="Block video ID"
            checked={blockVideoId}
            onChange={(event) => setBlockVideoId(event.currentTarget.checked)}
          />)}
          <Button variant="filled" color="violet" fullWidth loading={cancelQueueLoading} mt={10} onClick={() => cancelQueueItem.mutate()}>Cancel Queue Item</Button>
        </div>
      </Modal>
    </div>
  );
};

export default QueueTable;
