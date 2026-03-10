ALTER TABLE `questoes` ADD `tem_imagem` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `questoes` ADD `image_url` text;--> statement-breakpoint
ALTER TABLE `questoes` ADD `image_key` varchar(500);--> statement-breakpoint
ALTER TABLE `questoes` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;