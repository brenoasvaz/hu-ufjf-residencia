CREATE TABLE `links_uteis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`descricao` text,
	`ordem` int NOT NULL DEFAULT 0,
	`ativo` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `links_uteis_id` PRIMARY KEY(`id`)
);
