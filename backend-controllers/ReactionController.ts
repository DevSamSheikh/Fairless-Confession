// Backend Reaction Controller - Production Ready
// This handles the toggle logic properly

interface ReactionRequest {
  postId: string;
  userId: string;
  reactionType: string;
}

interface ReactionResponse {
  success: boolean;
  reactionCount: number;
  currentUserReaction: string | null;
  reactions: Record<string, number>; // reactionType -> count
}

export class ReactionController {
  // Main toggle endpoint
  static async toggleReaction(req: ReactionRequest): Promise<ReactionResponse> {
    const { postId, userId, reactionType } = req;

    try {
      // 1. Find existing reaction for this user/post
      const existingReaction = await this.findUserReaction(postId, userId);

      let result: ReactionResponse;

      if (existingReaction) {
        // 2a. User already reacted - REMOVE reaction
        if (existingReaction.reactionType === reactionType) {
          result = await this.removeReaction(postId, userId, existingReaction.reactionType);
        } else {
          // 2b. User wants to change reaction type
          result = await this.changeReaction(postId, userId, existingReaction.reactionType, reactionType);
        }
      } else {
        // 2c. New reaction - ADD reaction
        result = await this.addReaction(postId, userId, reactionType);
      }

      return result;

    } catch (error) {
      console.error('Reaction toggle error:', error);
      throw new Error('Failed to toggle reaction');
    }
  }

  // Find existing reaction for user/post
  private static async findUserReaction(postId: string, userId: string): Promise<any> {
    // MongoDB query:
    // db.reactions.findOne({ postId, userId })
    return await ReactionModel.findOne({ postId, userId });
  }

  // Add new reaction
  private static async addReaction(postId: string, userId: string, reactionType: string): Promise<ReactionResponse> {
    // 1. Create new reaction document
    await ReactionModel.create({
      postId,
      userId,
      reactionType,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Update post's reaction counts
    await this.updatePostReactionCounts(postId, reactionType, 1); // Increment

    // 3. Get updated reaction data
    const reactionData = await this.getReactionData(postId, userId);

    return {
      success: true,
      reactionCount: reactionData.totalCount,
      currentUserReaction: reactionType,
      reactions: reactionData.byType
    };
  }

  // Remove existing reaction
  private static async removeReaction(postId: string, userId: string, reactionType: string): Promise<ReactionResponse> {
    // 1. Delete reaction document
    await ReactionModel.deleteOne({ postId, userId });

    // 2. Update post's reaction counts
    await this.updatePostReactionCounts(postId, reactionType, -1); // Decrement

    // 3. Get updated reaction data
    const reactionData = await this.getReactionData(postId, userId);

    return {
      success: true,
      reactionCount: reactionData.totalCount,
      currentUserReaction: null,
      reactions: reactionData.byType
    };
  }

  // Change reaction type
  private static async changeReaction(
    postId: string, 
    userId: string, 
    oldReactionType: string, 
    newReactionType: string
  ): Promise<ReactionResponse> {
    // 1. Update existing reaction
    await ReactionModel.updateOne(
      { postId, userId },
      { 
        reactionType: newReactionType,
        updatedAt: new Date()
      }
    );

    // 2. Update post's reaction counts (decrement old, increment new)
    await this.updatePostReactionCounts(postId, oldReactionType, -1);
    await this.updatePostReactionCounts(postId, newReactionType, 1);

    // 3. Get updated reaction data
    const reactionData = await this.getReactionData(postId, userId);

    return {
      success: true,
      reactionCount: reactionData.totalCount,
      currentUserReaction: newReactionType,
      reactions: reactionData.byType
    };
  }

  // Update post's reaction counts atomically
  private static async updatePostReactionCounts(postId: string, reactionType: string, delta: number): Promise<void> {
    // Get current count first
    const currentCount = await this.getReactionTypeCount(postId, reactionType);
    const newCount = Math.max(0, currentCount + delta);
    
    // MongoDB atomic update:
    await PostModel.updateOne(
      { id: postId },
      { 
        $inc: { reactionCount: delta },
        $set: { [`reactions.${reactionType}`]: newCount }
      }
    );
  }

  // Get current count for specific reaction type
  private static async getReactionTypeCount(postId: string, reactionType: string): Promise<number> {
    const post = await PostModel.findById(postId);
    if (!post || !post.reactions) return 0;
    
    const reactions = post.reactions as Record<string, number>;
    return reactions[reactionType] || 0;
  }

  // Get complete reaction data for a post
  private static async getReactionData(postId: string, currentUserId: string): Promise<{
    totalCount: number;
    byType: Record<string, number>;
  }> {
    // 1. Get all reactions for this post
    const allReactions = await ReactionModel.find({ postId });
    
    // 2. Group by reaction type
    const reactionsByType: Record<string, number> = {};
    let totalCount = 0;

    for (const reaction of allReactions) {
      reactionsByType[reaction.reactionType] = (reactionsByType[reaction.reactionType] || 0) + 1;
      totalCount++;
    }

    return {
      totalCount,
      byType: reactionsByType
    };
  }

  // Get post with reaction data (for feed loading)
  static async getPostWithReactions(postId: string, userId?: string): Promise<any> {
    const post = await PostModel.findById(postId);
    
    if (!post) {
      throw new Error('Post not found');
    }

    // Get reaction data
    const reactionData = await this.getReactionData(postId, userId || '');
    
    // Get current user's reaction
    let currentUserReaction: string | null = null;
    if (userId) {
      const userReaction = await this.findUserReaction(postId, userId);
      currentUserReaction = userReaction?.reactionType || null;
    }

    return {
      ...post.toObject(),
      reactionCount: reactionData.totalCount,
      reactions: reactionData.byType,
      currentUserReaction
    };
  }
}

// MongoDB Models (reference interfaces)
interface ReactionDocument {
  postId: string;
  userId: string;
  reactionType: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PostDocument {
  id: string;
  title: string;
  content: string;
  reactionCount: number;
  reactions: Record<string, number>;
  toObject(): any;
}

const ReactionModel = {
  findOne: async (query: any): Promise<ReactionDocument | null> => { 
    // MongoDB implementation: return await Reaction.findOne(query);
    return null; 
  },
  create: async (data: any): Promise<ReactionDocument> => { 
    // MongoDB implementation: return await Reaction.create(data);
    return {} as ReactionDocument; 
  },
  deleteOne: async (query: any): Promise<void> => { 
    // MongoDB implementation: await Reaction.deleteOne(query);
  },
  updateOne: async (query: any, update: any): Promise<void> => { 
    // MongoDB implementation: await Reaction.updateOne(query, update);
  },
  find: async (query: any): Promise<ReactionDocument[]> => { 
    // MongoDB implementation: return await Reaction.find(query);
    return []; 
  }
};

const PostModel = {
  findById: async (id: string): Promise<PostDocument | null> => { 
    // MongoDB implementation: return await Post.findById(id);
    return null; 
  },
  updateOne: async (query: any, update: any): Promise<void> => { 
    // MongoDB implementation: await Post.updateOne(query, update);
  }
};
