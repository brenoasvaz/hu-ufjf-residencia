CREATE TABLE `clube_revista` (
	`id` int AUTO_INCREMENT NOT NULL,
	`data` date NOT NULL,
	`titulo_artigo` varchar(500) NOT NULL,
	`autores` varchar(500),
	`revista` varchar(255),
	`ano_publicacao` int,
	`residente_apresentador` varchar(255),
	`preceptor` varchar(255),
	`observacao` text,
	`pdf_url` text,
	`pdf_key` varchar(500),
	`pdf_nome` varchar(255),
	`ativo` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clube_revista_id` PRIMARY KEY(`id`)
);
