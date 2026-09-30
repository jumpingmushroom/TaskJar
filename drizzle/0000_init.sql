CREATE TABLE `draw` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`minutes_selected` integer NOT NULL,
	`task_id` integer,
	`outcome` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`resolved_at` integer,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "draw_minutes_values" CHECK("draw"."minutes_selected" IN (5, 15, 30)),
	CONSTRAINT "draw_outcome_values" CHECK("draw"."outcome" IN ('pending', 'taken', 'skipped', 'abandoned', 'empty'))
);
--> statement-breakpoint
CREATE INDEX `draw_session_idx` ON `draw` (`session_id`);--> statement-breakpoint
CREATE INDEX `draw_outcome_idx` ON `draw` (`outcome`);--> statement-breakpoint
CREATE TABLE `task` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`minutes` integer NOT NULL,
	`status` text DEFAULT 'jar' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`taken_at` integer,
	`done_at` integer,
	`skip_count` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "task_minutes_range" CHECK("task"."minutes" BETWEEN 1 AND 30),
	CONSTRAINT "task_title_length" CHECK(length(trim("task"."title")) BETWEEN 1 AND 120),
	CONSTRAINT "task_status_values" CHECK("task"."status" IN ('jar', 'open', 'done'))
);
--> statement-breakpoint
CREATE INDEX `task_status_idx` ON `task` (`status`);