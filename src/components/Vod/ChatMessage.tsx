import React from "react";
import {
  Comment,
  GanymedeFormattedBadge,
  GanymedeFormattedMessageFragments,
} from "../../ganymede-defs";
import { Text, Image, Tooltip } from "@mantine/core";
import classes from "./ChatMessage.module.css"


const ChatMessage = ({ comment }: Comment) => {

  return (
    <div key={comment._id} className={classes.chatMessage}>
      <span>
        {comment.ganymede_formatted_badges &&
          comment.ganymede_formatted_badges.map(
            (badge: GanymedeFormattedBadge) => (
              <img
                className={classes.badge}
                src={badge.url}
                title={badge.title}
                height="18"
              />
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
                if (fragment.emote?.height != 0 && fragment.emote?.width != 0) {
                  return (
                    <img
                      src={fragment.url}
                      className={classes.emoteImage}
                      height={fragment.emote?.height}
                      alt={fragment.emote?.name}
                      title={fragment.emote?.name}
                    />
                  );
                } else {
                  return (
                    <img
                      src={fragment.url}
                      className={classes.emoteImage}
                      alt={fragment.emote?.name}
                      height={28}
                      title={fragment.emote?.name}
                    />
                  );
                }
            }
          }
        )}
    </div>
  );
};

export default ChatMessage;
