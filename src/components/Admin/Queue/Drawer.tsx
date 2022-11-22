import { Button, Select, Switch, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";

const AdminQueueDrawer = ({ handleClose, queue, mode }) => {
  const { handleSubmit } = useForm();
  const [id, setId] = useState(queue?.id);
  const [processing, setProcessing] = useState(queue?.processing);
  const [onHold, setOnHold] = useState(queue?.on_hold);
  const [videoProcessing, setVideoProcessing] = useState(
    queue?.video_processing
  );
  const [chatProcessing, setChatProcessing] = useState(queue?.chat_processing);
  const [liveArchive, setLiveArchive] = useState(queue?.live_archive);
  const [taskVodCreateFolder, setTaskVodCreateFolder] = useState(
    queue?.task_vod_create_folder
  );
  const [taskVodDownloadThumbnail, setTaskVodDownloadThumbnail] = useState(
    queue?.task_vod_download_thumbnail
  );
  const [taskVodSaveInfo, setTaskVodSaveInfo] = useState(
    queue?.task_vod_save_info
  );
  const [taskVideoDownload, setTaskVideoDownload] = useState(
    queue?.task_video_download
  );
  const [taskVideoConvert, setTaskVideoConvert] = useState(
    queue?.task_video_convert
  );
  const [taskVideoMove, setTaskVideoMove] = useState(queue?.task_video_move);
  const [taskChatDownload, setTaskChatDownload] = useState(
    queue?.task_chat_download
  );
  const [taskChatConvert, setTaskChatConvert] = useState(
    queue?.task_chat_convert
  );
  const [taskChatRender, setTaskChatRender] = useState(queue?.task_chat_render);
  const [taskChatMove, setTaskChatMove] = useState(queue?.task_chat_move);
  const [createdAt, setCreatedAt] = useState(queue?.createdAt);
  const [loading, setLoading] = useState(false);

  const statusData = [
    { label: "Success", value: "success" },
    { label: "Running", value: "running" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
  ];

  const queryClient = useQueryClient();

  const { mutate, isLoading, error } = useMutation({
    mutationKey: ["create-queue"],
    mutationFn: () => {
      if (mode == "edit") {
        setLoading(true);
        return useApi(
          {
            method: "PUT",
            url: `/api/v1/queue/${id}`,
            data: {
              processing: processing,
              task_vod_create_folder: taskVodCreateFolder,
              task_vod_download_thumbnail: taskVodDownloadThumbnail,
              task_vod_save_info: taskVodSaveInfo,
              task_video_download: taskVideoDownload,
              task_video_convert: taskVideoConvert,
              task_video_move: taskVideoMove,
              task_chat_download: taskChatDownload,
              task_chat_convert: taskChatConvert,
              task_chat_render: taskChatRender,
              task_chat_move: taskChatMove,
              on_hold: onHold,
              video_processing: videoProcessing,
              chat_processing: chatProcessing,
              live_archive: liveArchive,
            },
            withCredentials: true,
          },
          false
        )
          .then(() => {
            queryClient.invalidateQueries(["admin-queue"]);
            setLoading(false);
            showNotification({
              title: "Queue Updated",
              message: "Queue has been updated successfully",
            });
            handleClose();
          })
          .catch((err) => {
            setLoading(false);
          });
      }
    },
  });

  return (
    <div>
      <form onSubmit={handleSubmit(mutate)}>
        <TextInput
          value={id}
          onChange={(e) => setId(e.currentTarget.value)}
          placeholder="Auto Generated"
          label="ID"
          disabled
          mb="xs"
        />

        <Switch
          label="Is Processing"
          checked={processing}
          onChange={(e) => setProcessing(e.currentTarget.checked)}
        />

        <Switch
          label="On Hold"
          checked={onHold}
          onChange={(e) => setOnHold(e.currentTarget.checked)}
        />

        <Switch
          label="Video Processing"
          checked={videoProcessing}
          onChange={(e) => setVideoProcessing(e.currentTarget.checked)}
        />

        <Switch
          label="Chat Processing"
          checked={chatProcessing}
          onChange={(e) => setChatProcessing(e.currentTarget.checked)}
        />

        <Switch
          label="Live Archive"
          checked={liveArchive}
          onChange={(e) => setLiveArchive(e.currentTarget.checked)}
        />

        <Select
          label="Create Folder"
          data={statusData}
          value={taskVodCreateFolder}
          onChange={setTaskVodCreateFolder}
          searchable
          required
          mb="xs"
        />

        <Select
          label="Download Thumbnail"
          data={statusData}
          value={taskVodDownloadThumbnail}
          onChange={setTaskVodDownloadThumbnail}
          searchable
          required
          mb="xs"
        />

        <Select
          label="Save Info"
          data={statusData}
          value={taskVodSaveInfo}
          onChange={setTaskVodSaveInfo}
          searchable
          required
          mb="xs"
        />

        <Select
          label="Video Download"
          data={statusData}
          value={taskVideoDownload}
          onChange={setTaskVideoDownload}
          searchable
          required
          mb="xs"
        />

        <Select
          label="Video Convert"
          data={statusData}
          value={taskVideoConvert}
          onChange={setTaskVideoConvert}
          searchable
          required
          mb="xs"
        />

        <Select
          label="Chat Download"
          data={statusData}
          value={taskChatDownload}
          onChange={setTaskChatDownload}
          searchable
          required
          mb="xs"
        />

        <Select
          label="Chat Convert"
          data={statusData}
          value={taskChatConvert}
          onChange={setTaskChatConvert}
          searchable
          required
          mb="xs"
        />

        <Select
          label="Chat Render"
          data={statusData}
          value={taskChatRender}
          onChange={setTaskChatRender}
          searchable
          required
          mb="xs"
        />

        <Select
          label="Chat Move"
          data={statusData}
          value={taskChatMove}
          onChange={setTaskChatMove}
          searchable
          required
          mb="xs"
        />

        <Button
          type="submit"
          fullWidth
          radius="md"
          size="md"
          color="violet"
          loading={loading}
        >
          {mode == "edit" ? "Update Queue" : "Create Queue"}
        </Button>
      </form>
    </div>
  );
};

export default AdminQueueDrawer;
