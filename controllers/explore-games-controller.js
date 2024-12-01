import axios from "axios";
import {
	generateGameCoverUrl,
	formatReleaseDate,
	filterValidPlatforms,
	getConsolesByPlatform,
	sortGenresAlphabetical,
} from "../utils/gameUtils.js";
import { consoleFiltersByPlatform } from "../utils/validConsoles.js";
import { apiConfig } from "../utils/apiConfig.js";

const getGamesByReleaseDate = async (req, res) => {
	const currentTimestamp = Math.floor(Date.now() / 1000);
	const sixMonthsAgoTimestamp = currentTimestamp - 15552000;
	const sixMonthsLaterTimestamp = currentTimestamp + 15552000;

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
		data: buildQuery(sixMonthsAgoTimestamp, currentTimestamp),
	};

	const comingSoonConfig = {
		...apiConfig,
		url: "https://api.igdb.com/v4/games",
		data: buildQuery(currentTimestamp, sixMonthsLaterTimestamp),
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

	async function fetchAndProcessGames() {
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

	fetchAndProcessGames();
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

	const fetchAndProcessGames = async () => {
		try {
			const response = await axios.request(config);

			const games = response.data.find((result) => result.name === "games");
			const count = response.data.find((result) => result.name === "count");
			const genres = response.data.find((result) => result.name === "genres");

			const gamesData = games.result.map((game) => {
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
					console: consoleFiltersByPlatform,
					genres: sortGenresAlphabetical(genres.result),
				},
				games: gamesData,
				count: count.count,
			});
		} catch (error) {
			res.status(500).json({
				message: "Error fetching game data",
			});
			console.error(error);
		}
	};

	fetchAndProcessGames();
};

export { getGamesByReleaseDate, getGamesByPlatform };
