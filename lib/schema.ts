import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

export const apps = sqliteTable('apps', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const appsRelations = relations(apps, ({ many }) => ({
  versions: many(versions),
  languages: many(languages),
  pages: many(pages),
}));

export const versions = sqliteTable('versions', {
  id: text('id').primaryKey(),
  appId: text('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
}, (t) => ({
  unq: uniqueIndex('versions_app_slug_idx').on(t.appId, t.slug),
}));

export const versionsRelations = relations(versions, ({ one, many }) => ({
  app: one(apps, {
    fields: [versions.appId],
    references: [apps.id],
  }),
  pages: many(pages),
}));

export const languages = sqliteTable('languages', {
  id: text('id').primaryKey(),
  appId: text('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
}, (t) => ({
  unq: uniqueIndex('languages_app_code_idx').on(t.appId, t.code),
}));

export const languagesRelations = relations(languages, ({ one, many }) => ({
  app: one(apps, {
    fields: [languages.appId],
    references: [apps.id],
  }),
  pages: many(pages),
}));

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  appId: text('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
  versionId: text('version_id').notNull().references(() => versions.id, { onDelete: 'cascade' }),
  languageId: text('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  content: text('content'),
  order: integer('order').notNull().default(0),
  parentId: text('parent_id'), // Self-reference handled in relations
  isFolder: integer('is_folder', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
}, (t) => ({
  unq: uniqueIndex('pages_ver_lang_slug_idx').on(t.versionId, t.languageId, t.slug),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  app: one(apps, {
    fields: [pages.appId],
    references: [apps.id],
  }),
  version: one(versions, {
    fields: [pages.versionId],
    references: [versions.id],
  }),
  language: one(languages, {
    fields: [pages.languageId],
    references: [languages.id],
  }),
  parent: one(pages, {
    fields: [pages.parentId],
    references: [pages.id],
    relationName: 'parent_child',
  }),
  children: many(pages, {
    relationName: 'parent_child',
  }),
}));

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['super_admin', 'admin'] }).notNull().default('admin'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  brandName: text('brand_name').notNull().default('Docuverse'),
  brandLogo: text('brand_logo'),
  brandDescription: text('brand_description'),
  primaryColor: text('primary_color').default('#000000'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const pageViews = sqliteTable('page_views', {
  id: text('id').primaryKey(),
  pageId: text('page_id').notNull().references(() => pages.id, { onDelete: 'cascade' }),
  viewedAt: integer('viewed_at', { mode: 'timestamp' }).notNull().default(new Date()),
});

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  page: one(pages, {
    fields: [pageViews.pageId],
    references: [pages.id],
  }),
}));
