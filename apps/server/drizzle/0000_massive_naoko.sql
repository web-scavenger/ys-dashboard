CREATE TABLE `greetings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `greetings` (`message`) VALUES ('Hello world');
