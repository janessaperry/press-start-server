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
		franchises.name,
		franchises.games.name,
		franchises.games.aggregated_rating,
		franchises.games.platforms.id,franchises.games.platforms.name,franchises.games.platforms.abbreviation,franchises.games.platforms.platform_family,
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

			const genres = game.genres?.map((genre) => genre.name);

			//todo add logic to check if not blank too
			const responseObject = {
				allData: game,
				id: game.id,
				cover: generateGameCoverUrl(game.cover?.url, "cover_big"),
				esrbRating: filterAgeRatings(game.age_ratings),
				name: game.name,
				developer: getGameDeveloper(game.involved_companies),
				releaseDate: formatReleaseDate(game.first_release_date),
				summary: game.summary || game.storyline,
				rating: Math.round(game.aggregated_rating) || "n/a",
				platforms: filterValidPlatforms(game.platforms),
				genres: genres,
				franchises: game.franchises,
				similarGames: getSimilarGames(game.similar_games),
				gameFormats: ["Digital", "Physical"],
				collectionData: getCollectionData(collectionData, game.id),
			};

			res.json(responseObject);
		} catch (error) {
			res.json({
				status: "500",
				message: "Error fetching game data",
			});
			console.error(error);
		}
	};

	makeRequest();
};

export { getGameDetails };

//todo want to add this?
//games can be part of more than one franchise
// function getFranchiseGames(similarGames) {
// 	return similarGames
// 		?.map((game) => {
// 			return {
// 				id: game.id,
// 				cover: generateGameCoverUrl(game.cover?.url, "cover_big"),
// 				name: game.name,
// 				rating: Math.round(game.aggregated_rating) || "n/a",
// 				platforms: filterValidPlatforms(game.platforms),
// 				releaseDate: game.first_release_date,
// 			};
// 		})
// 		.filter((game) => game.platforms.length > 0);
// }

/**
 * Franchises - for Game Cards
 * id: 1234
 * games: [{},{},{}...]
 * 		id: 1234
 * 		aggregated_rating: 80
 * 		cover.url: "imagepath.jpg"
 * 		category: 0 --> want to filter for 0 here
 * 		first_release_date: 1234567890
 * 		name: "Game name"
 * 		platforms: [{},{},{}]
 * 				id: 1234
 * 				abbreviation: "String"
 * 				alternative_name: "String"
 * 				category: 123 --> Clean by this?
 * 				name: "String"
 * 				platform_family: 123 --> Clean by this! I think we want platform family !== blank unless category is PC or Mac?
 * name: "Franchise name"
 */

//send back something like...
/**
 * franchises: [
 * 		{
 * 			name:
 * 			games: [
 * 				{
 * 					id: 1,
 * 					name: "Game name",
 * 					rating: 80,
 * 					cover: url,
 * 					first_release_date: March 23, 2015, //format before sending back
 * 					platforms: [PC, Xbox, PS4, PS5] //need to clean before sending back
 * 				}, ...
 * 			]
 * 		}, ...
 * ]
 */
