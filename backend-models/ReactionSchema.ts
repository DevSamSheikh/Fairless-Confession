// MongoDB Schema for Reactions
// Note: This is a reference implementation for your backend

interface IReaction {
  postId: string;
  userId: string;
  reactionType: string; // 'Like', 'Love', 'Supportive', etc.
  createdAt: Date;
  updatedAt: Date;
}

interface IPost {
  title: string;
  content: string;
  // ... other fields
  reactionCount: number;
  reactions: Map<string, number>; // reactionType -> count
}

// Reaction collection structure
const ReactionSchema = {
  postId: String,
  userId: String,
  reactionType: String,
  createdAt: Date,
  updatedAt: Date
};

// Compound index for efficient queries
const ReactionIndexes = [
  { postId: 1, userId: 1 }, // Unique compound index
  { postId: 1 },
  { userId: 1 }
];

// Post schema with reaction aggregation
const PostSchema = {
  title: String,
  content: String,
  // ... other fields
  reactionCount: { type: Number, default: 0 },
  reactions: { type: Map, of: Number, default: new Map<string, number>() }
};

// Middleware to update reaction counts
const updateReactionCounts = async (post: any) => {
  if (post.isModified('reactions')) {
    // Calculate total count from reactions map
    const reactions = post.reactions as Map<string, number>;
    post.reactionCount = Array.from(reactions.values()).reduce((sum: number, count: number) => sum + count, 0);
  }
};
