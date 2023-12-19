import { Loader, ThemeIcon } from "@mantine/core";
import { IconCircleCheck, IconCircleX, IconHourglass } from "@tabler/icons-react";

const QueueTimelineBullet = ({ status }: any) => {
  if (status == "running") {
    return (
      <div style={{ marginTop: "6px", marginLeft: "0.3px" }}>
        <Loader size="sm" color="green" />
      </div>
    );
  }
  if (status == "success") {
    return (
      <div style={{ marginTop: "5px" }}>
        <ThemeIcon radius="xl" color="green">
          <IconCircleCheck />
        </ThemeIcon>
      </div>
    );
  }
  if (status == "failed") {
    return (
      <div style={{ marginTop: "5px" }}>
        <ThemeIcon radius="xl" color="red">
          <IconCircleX />
        </ThemeIcon>
      </div>
    );
  }
  if (status == "pending") {
    return (
      <div style={{ marginTop: "5px" }}>
        <ThemeIcon radius="xl" color="blue">
          <IconHourglass />
        </ThemeIcon>
      </div>
    );
  }
};

export default QueueTimelineBullet;
