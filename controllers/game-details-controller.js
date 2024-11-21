import { validConsoleMap } from "../data-cleaning/valid-consoles.js";
import axios from "axios";

const CLIENT_ID = process.env.CLIENT_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const getGameDetails = async (req, res) => {
	const { gameId } = req.params;

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
		method: "post",
		maxBodyLength: Infinity,
		url: "https://api.igdb.com/v4/games",
		headers: {
			"Client-ID": CLIENT_ID,
			Authorization: ACCESS_TOKEN,
			"Content-Type": "text/plain",
		},
		data: data,
	};

	const makeRequest = async () => {
		try {
			const response = await axios.request(config);
			const game = response.data.find((game) => game.id === parseInt(gameId));

			const gameDeveloper = game.involved_companies?.find(
				(involvedCompany) => involvedCompany.developer
			);

			const genres = game.genres?.map((genre) => genre.name);

			//todo add logic to check if not blank too
			const responseObject = {
				allData: game,
				id: game.id,
				cover: generateGameCoverUrl(game.cover?.url, "cover_big"),
				esrbRating: filterAgeRatings(game.age_ratings),
				name: game.name,
				developer: gameDeveloper?.company.name,
				releaseDate: formatReleaseDate(game.first_release_date),
				summary: game.summary || game.storyline,
				rating: Math.round(game.aggregated_rating),
				platforms: filterValidPlatforms(game.platforms),
				genres: genres,
				franchises: game.franchises,
				similarGames: getSimilarGames(game.similar_games),
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

function generateGameCoverUrl(url, size) {
	return url.replace("thumb", size);
}

function filterAgeRatings(allAgeRatings) {
	return allAgeRatings
		?.filter((ratings) => ratings.category === 1)
		.map((ratings) =>
			ratings.content_descriptions?.map((cd) => {
				return cd.description;
			})
		)
		.flat();
}

function filterValidPlatforms(allPlatforms) {
	return allPlatforms
		?.map((platform) => validConsoleMap[platform.id])
		.filter((platform) => platform);
}

function getSimilarGames(similarGames) {
	return similarGames
		?.map((game) => {
			return {
				id: game.id,
				cover: generateGameCoverUrl(game.cover?.url, "cover_big"),
				name: game.name,
				rating: Math.round(game.aggregated_rating) || "n/a",
				platforms: filterValidPlatforms(game.platforms),
				releaseDate: game.first_release_date,
			};
		})
		.filter((game) => game.platforms.length > 0);
}

function formatReleaseDate(timestamp) {
	const releasedTimestamp =
		String(timestamp).length === 10 ? timestamp * 1000 : timestamp;

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(releasedTimestamp);
}

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
