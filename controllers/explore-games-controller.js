import axios from "axios";
import {
	generateGameCoverUrl,
	formatReleaseDate,
	filterValidPlatforms,
} from "../utils/gameUtils.js";
import { apiConfig } from "../utils/apiConfig.js";

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
		}
	}

	getGameData();
};

export { getGames };
