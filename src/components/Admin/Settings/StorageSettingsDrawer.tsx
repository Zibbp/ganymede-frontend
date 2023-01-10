import {
  ActionIcon,
  Button,
  Code,
  Collapse,
  createStyles,
  Switch,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconChevronDown, IconChevronUp } from "@tabler/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApi } from "../../../hooks/useApi";
import GanymedeLoader from "../../Utils/GanymedeLoader";

const useStyles = createStyles((theme) => ({
  notificationRow: {
    display: "flex",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  },
  notificationRight: {
    marginTop: "0.5rem",
    marginLeft: "auto",
    order: 2,
  },
  link: {
    color: theme.colors.blue[6],
  },
}));

const AdminStorageSettingsDrawer = ({ handleClose }) => {
  const { classes, cx, theme } = useStyles();

  const { handleSubmit } = useForm();

  const [folderTemplate, setFolderTemplate] = useState("");
  const [fileTemplate, setFileTemplate] = useState("");

  const [loading, setLoading] = useState(false);

  const folderExample1 = "{{id}}-{{uuid}}";
  const folderExample2 = "{{created_at}}-{{title}}-{{type}}-{{id}}-{{uuid}}";
  const fileExample1 = "{{id}}";

  const { data, error, isLoading } = useQuery({
    refetchOnWindowFocus: false,
    queryKey: ["admin-storage-settings"],
    queryFn: () => {
      return useApi(
        {
          method: "GET",
          url: "/api/v1/config/storage",
          withCredentials: true,
        },
        false
      ).then((res) => {
        setFolderTemplate(res?.data.folder_template);
        setFileTemplate(res?.data.file_template);
        return res?.data;
      });
    },
  });

  const { mutate, error: mutateError } = useMutation({
    mutationKey: ["save-storage-settings"],
    mutationFn: () => {
      setLoading(true);
      return useApi(
        {
          method: "PUT",
          url: "/api/v1/config/storage",
          data: {
            folder_template: folderTemplate,
            file_template: fileTemplate,
          },
          withCredentials: true,
        },
        false
      )
        .then((res) => {
          setLoading(false);
          showNotification({
            title: "Success",
            message: "Updated storage template settings.",
          });
          return res?.data;
        })
        .catch((err) => {
          setLoading(false);
          return err;
        });
    },
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <GanymedeLoader />;

  return (
    <div>
      <Text mb={10}>
        Customize how folders and files are named. This only applies to new
        files. To apply to existing files execute the migration task on the{" "}
        <Link className={classes.link} href="/admin/tasks">
          tasks
        </Link>{" "}
        page.
      </Text>
      <form onSubmit={handleSubmit(mutate)}>
        <div>
          <Title order={4}>Folder Template</Title>

          <Textarea
            description="{{uuid}} is required to be present for the folder template."
            value={folderTemplate}
            onChange={(event) => setFolderTemplate(event.currentTarget.value)}
            required
          />
        </div>

        <div>
          <Title mt={5} order={4}>
            File Template
          </Title>

          <Textarea
            description="Do not include the file extension. The file type will be appened to the end of the file name such as -video -chat and -thumbnail."
            value={fileTemplate}
            onChange={(event) => setFileTemplate(event.currentTarget.value)}
            required
          />
        </div>

        <div>
          <Title mt={5} order={4}>
            Available Variables
          </Title>

          <div>
            <Text>Ganymede</Text>
            <Code>{"{{uuid}}"}</Code>
            <Text>Twitch Video</Text>
            <Code>
              {"{{id}} {{channel}} {{title}} {{created_at}} {{type}}"}
            </Code>
            <Text ml={20} mt={5} size="sm">
              ID: Twitch Video ID <br /> Type: Twitch Video Type (live, archive,
              highlight)
            </Text>
          </div>
        </div>

        <div>
          <Title mt={5} order={4}>
            Examples
          </Title>

          <Text>Folder</Text>
          <Code block>{folderExample1}</Code>
          <Code block>{folderExample2}</Code>
          <Text>File</Text>
          <Code block>{fileExample1}</Code>
        </div>

        <Button
          mt={10}
          type="submit"
          fullWidth
          radius="md"
          size="md"
          color="violet"
          loading={loading}
        >
          Save
        </Button>
      </form>
    </div>
  );
};

export default AdminStorageSettingsDrawer;
