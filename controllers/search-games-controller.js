import axios from "axios";
import { generateGameCoverUrl } from "../utils/gameUtils.js";
import { apiConfig } from "../utils/apiConfig.js";

const searchGames = async (req, res) => {
	const { query } = req.body;
	const currentTimestamp = Math.floor(Date.now() / 1000);

	const queries = query
		.trim()
		.split(" ")
		.map((query) => {
			return `name ~ *"${query}"*`;
		})
		.join(" & ");

	let data = `
		fields 
		cover.url,
		name;
	
		where (
		(first_release_date <= ${currentTimestamp} & age_ratings != null) 
		| (first_release_date > ${currentTimestamp} | first_release_date = null)
		)
		&	themes != (42)
		& category = (0, 8, 9)
		& platforms = (167, 48, 9, 390, 165, 169, 49, 12, 130, 41, 5, 6, 14, 3)
		& ${queries};`;

	let config = {
		...apiConfig,
		url: "https://api.igdb.com/v4/games",
		data: data,
	};

	async function searchForGame() {
		try {
			const response = await axios.request(config);
			const searchResults = response.data.map((result) => {
				return {
					id: result.id,
					name: result.name,
					cover: generateGameCoverUrl(result.cover?.url, "cover_small"),
				};
			});

			res.status(200).json(searchResults);
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: "Error fetching search results" });
		}
	}

	searchForGame();
};

export { searchGames };
