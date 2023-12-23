import {
  Center,
  Divider,
  Loader,
  LoadingOverlay,
  Text,
} from "@mantine/core";
import { randomId } from "@mantine/hooks";
import axios from "axios";
import getConfig from "next/config";
import { useEffect, useRef, useState } from "react";
import {
  Comment,
  BadgeVersion,
  GanymedeFormattedBadge,
  GanymedeEmote,
  GanymedeFormattedMessageFragments,
} from "../../ganymede-defs";
import ChatMessage from "./ChatMessage";
import vodDataBus from "./EventBus";
import classes from "./ExperimentalChatPlayer.module.css"

const ExperimentalChatPlayer = ({ vod }: any) => {
  const { publicRuntimeConfig } = getConfig();
  const [ready, setReady] = useState(false);
  let internalReady = false;
  let lastCheckTime = 0;
  let lastTime = 0;
  let lastEndTime = 0;
  let fetchInterval = 7;
  let chatOffsetSize = 10;
  let maxChatMessages = 50;
  let recChat = [] as Comment[];
  const chat = useRef(Array<Comment>());

  let channelID: string = "";

  let generalBadgeMap = new Map<string, BadgeVersion>();
  let subscriptionBadgeMap = new Map<string, BadgeVersion>();
  let subscriptionGiftBadgeMap = new Map<string, BadgeVersion>();
  let bitBadgeMap = new Map<string, BadgeVersion>();
  let emoteMap = new Map<string, GanymedeEmote>();

  const [count, setCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchEmotes = async () => {
      try {
        const data = await axios.get(
          `${publicRuntimeConfig.API_URL}/api/v1/vod/${vod.id}/chat/emotes`
        );
        console.log(`Loaded ${data.data.emotes.length} emotes`);
        data.data.emotes.forEach((emote: GanymedeEmote) => {
          if (emote.name == null || emote.name == "") {
            // If Twitch emote, see the emote ID as the key
            emoteMap.set(emote.id, emote);
          } else if (emote.type == "twitch") {
            // If Twitch emote, see the emote ID as the key
            emoteMap.set(emote.id, emote);
          } else {
            // Else set the emote name as the key
            emoteMap.set(emote.name, emote);
          }
        });
        console.log("Emote map:", emoteMap);
      } catch (error) {
        console.error("Error fetching emotes", error);
      }
    };

    const fetchBadges = async () => {
      // Fetch Twitch Badges

      try {
        const badgesResp = await axios.get(
          `${publicRuntimeConfig.API_URL}/api/v1/vod/${vod.id}/chat/badges`
        );

        for await (const badge of badgesResp.data.badges) {
          if (badge.name === "subscriber") {
            subscriptionBadgeMap.set(badge.version, badge);
          }
          if (badge.name === "sub-gifter") {
            subscriptionGiftBadgeMap.set(badge.version, badge);
          }
          if (badge.name === "bits") {
            bitBadgeMap.set(badge.version, badge);
          }
          if (badge.name == "no_audio" || badge.name == "no_video") {
            continue;
          }
          if (badge.name == "predictions") {
            continue;
          }
          generalBadgeMap.set(badge.name, badge);
        }

        console.log("General Badges map", generalBadgeMap);
        console.log("Subscription Badges map", subscriptionBadgeMap);
        console.log("Subscription Gift Badges map", subscriptionGiftBadgeMap);
        console.log("Bit Badges map", bitBadgeMap);

        console.log(`Loaded ${generalBadgeMap.size} general badges`);
        console.log(`Loaded ${subscriptionBadgeMap.size} subscription badges`);
      } catch (error) {
        console.error("Error fetching badges", error);
      }
    };

    // Fetch channel ID

    fetchBadges().then(() => {
      fetchEmotes().then(() => {
        setReady(true);
        internalReady = true;

        createCustomComment("Chat player ready.");
        createCustomComment(
          `Fetched ${generalBadgeMap.size.toLocaleString()} badges, ${subscriptionBadgeMap.size.toLocaleString()} subscription badges, and ${emoteMap.size.toLocaleString()} emotes.`
        );
      });
    });

    const addBadgesToComment = async (comment: Comment) => {
      const badges = [] as GanymedeFormattedBadge[];
      comment.ganymede_formatted_badges = badges;
      // console.debug("Add badge");
      // Add badges to comment
      if (comment.message.user_badges) {
        comment.message.user_badges?.forEach((badge) => {
          if (badge._id === "subscriber") {
            const ganymedeFormattedBadge: GanymedeFormattedBadge = {
              _id: badge._id,
              version: badge.version,
              title: subscriptionBadgeMap.get(badge.version)?.title,
              url: subscriptionBadgeMap.get(badge.version)?.image_url_1x,
            };

            comment.ganymede_formatted_badges.push(ganymedeFormattedBadge);
          } else if (badge._id === "sub-gifter" || badge._id === "sub_gifter") {
            const ganymedeFormattedBadge: GanymedeFormattedBadge = {
              _id: badge._id,
              version: badge.version,
              title: subscriptionGiftBadgeMap.get(badge.version)?.title,
              url: subscriptionGiftBadgeMap.get(badge.version)?.image_url_1x,
            };

            comment.ganymede_formatted_badges.push(ganymedeFormattedBadge);
          } else if (badge._id === "bits") {
            const ganymedeFormattedBadge: GanymedeFormattedBadge = {
              _id: badge._id,
              version: badge.version,
              title: bitBadgeMap.get(badge.version)?.title,
              url: bitBadgeMap.get(badge.version)?.image_url_1x,
            };

            comment.ganymede_formatted_badges.push(ganymedeFormattedBadge);
          } else if (badge._id == "no_audio" || badge._id == "no_video") {
            return;
          } else {
            const ganymedeFormattedBadge: GanymedeFormattedBadge = {
              _id: badge._id,
              version: badge.version,
              title: generalBadgeMap.get(badge._id)?.title,
              url: generalBadgeMap.get(badge._id)?.image_url_1x,
            };

            comment.ganymede_formatted_badges.push(ganymedeFormattedBadge);
          }
        });
      }
      return comment;
    };

    const addEmotesToComment = async (comment: Comment) => {
      let ganymedeFormattedMessage = [] as GanymedeFormattedMessageFragments[];
      // console.debug("Add emotes")
      // Process Twitch first party emotes
      if (comment.message.fragments.length > 0) {
        comment.message.fragments.forEach((fragment) => {
          let ganymedeMessageFragment = {} as GanymedeFormattedMessageFragments;
          if (fragment.emoticon) {
            const emote = emoteMap.get(fragment.emoticon.emoticon_id);
            if (!emote) {
              // If emote not found, fallback to using the emote ID and passing the URL
              ganymedeMessageFragment.type = "emote";
              ganymedeMessageFragment.url = `https://static-cdn.jtvnw.net/emoticons/v2/${fragment.emoticon.emoticon_id}/static/light/1.0`;
            } else if (emote?.type == "embed") {
              ganymedeMessageFragment.type = "emote";
              ganymedeMessageFragment.url = `data:image/png;base64,${emote.url}`;
              ganymedeMessageFragment.emote = emote;
            } else {
              ganymedeMessageFragment.type = "emote";
              ganymedeMessageFragment.url = emote?.url;
              ganymedeMessageFragment.emote = emote;
            }
          } else {
            // No first party emote fragments located. Check for third party emotes instead
            const msgSplit = fragment.text.split(" ");
            msgSplit.forEach((msg) => {
              let ganymedeThirdPartyMessageFragment =
                {} as GanymedeFormattedMessageFragments;
              const findEm = emoteMap.get(msg);
              if (!findEm) {
                ganymedeThirdPartyMessageFragment.type = "text";
                ganymedeThirdPartyMessageFragment.text = ` ${msg} `;
              } else {
                if (findEm?.type == "embed") {
                  if (msg == findEm?.name) {
                    ganymedeThirdPartyMessageFragment.type = "emote";
                    ganymedeThirdPartyMessageFragment.url = `data:image/png;base64,${findEm.url}`;
                    ganymedeThirdPartyMessageFragment.emote = findEm;
                  } else {
                    ganymedeThirdPartyMessageFragment.type = "text";
                    ganymedeThirdPartyMessageFragment.text = ` ${msg} `;
                  }
                } else if (msg != findEm?.name) {
                  ganymedeThirdPartyMessageFragment.type = "text";
                  ganymedeThirdPartyMessageFragment.text = ` ${msg} `;
                } else {
                  ganymedeThirdPartyMessageFragment.type = "emote";
                  ganymedeThirdPartyMessageFragment.url = findEm.url;
                  ganymedeThirdPartyMessageFragment.emote = findEm;
                }
              }
              ganymedeFormattedMessage.push(ganymedeThirdPartyMessageFragment);
            });
          }
          ganymedeFormattedMessage.push(ganymedeMessageFragment);
        });
      }
      return ganymedeFormattedMessage;
    };

    const fetchChat = async (start: Number, end: Number) => {
      try {
        const chatReq = await axios.get(
          `${publicRuntimeConfig.API_URL}/api/v1/vod/${vod.id}/chat?start=${start}&end=${end}`
        );
        if (chatReq.data && chatReq.data.length > 0) {
          // chat.push(...chatReq.data);
          // setChat((chat) => [...chat, ...chatReq.data]);
          recChat.push(...chatReq.data);
        }
      } catch (error) {
        console.error("Error fetching chat", error);
      }
    };

    const fetchSeekChat = async (start: Number, count: Number) => {
      try {
        const chatReq = await axios.get(
          `${publicRuntimeConfig.API_URL}/api/v1/vod/${vod.id}/chat/seek?start=${start}&count=${count}`
        );
        if (chatReq.data && chatReq.data.length > 0) {
          // chat.push(...chatReq.data);
          // setChat((chat) => [...chat, ...chatReq.data]);
          recChat.push(...chatReq.data);
        }
      } catch (error) {
        console.error("Error fetching chat", error);
      }
    };

    const chatTick = async (time: number) => {
      while (recChat.length !== 0) {
        let comment: Comment = recChat[0];
        if (comment.content_offset_seconds > time) {
          return;
        }

        recChat.shift();

        comment = await addBadgesToComment(comment);
        comment.ganymede_formatted_message = await addEmotesToComment(comment);
        chat.current.push(comment);

        // Clean up chat
        if (chat.current.length > maxChatMessages) {
          chat.current.shift();
        }
      }
    };

    const clearChat = () => {
      chat.current = [];
      recChat = [];
      createCustomComment("Time skip detected. Chat cleared.");
    };

    const videoPlayerInterval = setInterval(() => {
      setCount((count) => count + 1);

      const { time, playing, paused } = vodDataBus.getData();

      if (!internalReady) {
        return;
      }

      if (paused) {
        return;
      }

      messagesEndRef.current?.scrollIntoView();

      // Check if skip
      let cleared = false;
      if (Math.abs(time - lastTime) > 2) {
        console.log(`Player time skip detected - ${lastTime} -> ${time}`);
        clearChat();

        lastEndTime = 0;
        lastCheckTime = time;
        cleared = true;

        fetchSeekChat(time, 30);
      }

      lastTime = time;

      // Paused or not enough time has passed
      // if (time <= lastCheckTime + fetchInterval && !cleared) {
      if (time <= lastCheckTime) {
        return;
      }

      lastCheckTime = lastEndTime;
      if (lastEndTime === 0) {
        lastCheckTime = time;
      }

      lastEndTime = lastCheckTime + chatOffsetSize;

      fetchChat(lastCheckTime, lastEndTime);

      // temp
    }, 100);

    const chatInterval = setInterval(() => {
      const { time, playing, paused } = vodDataBus.getData();
      chatTick(time);
    }, 100);

    return () => {
      console.debug("Clearing chat intervals");
      clearInterval(videoPlayerInterval);
      clearInterval(chatInterval);
    };
  }, []);

  const createCustomComment = (message: string) => {
    const comment = {
      _id: randomId(),
      content_offset_seconds: 0,
      commenter: {
        display_name: "Ganymede",
      },
      message: {
        body: message,
        user_color: "#a65ee8",
      },
      ganymede_formatted_message: [
        {
          type: "text",
          text: message,
        },
      ],
    };
    chat.current.push(comment);
    // chat.push(comment);
  };

  return (
    <div className={classes.chatContainer}>
      {!ready && (
        <Center>
          <div style={{ marginTop: "100%" }}>
            <Center>
              <Loader color="violet" size="xl" />
            </Center>
            <Text mt={5}>Loading Chat</Text>
          </div>
        </Center>
      )}
      {ready && (
        <div>
          {chat.current.map((comment) => (
            <ChatMessage key={comment._id} comment={comment} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ExperimentalChatPlayer;
