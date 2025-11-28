import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const apps = sqliteTable('apps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s','now'))`)
});

export const versions = sqliteTable(
  'versions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    appId: integer('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => ({
    versionsAppSlugUnique: uniqueIndex('versions_app_slug_unique').on(table.appId, table.slug),
    versionsAppIdx: index('versions_app_idx').on(table.appId),
  })
);

export const languages = sqliteTable(
  'languages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    appId: integer('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    name: text('name').notNull(),
    isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => ({
    languagesCodeUniquePerApp: uniqueIndex('languages_code_unique_per_app').on(table.appId, table.code),
    languagesAppIdx: index('languages_app_idx').on(table.appId),
  })
);

export const pages = sqliteTable(
  'pages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    appId: integer('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
    versionId: integer('version_id').notNull().references(() => versions.id, { onDelete: 'cascade' }),
    languageId: integer('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    order: integer('order').notNull().default(0),
    parentId: integer('parent_id').references(() => pages.id, { onDelete: 'cascade' }),
    isFolder: integer('is_folder', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s','now'))`)
  },
  (table) => ({
    pagesAppIdx: index('pages_app_idx').on(table.appId),
    pagesVersionIdx: index('pages_version_idx').on(table.versionId),
    pagesLanguageIdx: index('pages_language_idx').on(table.languageId),
    pagesParentIdx: index('pages_parent_idx').on(table.parentId),
    pagesSlugUniquePerContext: uniqueIndex('pages_slug_unique_per_context').on(
      table.appId,
      table.versionId,
      table.languageId,
      table.slug,
    ),
  })
);

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin')
});

export const appsRelations = relations(apps, ({ many }) => ({
  versions: many(versions),
  languages: many(languages),
  pages: many(pages)
}));

export const versionsRelations = relations(versions, ({ one, many }) => ({
  app: one(apps, {
    fields: [versions.appId],
    references: [apps.id]
  }),
  pages: many(pages)
}));

export const languagesRelations = relations(languages, ({ one, many }) => ({
  app: one(apps, {
    fields: [languages.appId],
    references: [apps.id]
  }),
  pages: many(pages)
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  app: one(apps, {
    fields: [pages.appId],
    references: [apps.id]
  }),
  version: one(versions, {
    fields: [pages.versionId],
    references: [versions.id]
  }),
  language: one(languages, {
    fields: [pages.languageId],
    references: [languages.id]
  }),
  parent: one(pages, {
    fields: [pages.parentId],
    references: [pages.id]
  }),
  children: many(pages)
}));

// Zod schemas
export const insertAppSchema = createInsertSchema(apps);
export const selectAppSchema = createSelectSchema(apps);
export const insertVersionSchema = createInsertSchema(versions);
export const selectVersionSchema = createSelectSchema(versions);
export const insertLanguageSchema = createInsertSchema(languages);
export const selectLanguageSchema = createSelectSchema(languages);
export const insertPageSchema = createInsertSchema(pages);
export const selectPageSchema = createSelectSchema(pages);
export const insertUserSchema = createInsertSchema(users).omit({ passwordHash: true }).extend({ password: z.string().min(6) });
export const selectUserSchema = createSelectSchema(users);

export type App = typeof apps.$inferSelect;
export type NewApp = typeof apps.$inferInsert;
export type Version = typeof versions.$inferSelect;
export type Language = typeof languages.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type User = typeof users.$inferSelect;
