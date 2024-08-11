import { Button, Code, Switch } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useApi } from "../../hooks/useApi";

const QueueRestartTaskModalContent = ({ queue, task }: any) => {
  const [checked, setChecked] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const restartTaskMutation = useMutation({
    mutationKey: ["restart-task"],
    mutationFn: () => {
      setIsLoading(true);
      return useApi(
        {
          method: "POST",
          url: `/api/v1/queue/task/start`,
          data: {
            queue_id: queue.id,
            task_name: task,
            continue: checked,
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
        Restart queue task <Code>{task}</Code>?
      </div>
      <div>
        <Switch
          mt={10}
          label="Continue with subsequent tasks"
          checked={checked}
          onChange={(event) => setChecked(event.currentTarget.checked)}
        />
      </div>
      <div>
        <Button
          onClick={() => restartTaskMutation.mutate()}
          fullWidth
          radius="md"
          mt="sm"
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
