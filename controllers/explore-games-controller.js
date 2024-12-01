import axios from "axios";
import {
	generateGameCoverUrl,
	formatReleaseDate,
	filterValidPlatforms,
} from "../utils/gameUtils.js";
import { apiConfig } from "../utils/apiConfig.js";
import { consolesByPlatform } from "../data-cleaning/valid-consoles.js";

const getGames = async (req, res) => {
	const currentTimestamp = Math.floor(Date.now() / 1000);
	const newReleaseCutoff = currentTimestamp - 15552000;
	const comingSoonCutoff = currentTimestamp + 15552000;

	function buildQuery(cutoffTimestampStart, cutoffTimestampEnd) {
		return `
			fields 
			cover.url,
			name,
			aggregated_rating,
			involved_companies.company.name,involved_companies.developer,
			first_release_date,
			platforms.id,
			genres.name;

			sort first_release_date desc;

			where ((first_release_date >= ${cutoffTimestampStart}) & (first_release_date <= ${cutoffTimestampEnd}) & age_ratings != null)
				& hypes > 20
				&	themes != 42
				& category = (0, 8, 9)
				& platforms = (167, 48, 9, 390, 165, 169, 49, 12, 130, 41, 5, 6, 14, 3);
				`;
	}

	const newReleaseConfig = {
		...apiConfig,
		url: "https://api.igdb.com/v4/games",
		data: buildQuery(newReleaseCutoff, currentTimestamp),
	};

	const comingSoonConfig = {
		...apiConfig,
		url: "https://api.igdb.com/v4/games",
		data: buildQuery(currentTimestamp, comingSoonCutoff),
	};

	function mapResponse(response) {
		return response.data.map((game) => {
			return {
				id: game.id,
				cover: generateGameCoverUrl(game.cover?.url, "cover_big"),
				name: game.name,
				releaseDate: formatReleaseDate(game.first_release_date),
				rating: Math.round(game.aggregated_rating) || "n/a",
				genres: game.genres?.map((genre) => genre.name),
				platforms: filterValidPlatforms(game.platforms),
			};
		});
	}

	async function getGameData() {
		try {
			const newReleaseResponse = await axios.request(newReleaseConfig);
			const newReleaseGames = mapResponse(newReleaseResponse);

			const comingSoonResponse = await axios.request(comingSoonConfig);
			const comingSoonGames = mapResponse(comingSoonResponse);

			res.status(200).json({
				newReleaseGames,
				comingSoonGames,
			});
		} catch (error) {
			console.log(error);
			res.status(500).json({
				message: "Error fetching new releases and coming soon games",
			});
		}
	}

	getGameData();
};

const getGamesByPlatform = async (req, res) => {
	const { platform, page } = req.params;
	const platformsQuery = getConsolesByPlatform(platform);
	const currentTimestamp = Math.floor(Date.now() / 1000);
	const limit = 40;
	const offset = limit * (page - 1);

	const consoleFilters =
		req.body.filters.console?.length > 0
			? `(${req.body.filters.console.join(",")})`
			: null;

	const consoleQuery = consoleFilters
		? `platforms = ${consoleFilters}`
		: `platforms = ${platformsQuery}`;

	const genreFilters =
		req.body.filters.genres?.length > 0
			? `(${req.body.filters.genres.join(",")})`
			: null;

	const genresQuery = genreFilters ? `& genres = ${genreFilters}` : "";

	let data = `
		query games "games" {
			fields 
			cover.url, 
			name, 
			aggregated_rating, 
			involved_companies.company.name, involved_companies.developer, 
			first_release_date, 
			platforms.id, 
			genres.name;

			where ${consoleQuery} ${genresQuery}
			& first_release_date >= ${currentTimestamp - 315569520}
			& ((first_release_date <= ${currentTimestamp} & age_ratings != null)
	   	| (first_release_date > ${currentTimestamp} | first_release_date = null))
			& category = (0, 8, 9) & cover.url != null;
			sort hypes desc;
			limit ${limit};
			offset ${offset};
		};

		query games/count "count" {
			fields 
			name, 
			platforms.name;

			where ${consoleQuery} ${genresQuery}
			& first_release_date >= ${currentTimestamp - 315569520}
			& ((first_release_date <= ${currentTimestamp} & age_ratings != null)
	   	| (first_release_date > ${currentTimestamp} | first_release_date = null))
			& category = (0, 8, 9) & cover.url != null;
		};
		
		query genres "genres" {
			fields 
			name;
			limit 40;
		};
	`;

	let config = {
		...apiConfig,
		url: "https://api.igdb.com/v4/multiquery",
		data: data,
	};

	const makeRequest = async () => {
		try {
			const response = await axios.request(config);

			const games = response.data.find((result) => result.name === "games");
			const count = response.data.find((result) => result.name === "count");
			const genres = response.data.find((result) => result.name === "genres");

			const responseObject = games.result.map((game) => {
				return {
					id: game.id,
					cover: generateGameCoverUrl(game.cover?.url, "cover_big"),
					name: game.name,
					rating: Math.round(game.aggregated_rating) || "n/a",
					genres: game.genres?.map((genre) => genre.name),
					platforms: filterValidPlatforms(game.platforms),
				};
			});

			res.status(200).json({
				filters: {
					console: {
						xbox: {
							169: "Xbox X|S",
							49: "Xbox One",
							12: "Xbox 360",
						},
						nintendo: {
							130: "Switch",
							41: "Wii U",
							5: "Wii",
						},
						playstation: {
							167: "PS5",
							48: "PS4",
							9: "PS3",
							390: "PS VR2",
							165: "PS VR",
						},
						pc: {
							6: "PC",
							14: "Mac",
							3: "Linux",
						},
					},
					genres: genres.result,
				},
				games: responseObject,
				count: count.count,
			});
		} catch (error) {
			res.status(500).json({
				message: "Error fetching game data",
			});
			console.error(error);
		}
	};

	makeRequest();
};

export { getGames, getGamesByPlatform };

function getConsolesByPlatform(platform) {
	return consolesByPlatform[platform];
}
