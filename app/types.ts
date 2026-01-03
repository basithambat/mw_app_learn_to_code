

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
  article_id?: string; // ID of the article associated with the comment (legacy)
  postId?: string; // New: post ID
  comment: string; // Content of the comment
  body?: string; // New: comment body (same as comment)
  created_at: string; // Date and time the comment was created
  createdAt?: string; // New: ISO date string
  id: string; // Unique identifier for the comment
  likes?: string[]; // Array of user IDs who liked the comment (legacy)
  upvotes?: number; // New: upvote count
  downvotes?: number; // New: downvote count
  score?: number; // New: comment score
  parent_id: string | null; // Parent comment ID (if it's a reply)
  parentId?: string | null; // New: parent ID
  replies: Comment[]; // Array of replies to the comment
  replies_count?: number; // Total number of replies
  updated_at?: string; // Date and time the comment was last updated
  editedAt?: string | null; // New: edited timestamp
  state?: string; // New: comment state (visible, removed_user, etc.)
  user?: User; // User who posted the comment (legacy - for backward compat)
  user_id?: string; // User ID of the commenter (legacy)
  persona?: CommentPersona; // New: persona info (public identity)
  personaId?: string; // New: persona ID
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