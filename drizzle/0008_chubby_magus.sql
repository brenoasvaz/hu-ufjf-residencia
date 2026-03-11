CREATE TABLE `simulado_template_questoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`template_id` int NOT NULL,
	`questao_id` int NOT NULL,
	`ordem` int NOT NULL,
	CONSTRAINT `simulado_template_questoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simulado_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modelo_id` int NOT NULL,
	`total_questoes` int NOT NULL,
	`criado_por_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `simulado_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `simulado_templates_modelo_id_unique` UNIQUE(`modelo_id`)
);
--> statement-breakpoint
ALTER TABLE `modelos_prova` ADD `status` enum('rascunho','em_revisao','liberado') DEFAULT 'rascunho' NOT NULL;