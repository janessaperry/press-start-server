/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
	return knex.schema.createTable("game_collection", (table) => {
		table.increments("id").primary();
		table
			.integer("userId")
			.unsigned()
			.references("users.id")
			.onUpdate("CASCADE")
			.onDelete("CASCADE");
		table.integer("gameId").notNullable();
		table.string("gameStatus").notNullable();
		table.string("gameConsole");
		table.string("gameFormat");
		table.timestamp("createdAt").defaultTo(knex.fn.now());
		table.timestamp("updatedAt").defaultTo(knex.fn.now());
	});
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
	return knex.schema.dropTable("game_collection");
}
