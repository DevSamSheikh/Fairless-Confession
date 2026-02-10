import { pgTable, uuid, varchar, timestamp, integer, text, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const categoryEnum = pgEnum('category', ['College', 'Work', 'Love', 'Drama', 'Dark', 'Funny', 'Secrets']);
export const roleEnum = pgEnum('role', ['Member', 'Moderator', 'Admin']);
export const reactionEnum = pgEnum('reaction_type', ['Like', 'Funny', 'Supportive', 'Unbelievable', 'Thought', 'Anger']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  identityId: varchar('identity_id', { length: 50 }).unique().notNull(),
  avatarSeed: varchar('avatar_seed', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  postsCount: integer('posts_count').default(0).notNull(),
  reactionsCount: integer('reactions_count').default(0).notNull(),
});

export const societies = pgTable('societies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  description: text('description'),
  iconName: varchar('icon_name', { length: 50 }),
  memberCount: integer('member_count').default(0).notNull(),
  isPrivate: boolean('is_private').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  societyId: uuid('society_id').references(() => societies.id),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  category: categoryEnum('category').notNull(),
  reactionsSummary: jsonb('reactions_summary').default({}).notNull(),
  commentCount: integer('comment_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isTrending: boolean('is_trending').default(false).notNull(),
});

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => posts.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reactions = pgTable('reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').references(() => posts.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  reactionType: reactionEnum('reaction_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const societyMembers = pgTable('society_members', {
  userId: uuid('user_id').references(() => users.id).notNull(),
  societyId: uuid('society_id').references(() => societies.id).notNull(),
  role: roleEnum('role').default('Member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});
