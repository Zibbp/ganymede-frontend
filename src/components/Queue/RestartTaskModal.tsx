import { Button, Code, Switch } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../hooks/useApi";

const QueueRestartTaskModalContent = ({ queue, task }: any) => {
  const [checked, setChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const restartTaskMutation = useMutation({
    mutationKey: ["restart-task"],
    mutationFn: () => {
      setIsLoading(true);
      return useApi(
        {
          method: "POST",
          url: `/api/v1/archive/restart`,
          data: {
            queue_id: queue.id,
            task: task,
            cont: checked,
          },
          withCredentials: true,
        },
        false
      ).then(() => {
        setIsLoading(false);
        showNotification({
          title: "Task Restarted",
          message: "Task has been restarted",
        });
      });
    },
  });

  console.log(queue, task);
  return (
    <div>
      <div>
        Restart task <Code>{task}</Code> for queue item <Code>{queue.id}</Code>?
      </div>
      <div>
        <Switch
          label="Continue with subsequent steps"
          checked={checked}
          onChange={(event) => setChecked(event.currentTarget.checked)}
        />
      </div>
      <div>
        <Button
          onClick={() => restartTaskMutation.mutate()}
          fullWidth
          radius="md"
          mt="xl"
          size="md"
          color="green"
          loading={isLoading}
        >
          Restart
        </Button>
      </div>
    </div>
  );
};

export default QueueRestartTaskModalContent;
