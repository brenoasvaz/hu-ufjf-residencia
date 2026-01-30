CREATE TABLE `clinical_meetings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`data` timestamp NOT NULL,
	`tema` varchar(500) NOT NULL,
	`tipo` enum('AULA','ARTIGO','CASOS_CLINICOS','PROVA','AVALIACAO','EVENTO','FERIADO','RECESSO') NOT NULL,
	`preceptor` varchar(255),
	`residente_apresentador` varchar(50),
	`observacao` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinical_meetings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `presentation_guidelines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('AULA','ARTIGO','CASOS_CLINICOS') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`tempo_apresentacao` int NOT NULL,
	`tempo_discussao` int NOT NULL,
	`orientacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `presentation_guidelines_id` PRIMARY KEY(`id`),
	CONSTRAINT `presentation_guidelines_tipo_unique` UNIQUE(`tipo`)
);
