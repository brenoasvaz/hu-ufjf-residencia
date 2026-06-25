CREATE TABLE `activity_preceptors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activity_id` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_preceptors_id` PRIMARY KEY(`id`)
);
