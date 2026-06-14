ALTER TABLE `widgets` ADD `title` text NOT NULL DEFAULT 'Widget';--> statement-breakpoint
ALTER TABLE `widgets` ADD `created_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `widgets` ADD `updated_at` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `widgets` SET `created_at` = CAST(unixepoch('subsec') * 1000 AS INTEGER), `updated_at` = CAST(unixepoch('subsec') * 1000 AS INTEGER) WHERE `created_at` = 0;--> statement-breakpoint
UPDATE `widgets` SET `title` = CASE `type` WHEN 'text' THEN 'Text' WHEN 'bar' THEN 'Bar chart' WHEN 'line' THEN 'Line chart' ELSE 'Widget' END WHERE `title` = 'Widget';
