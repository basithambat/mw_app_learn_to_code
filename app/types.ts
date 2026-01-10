

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface NewsCategory {
  category: string;
  data: NewsItem[];
}

export interface ExpandedNewsItemProps {
  items: NewsItem[];
  initialIndex: number;
  isVisible: boolean;
  onClose: () => void;
  setIsCommentModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface NewsItem {
  category?: string;
  id: number;
  title: string;
  text: string;
  image: any;
  // Remove the 'category' property from NewsItem
}

export interface NewsCategory {
  category: string;
  data: NewsItem[];
}

//comment section

export interface User {
  id: string;
  name: string;
  pic: string;
}

export interface CommentPersona {
  id: string;
  type: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  badge: string | null;
}

export interface ArticleComment {
  article_id?: string;
  postId?: string;
  comment: string;
  body?: string;
  created_at: string;
  createdAt?: string;
  id: string;
  likes?: string[];
  upvotes?: number;
  downvotes?: number;
  score?: number;
  parent_id: string | null;
  parentId?: string | null;
  replies: ArticleComment[]; // Recursive type
  replies_count?: number;
  updated_at?: string;
  editedAt?: string | null;
  state?: string;
  user?: User;
  user_id?: string;
  persona?: CommentPersona;
  personaId?: string;
}

import { TextInput } from 'react-native';
export interface ExpandableInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  placeholderTextColor: string;
  replyingTo: any | null;
  onCancelReply: () => void;
  inputRef?: React.RefObject<TextInput>;
}