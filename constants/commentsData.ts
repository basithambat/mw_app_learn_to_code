import { CommentProp, Reply, User } from '../app/types';

const user1: User = { id: 'user1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' };
const user2: User = { id: 'user2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2' };
const user3: User = { id: 'user3', name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?img=3' };
const user4: User = { id: 'user4', name: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?img=4' };
const user5: User = { id: 'user5', name: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?img=5' };

export const mockComments: CommentProp[] = [
  {
    id: '1',
    author: user1,
    content: 'This is a great post!',
    timestamp: '2023-06-01T12:00:00Z',
    likesCount: 5,
    repliesCount: 2,
    liked: false
  },
  {
    id: '2',
    author: user2,
    content: 'I totally agree with you.',
    timestamp: '2023-06-01T13:00:00Z',
    likesCount: 3,
    repliesCount: 1,
    liked: true
  },
  {
    id: '10',
    author: user2,
    content: 'I totally agree with you.',
    timestamp: '2023-06-01T13:00:00Z',
    likesCount: 3,
    repliesCount: 1,
    liked: true
  },
  {
    id: '3',
    author: user2,
    content: 'I totally agree with you.',
    timestamp: '2023-06-01T13:00:00Z',
    likesCount: 3,
    repliesCount: 1,
    liked: true
  },
  {
    id: '4',
    author: user2,
    content: 'I totally agree with you.',
    timestamp: '2023-06-01T13:00:00Z',
    likesCount: 3,
    repliesCount: 1,
    liked: true
  },
  {
    id: '5',
    author: user2,
    content: 'I totally agree with you.',
    timestamp: '2023-06-01T13:00:00Z',
    likesCount: 3,
    repliesCount: 1,
    liked: true
  },
  {
    id: '9',
    author: user2,
    content: 'I totally agree with you.',
    timestamp: '2023-06-01T13:00:00Z',
    likesCount: 3,
    repliesCount: 1,
    liked: true
  },
];

export const mockReplies: { [key: string]: Reply[] } = {
  '1': [
    {
      id: 'reply1',
      commentId: '1',
      author: user3,
      content: 'Thanks for your comment!',
      timestamp: '2023-06-01T14:00:00Z',
      likesCount: 2,
      liked: false
    },
    {
      id: 'reply2',
      commentId: '1',
      author: user4,
      content: 'I appreciate your feedback.',
      timestamp: '2023-06-01T15:00:00Z',
      likesCount: 1,
      liked: true
    },
    {
      id: 'reply9',
      commentId: '1',
      author: user4,
      content: 'I appreciate your feedback.',
      timestamp: '2023-06-01T15:00:00Z',
      likesCount: 1,
      liked: true
    },
    {
      id: 'reply3',
      commentId: '1',
      author: user4,
      content: 'I appreciate your feedback.',
      timestamp: '2023-06-01T15:00:00Z',
      likesCount: 1,
      liked: true
    },
    {
      id: 'reply4',
      commentId: '1',
      author: user4,
      content: 'I appreciate your feedback.',
      timestamp: '2023-06-01T15:00:00Z',
      likesCount: 1,
      liked: true
    },
    {
      id: 'reply5',
      commentId: '1',
      author: user4,
      content: 'I appreciate your feedback.',
      timestamp: '2023-06-01T15:00:00Z',
      likesCount: 1,
      liked: true
    },
  ],
  '2': [
    {
      id: 'reply3',
      commentId: '2',
      author: user5,
      content: 'Glad you agree!',
      timestamp: '2023-06-01T16:00:00Z',
      likesCount: 0,
      liked: false
    }
  ]
};