import React from "react";
import {
  Comment,
  GanymedeFormattedBadge,
  GanymedeFormattedMessageFragments,
} from "../../ganymede-defs";
import { createStyles, Text, Image, Tooltip } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  chatMessage: {
    // Inter
    fontFamily: `Inter, ${theme.fontFamily}`,
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: "14px",
    marginTop: "4px",
    marginBottom: "4px",

    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[2]
        : theme.colors.dark[9],
  },
  username: {
    fontFamily: "Inter",
    fontWeight: 700,
    lineHeight: "20px",
    fontSize: "14px",
  },
  message: {
    fontFamily: "Inter",
    fontWeight: 400,
    lineHeight: "20px",
    fontSize: "14px",
  },
  badge: {
    paddingRight: "2px",
  },
  emoteImage: {
    paddingRight: "2px",
  },
}));

const ChatMessage = ({ comment }: Comment) => {
  const { classes, cx, theme } = useStyles();

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
              />
            )
          )}
      </span>
      <Text
        className={classes.username}
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
