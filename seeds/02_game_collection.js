/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
	await knex("game_collection").del();
	await knex("game_collection").insert([
		{
			id: 1,
			userId: 1,
			gameId: 1942,
			gameStatus: "Want to play",
			gameConsole: "PS5",
			gameFormat: "Physical",
		},
		{
			id: 2,
			userId: 1,
			gameId: 217554,
			gameStatus: "Played",
			gameConsole: "Switch",
			gameFormat: "Digital",
		},
		{
			id: 3,
			userId: 1,
			gameId: 119171,
			gameStatus: "Playing",
			gameConsole: "Xbox X|S",
			gameFormat: "Digital",
		},
		{
			id: 4,
			userId: 1,
			gameId: 26226,
			gameStatus: "Want to play",
			gameConsole: "Switch",
			gameFormat: "Digital",
		},
		{
			id: 5,
			userId: 1,
			gameId: 267648,
			gameStatus: "Wishlist",
			gameConsole: null,
			gameFormat: null,
		},
		{
			id: 6,
			userId: 2,
			gameId: 119171,
			gameStatus: "Played",
			gameConsole: "PC",
			gameFormat: "Digital",
		},
		{
			id: 7,
			userId: 3,
			gameId: 472,
			gameStatus: "Played",
			gameConsole: "Xbox 360",
			gameFormat: "Physical",
		},
	]);
}
