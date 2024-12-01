import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);
import axios from "axios";
import {
	generateGameCoverUrl,
	formatReleaseDate,
	getGameDeveloper,
	filterValidPlatforms,
	getCollectionData,
	filterAgeRatings,
	getSimilarGames,
} from "../utils/gameUtils.js";
import { apiConfig } from "../utils/apiConfig.js";

const getGameDetails = async (req, res) => {
	const userId = req.userId;
	const { gameId } = req.params;

	const collectionData = await knex("game_collection").where({
		userId: userId,
	});

	let data = `
		fields 
		cover.url,
		age_ratings.category,age_ratings.content_descriptions.description,
		name,
		aggregated_rating,
		involved_companies.company.name,involved_companies.developer,
		first_release_date,
		summary,
		storyline,
		platforms.id,
		genres.name,
		similar_games.id,similar_games.name,similar_games.cover.url,similar_games.aggregated_rating,similar_games.platforms.id,similar_games.first_release_date;
		where id = ${gameId};
		`;

	let config = {
		...apiConfig,
		url: "https://api.igdb.com/v4/games",
		data: data,
	};

	const makeRequest = async () => {
		try {
			const response = await axios.request(config);
			const game = response.data.find((game) => game.id === parseInt(gameId));

			const responseObject = {
				id: game.id,
				cover: generateGameCoverUrl(game.cover?.url, "cover_big"),
				esrbRating: filterAgeRatings(game.age_ratings),
				name: game.name,
				developer: getGameDeveloper(game.involved_companies),
				releaseDate: formatReleaseDate(game.first_release_date),
				summary: game.summary || game.storyline,
				rating: Math.round(game.aggregated_rating) || "n/a",
				platforms: filterValidPlatforms(game.platforms),
				genres: game.genres?.map((genre) => genre.name),
				similarGames: getSimilarGames(game.similar_games),
				collectionData: getCollectionData(collectionData, game.id),
				collectionOptions: {
					gameStatus: [
						"Want to play",
						"Playing",
						"Played",
						"On pause",
						"Wishlist",
					],
					gameConsole: filterValidPlatforms(game.platforms),
					gameFormat: ["Digital", "Physical"],
				},
			};

			res.json(responseObject);
		} catch (error) {
			res.status(500).json({
				message: "Error fetching game data",
			});
			console.error(error);
		}
	};

	makeRequest();
};

export { getGameDetails };
