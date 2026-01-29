CREATE TABLE `activity_audiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activity_id` int NOT NULL,
	`ano_residencia` enum('R1','R2','R3'),
	`bloco` varchar(50),
	`opcional` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_audiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('RODIZIO','CRONOGRAMA') NOT NULL,
	`arquivo_nome` varchar(255) NOT NULL,
	`arquivo_url` text NOT NULL,
	`arquivo_key` varchar(500) NOT NULL,
	`usuario_admin_id` int NOT NULL,
	`status` enum('PENDENTE','PROCESSANDO','CONCLUIDO','ERRO') NOT NULL,
	`log_validacao` text,
	`registros_criados` int DEFAULT 0,
	`registros_atualizados` int DEFAULT 0,
	`registros_ignorados` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `imports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `residents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome_completo` varchar(255) NOT NULL,
	`apelido` varchar(100),
	`ano_residencia` enum('R1','R2','R3') NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `residents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rotation_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rotation_id` int NOT NULL,
	`resident_id` int NOT NULL,
	`papel_na_dupla` varchar(10),
	`dupla_id` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rotation_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`data_inicio` timestamp NOT NULL,
	`data_fim` timestamp NOT NULL,
	`mes_referencia` varchar(7) NOT NULL,
	`local_estagio` varchar(255) NOT NULL,
	`descricao` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`ativo` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stages_id` PRIMARY KEY(`id`),
	CONSTRAINT `stages_nome_unique` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `weekly_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dia_semana` int NOT NULL,
	`hora_inicio` varchar(5) NOT NULL,
	`hora_fim` varchar(5) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`local` varchar(255),
	`recorrente` int NOT NULL DEFAULT 1,
	`observacao` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weekly_activities_id` PRIMARY KEY(`id`)
);
