import { validConsoleMap } from "../data-cleaning/valid-consoles.js";
import axios from "axios";
const CLIENT_ID = process.env.CLIENT_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

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
		name,
		platforms.id,platforms.name;
	
		where (
		(first_release_date <= ${currentTimestamp} & age_ratings != null) 
		| (first_release_date > ${currentTimestamp} | first_release_date = null)
		)
		&	themes != (42)
		& category = (0, 8, 9)
		& platforms = (167, 48, 9, 390, 165, 169, 49, 12, 130, 41, 5, 6, 14, 3)
		& ${queries};`;

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

	async function searchForGame() {
		try {
			const response = await axios.request(config);
			const searchResults = response.data.map((result) => {
				return {
					id: result.id,
					name: result.name,
					cover: generateGameCoverUrl(result.cover?.url, "cover_small"),
					platforms: filterValidPlatforms(result.platforms),
				};
			});

			res.status(200).json(searchResults);
		} catch (error) {
			console.log(error);
		}
	}

	searchForGame();
};

export { searchGames };

function generateGameCoverUrl(url, size) {
	return url
		? url.replace("thumb", size)
		: "http://localhost:8080/images/no-cover.png";
}

function filterValidPlatforms(allPlatforms) {
	return allPlatforms
		?.map((platform) => validConsoleMap[platform.id])
		.filter((platform) => platform)
		.sort();
}
