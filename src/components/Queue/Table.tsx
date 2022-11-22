import { createStyles, Loader, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../../hooks/useApi";
import GanymedeLoader from "../Utils/GanymedeLoader";
import { DataTable } from "mantine-datatable";
import { IconCheck, IconPlayerPause, IconX } from "@tabler/icons";
import Link from "next/link";
import { useEffect, useState } from "react";

const useStyles = createStyles((theme) => ({
  errBadge: {
    backgroundColor: theme.colors.red[6],
    width: "auto",
    padding: "0.25rem",
    color: theme.white,
    borderRadius: "0.25rem",
    textAlign: "center",
  },
}));

const QueueTable = () => {
  const { classes } = useStyles();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [records, setRecords] = useState(null);
  const [initialRecords, setInitialRecords] = useState(false);
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
            render: ({ id }) => <Link href={"/queue/" + id}>View</Link>,
          },
        ]}
        totalRecords={data.length}
        page={page}
        recordsPerPage={perPage}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={[10, 20, 50]}
        onRecordsPerPageChange={setPerPage}
      />
    </div>
  );
};

export default QueueTable;
