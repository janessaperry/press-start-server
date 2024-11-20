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
			password: "$2b$10$X2w.UrJz3.NbdE5yqS9FxeFEuImRaYTqFtiXw2aMXUlSzQovLBqFS", // hashed 'password123'
		},
		{
			id: 2,
			username: "mark_smith92",
			email: "mark.smith92@example.com",
			password: "$2b$10$zQ7xoZTpH9CvP1a4K9Qfau5ZyU4HZ7XHg1dIEuYxRhyct.Zs6FTXi", // hashed 'secretPassword'
		},
		{
			id: 3,
			username: "emily_rose",
			email: "emily.rose@example.com",
			password: "$2b$10$Fq3K9tq.Q1nNSK1R2pH7iGq9yX76f5.J7biSPJPbT1FXJKMewkhwS", // hashed 'emily2024'
		},
	]);
}
