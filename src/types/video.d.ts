export interface GetVideosRequest {
  limit: number;
  offset: number;
  types: keyof typeof VideoType;
}

export interface VideoResponse {
  offset: number;
  limit: number;
  total_count: number;
  pages: number;
  data: Video[];
}

type VideoTypeList = `${VideoTypes},${VideoTypeList}` | VideoTypes;

export interface Video {
  id: string;
  ext_id: string;
  platform: string;
  type: VideoTypeList;
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
  streamed_at: string;
  created_at: string;
  updated_at: string;
  folder_name: string;
  file_name: string;
  edges: Edge;
}

interface Edge {
  channel: Channel;
}
