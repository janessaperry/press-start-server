/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
	await knex("users").del();
	await knex("users").insert([
		{
			id: 1,
			username: "jane_doe",
			email: "jane.doe@example.com",
			password: "password",
		},
		{
			id: 2,
			username: "mark_smith92",
			email: "mark.smith92@example.com",
			password: "password",
		},
		{
			id: 3,
			username: "emily_rose",
			email: "emily.rose@example.com",
			password: "password",
		},
	]);
}
