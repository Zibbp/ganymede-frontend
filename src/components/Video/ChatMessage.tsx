import React from "react";
import {
  Comment,
  GanymedeFormattedBadge,
  GanymedeFormattedMessageFragments,
} from "../../ganymede-defs";
import { Text, Tooltip } from "@mantine/core";
import classes from "./ChatMessage.module.css"


const ChatMessage = ({ comment }: Comment) => {

  return (
    <div key={comment._id} className={classes.chatMessage}>
      <span>
        {comment.ganymede_formatted_badges &&
          comment.ganymede_formatted_badges.map(
            (badge: GanymedeFormattedBadge) => (
              <Tooltip label={badge.title} position="top">
                <img
                  className={classes.badge}
                  src={badge.url}
                  height="18"
                />
              </Tooltip>
            )
          )}
      </span>
      <Text
        // className={classes.username}
        fw={700}
        lh={1}
        size="sm"
        style={{ color: comment.message.user_color }}
        span
      >
        {comment.commenter.display_name}
      </Text>
      <Text className={classes.message} span>
        :{" "}
      </Text>
      {comment.ganymede_formatted_message &&
        comment.ganymede_formatted_message.map(
          (fragment: GanymedeFormattedMessageFragments) => {
            switch (fragment.type) {
              case "text":
                return (
                  <Text className={classes.message} span>
                    {fragment.text}
                  </Text>
                );
              case "emote":
                const emoteName = fragment.emote?.name || fragment.text; // If no emote name, fallback on fragment text
                if (fragment.emote?.height != 0 && fragment.emote?.width != 0) {
                  return (
                    <Tooltip label={emoteName} position="top">
                      <img
                        src={fragment.url}
                        className={classes.emoteImage}
                        height={fragment.emote?.height}
                        alt={emoteName}
                      />
                    </Tooltip>
                  );
                } else {
                  return (
                    <Tooltip label={emoteName} position="top">
                      <img
                        src={fragment.url}
                        className={classes.emoteImage}
                        alt={emoteName}
                        height={28}
                      />
                    </Tooltip>
                  );
                }
            }
          }
        )}
    </div>
  );
};

export default ChatMessage;
