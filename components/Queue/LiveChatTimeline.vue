<template>
  <div>
    <Timeline
      :value="customTimelineData"
      align="left"
      class="customized-timeline"
    >
      <template #marker="slotProps">
        <span
          v-if="slotProps.item.status == 'success'"
          class="custom-marker shadow-2"
          :style="{ backgroundColor: '#10b981' }"
        >
          <i class="pi pi-check"></i>
        </span>
        <span
          v-if="slotProps.item.status == 'running'"
          class="custom-marker shadow-2"
          :style="{ backgroundColor: '#3b82f6' }"
        >
          <i class="icon-spin pi pi-spinner"></i>
        </span>
        <span
          v-if="slotProps.item.status == 'pending'"
          class="custom-marker shadow-2"
          :style="{ backgroundColor: '#a3a3a3' }"
        >
          <i class="pi pi-clock"></i>
        </span>
        <span
          v-if="slotProps.item.status == 'failed'"
          class="custom-marker shadow-2"
          :style="{ backgroundColor: '#dc2626' }"
        >
          <i class="pi pi-times-circle"></i>
        </span>
      </template>
      <template #content="slotProps">
        <div class="w-flex dark:w-text-light-400">
          <span
            @click="showLogs(slotProps.item.log_name)"
            v-tooltip.top="'Logs'"
            class="w-mr-1 w-cursor-pointer"
            v-if="slotProps.item.log_preview"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-h-4.5 w-w-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
          <i
            v-if="slotProps.item.restart"
            @click="confirmStepRestart(slotProps.item.json_name)"
            v-tooltip.top="'Restart Step'"
            class="pi pi-refresh w-cursor-pointer w-mr-2"
          ></i>

          <span>{{ slotProps.item.name }} </span>
        </div>
      </template>
    </Timeline>
  </div>
</template>

<script setup>
import Timeline from "primevue/timeline";
const { $bus } = useNuxtApp();

const props = defineProps({
  queue: {
    type: Object,
    required: true,
  },
});

const customTimelineData = ref([
  {
    name: "Chat Download",
    status: props.queue.task_chat_download,
    json_name: "chat_download",
    log_preview: true,
    log_name: "chat",
    restart: false,
  },
  {
    name: "Chat Convert",
    status: props.queue.task_chat_convert,
    json_name: "chat_convert",
    log_preview: false,
    restart: true,
  },
  {
    name: "Chat Render",
    status: props.queue.task_chat_render,
    json_name: "chat_render",
    log_preview: true,
    log_name: "chat-render",
    restart: true,
  },
  {
    name: "Chat Move",
    status: props.queue.task_chat_move,
    json_name: "chat_move",
    restart: true,
  },
]);

const confirmStepRestart = (stepName) => {
  $bus.$emit("show-restart-dialog", {
    task: stepName,
  });
};

const showLogs = (logType) => {
  $bus.$emit("show-log-modal", {
    logType: logType,
  });
};
</script>

<style lang="scss" scoped>
.custom-marker {
  display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  border-radius: 50%;
  z-index: 1;
}

.icon-spin {
  animation-name: spin;
  animation-duration: 4000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

::v-deep(.p-timeline-event-content) ::v-deep(.p-timeline-event-opposite) {
  line-height: 1;
}

@media screen and (max-width: 960px) {
  ::v-deep(.customized-timeline) {
    .p-timeline-event:nth-child(even) {
      flex-direction: row !important;

      .p-timeline-event-content {
        text-align: left !important;
      }
    }

    .p-timeline-event-opposite {
      flex: 0;
    }

    .p-card {
      margin-top: 1rem;
    }
  }
}
</style>
