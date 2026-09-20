CREATE TABLE `employees_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`hire_date` text NOT NULL,
	`base_salary` real NOT NULL,
	`role` text NOT NULL,
	`supervisor_id` integer DEFAULT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT `fk_employees_table_supervisor_id_employees_table_id_fk` FOREIGN KEY (`supervisor_id`) REFERENCES `employees_table`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE INDEX `supervisor_id_idx` ON `employees_table` (`supervisor_id`);