CREATE TABLE `alternativas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questao_id` int NOT NULL,
	`letra` varchar(1) NOT NULL,
	`texto` text NOT NULL,
	`is_correta` int NOT NULL DEFAULT 0,
	CONSTRAINT `alternativas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `especialidades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(128) NOT NULL,
	`descricao` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `especialidades_id` PRIMARY KEY(`id`),
	CONSTRAINT `especialidades_nome_unique` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `modelos_prova` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(256) NOT NULL,
	`descricao` text,
	`duracao_minutos` int NOT NULL DEFAULT 60,
	`configuracao` text NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`criado_por_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `modelos_prova_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`especialidade_id` int NOT NULL,
	`enunciado` text NOT NULL,
	`fonte` varchar(64),
	`ano` int,
	`subcategoria` varchar(255),
	`ativo` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `respostas_usuario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`simulado_id` int NOT NULL,
	`questao_id` int NOT NULL,
	`alternativa_id` int,
	`is_correta` int NOT NULL DEFAULT 0,
	`respondida_em` timestamp NOT NULL,
	CONSTRAINT `respostas_usuario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simulado_questoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`simulado_id` int NOT NULL,
	`questao_id` int NOT NULL,
	`ordem` int NOT NULL,
	CONSTRAINT `simulado_questoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simulados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`modelo_id` int NOT NULL,
	`data_inicio` timestamp NOT NULL,
	`data_fim` timestamp,
	`duracao_minutos` int NOT NULL,
	`total_questoes` int NOT NULL,
	`total_acertos` int NOT NULL DEFAULT 0,
	`concluido` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `simulados_id` PRIMARY KEY(`id`)
);
