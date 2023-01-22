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
