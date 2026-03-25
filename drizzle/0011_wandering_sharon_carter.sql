CREATE TABLE `escala_avaliacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ano` int NOT NULL,
	`ano_residencia` enum('R1','R2','R3') NOT NULL,
	`codigo_residente` varchar(10) NOT NULL,
	`nome_residente` varchar(255) NOT NULL,
	`quadrimestre` enum('1','2','3') NOT NULL,
	`preceptor_habilidades` varchar(255) NOT NULL,
	`preceptor_atendimento` varchar(255) NOT NULL,
	`data_limite` varchar(10),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `escala_avaliacoes_id` PRIMARY KEY(`id`)
);
