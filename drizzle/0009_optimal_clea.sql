CREATE TABLE `links_categorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`icone` varchar(64),
	`ordem` int NOT NULL DEFAULT 0,
	`ativo` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `links_categorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `links_uteis` ADD `categoria_id` int;