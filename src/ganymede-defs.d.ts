export interface Video {
  id: string;
  ext_id: string;
  platform: string;
  type: string;
  title: string;
  duration: number;
  views: number;
  resolution: string;
  processing: boolean;
  thumbnail_path: string;
  web_thumbnail_path: string;
  video_path: string;
  chat_path: string;
  chat_video_path: string;
  info_path: string;
  caption_path: string;
  streamed_at: Date;
  created_at: Date;
  updated_at: Date;
  folder_name: string;
  file_name: string;
  edges: Edge;
}

export interface Edge {
  channel: Channel;
}

export interface Channel {
  id: string;
  ext_id: string;
  name: string;
  display_name: string;
  image_path: string;
  updated_at: Date;
  created_at: Date;
}

export interface GanymedeEmote {
  id: string;
  name: string;
  url: string;
  type: string;
  width: number;
  height: number;
}

export interface Comment {
  _id: string;
  created_at: Date;
  updated_at: Date;
  channel_id: string;
  content_type: string;
  content_id: string;
  content_offset_seconds: number;
  commenter: Commenter;
  source: string;
  state: string;
  message: Message;
  more_replies: boolean;
  ganymede_formatted_badges: GanymedeFormattedBadge[];
  ganymede_formatted_message: GanymedeFormattedMessageFragments[];
}

export interface GanymedeFormattedMessageFragments {
  type: string;
  text?: string;
  url?: string;
  emote?: GanymedeEmote;
}

export interface GanymedeFormattedBadge {
  _id: string;
  version: string;
  title: string;
  url: string;
}

export interface Commenter {
  display_name: string;
  _id: string;
  name: string;
  type: string;
  bio: null | string;
  created_at: Date;
  updated_at: Date;
  logo: string;
}

export enum Type {
  User = "user",
}

export enum ContentType {
  Video = "video",
}

export interface Message {
  body: string;
  bits_spent: number;
  fragments: Fragment[];
  is_action: boolean;
  user_badges: UserBadge[] | null;
  user_color: null | string;
  user_notice_params: UserNoticeParams;
  emoticons: EmoticonElement[] | null;
}

export interface EmoticonElement {
  _id: string;
  begin: number;
  end: number;
}

export interface Fragment {
  text: string;
  emoticon: FragmentEmoticon | null;
}

export interface FragmentEmoticon {
  emoticon_id: string;
  emoticon_set_id: string;
}

export interface UserBadge {
  _id: string;
  version: string;
}

export interface UserNoticeParams {
  msg_id: null;
}

// Badges

export interface Badges {
  badges: BadgeSets;
}

export interface BadgeSets {
  name: string;
  versions: BadgeVersion[];
}

export interface BadgeVersion {
  image_url_1x: string;
  image_url_2x: string;
  image_url_4x: string;
  description: string;
  title: string;
  click_action: string;
  click_url: string;
}

export interface PlaybackData {
  id: string;
  vod_id: string;
  user_id: string;
  status: string;
  time: number;
  updated_at: Date;
  created_at: Date;
}

export interface ProxyItem {
  url: string;
  header: string;
}

export interface Chapter {
  startTime: string;
  endTime: string;
  text: string;
}

export interface ChapterData {
  id: string;
  type: string;
  title: string;
  start?: number;
  end: number;
  edges: any;
}

export interface LiveTitleRegex {
  regex: string;
  negative: boolean;
  apply_to_videos: boolean;
}

type PlatformVideoInfo = {
  id: string;
  stream_id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string;
  chapters: Chapter[];
  muted_segments: MutedSegment[];
}

type MutedSegment = {
  duration: number;
  offset: number;
}

type Chapter = {
  id: string;
  type: string;
  title: string;
  start: number;
  end: number;
}

export interface Config {
  live_check_interval_seconds:  number;
  video_check_interval_minutes: number;
  registration_enabled:         boolean;
  parameters:                   Parameters;
  archive:                      Archive;
  notifications:                Notifications;
  storage_templates:            StorageTemplates;
  livestream:                   Livestream;
}

export interface Archive {
  save_as_hls: boolean;
}

export interface Livestream {
  proxies:          Proxy[];
  proxy_enabled:    boolean;
  proxy_parameters: string;
  proxy_whitelist:  any[];
}

export interface Proxy {
  url:    string;
  header: string;
}

export interface Notifications {
  video_success_webhook_url: string;
  video_success_template:    string;
  video_success_enabled:     boolean;
  live_success_webhook_url:  string;
  live_success_template:     string;
  live_success_enabled:      boolean;
  error_webhook_url:         string;
  error_template:            string;
  error_enabled:             boolean;
  is_live_webhook_url:       string;
  is_live_template:          string;
  is_live_enabled:           boolean;
}

export interface Parameters {
  twitch_token:    string;
  video_convert:   string;
  chat_render:     string;
  streamlink_live: string;
}

export interface StorageTemplates {
  folder_template: string;
  file_template:   string;
}
