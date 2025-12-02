CREATE TABLE `apps` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`logo_url` text,
	`created_at` integer DEFAULT '"2025-11-28T09:00:31.931Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-28T09:00:31.931Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`version_id` text NOT NULL,
	`language_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`order` integer DEFAULT 0 NOT NULL,
	`parent_id` text,
	`is_folder` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT '"2025-11-28T09:00:31.931Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2025-11-28T09:00:31.931Z"' NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`version_id`) REFERENCES `versions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_name` text DEFAULT 'Docuverse' NOT NULL,
	`brand_logo` text,
	`brand_description` text,
	`primary_color` text DEFAULT '#000000',
	`updated_at` integer DEFAULT '"2025-11-28T09:00:31.932Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `versions` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`app_id`) REFERENCES `apps`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `apps_slug_unique` ON `apps` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `languages_app_code_idx` ON `languages` (`app_id`,`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `pages_ver_lang_slug_idx` ON `pages` (`version_id`,`language_id`,`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `versions_app_slug_idx` ON `versions` (`app_id`,`slug`);