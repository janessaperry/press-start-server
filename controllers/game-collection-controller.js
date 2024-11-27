import { validConsoleMap } from "../data-cleaning/valid-consoles.js";
import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);
import axios from "axios";
const CLIENT_ID = process.env.CLIENT_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const getGameCollection = async (req, res) => {
	const userId = req.userId;
	const { page } = req.params;
	const { filters } = req.body;
	const limit = 10;
	const offset = limit * (page - 1);

	let collectionData, gameStatusStats, totalGamesCount;

	try {
		collectionData = await knex("game_collection")
			.where((builder) => {
				builder.where({ userId });

				if (filters) {
					for (let category in filters) {
						const filterValues = filters[category];
						if (filterValues?.length > 0) {
							builder.whereIn([category], filters[category]);
						}
					}
				}
			})
			.orderBy("createdAt", "asc");
	} catch (error) {
		console.error("Error fetching collection data:", error);
		return res.status(500).json({ message: "Error fetching collection data" });
	}

	try {
		gameStatusStats = await knex("game_collection")
			.where({
				userId,
			})
			.select("gameStatus")
			.count("gameStatus as value")
			.groupBy("gameStatus")
			.then((gameStatusArray) => {
				return gameStatusArray.map((statusInfo) => {
					return { status: statusInfo.gameStatus, count: statusInfo.value };
				});
			});

		totalGamesCount = gameStatusStats.reduce((total, stat) => {
			return total + stat.count;
		}, 0);
	} catch (error) {
		console.error("Error fetching game status stats:", error);
		return res
			.status(500)
			.json({ message: "Error fetching game status stats" });
	}

	const gameIds = getGameIdQueries(collectionData);

	function getGameIdQueries(allData) {
		if (allData.length === 0) {
			return null;
		} else {
			let gameIdString = "";
			for (let i = 0; i < allData.length; i++) {
				gameIdString += `${allData[i].gameId},`;
			}
			return `( ${gameIdString.slice(0, -1)} )`;
		}
	}

	let gameCardData = `
			fields 
			cover.url,
			name,
			aggregated_rating,
			involved_companies.company.name,involved_companies.developer,
			first_release_date,
			platforms.id,
			genres.name;
			where id = ${gameIds};
			limit ${limit};
			offset ${offset};
		`;

	let gameCardConfig = {
		method: "post",
		maxBodyLength: Infinity,
		url: "https://api.igdb.com/v4/games",
		headers: {
			"Client-ID": CLIENT_ID,
			Authorization: ACCESS_TOKEN,
			"Content-Type": "text/plain",
		},
		data: gameCardData,
	};

	let timeToBeatData = `
			fields 
			game_id,
			completely,
			normally;
			where game_id = ${gameIds};
			limit 100;
			`;

	let timeToBeatConfig = {
		method: "post",
		maxBodyLength: Infinity,
		url: "https://api.igdb.com/v4/game_time_to_beats",
		headers: {
			"Client-ID": CLIENT_ID,
			Authorization: ACCESS_TOKEN,
			"Content-Type": "text/plain",
		},
		data: timeToBeatData,
	};

	const makeRequest = async () => {
		try {
			const response = await axios.request(gameCardConfig);
			const gamesData = response.data;

			const timeToBeatResponse = await axios.request(timeToBeatConfig);
			const timeToBeatData = timeToBeatResponse.data;

			const gameData = gamesData.map((game) => {
				let timeToBeatInfo = timeToBeatData.find(
					(ttb) => ttb.game_id === game.id
				);

				return {
					id: game.id,
					cover: generateGameCoverUrl(game.cover?.url, "cover_big"),
					name: game.name,
					developer: getGameDeveloper(game.involved_companies),
					releaseDate: formatReleaseDate(game.first_release_date),
					rating: Math.round(game.aggregated_rating) || "n/a",
					genres: game.genres?.map((genre) => genre.name),
					platforms: filterValidPlatforms(game.platforms),
					timeToBeat: getTimeToBeat(timeToBeatInfo?.normally),
					gameFormats: ["Digital", "Physical"],
					collectionData: getCollectionData(collectionData, game.id),
				};
			});

			const fullResponse = {
				filteredCount: collectionData.length,
				collectionStats: {
					totalGames: totalGamesCount,
					gameStatusStats,
				},
				gameData,
			};

			return res.json(fullResponse);
		} catch (error) {
			console.error(error);
			return res.status(500).send({
				message: `Error fetching game collection for user ${userId}`,
			});
		}
	};
	makeRequest();
};

const addGame = async (req, res) => {
	const userId = req.userId;
	const requestBody = req.body;
	// console.log(requestBody);

	if (!requestBody.gameStatus) {
		requestBody.gameStatus = "Want to play";
	}

	try {
		await knex("game_collection").insert({
			userId: userId,
			gameId: requestBody.gameId,
			gameStatus: requestBody.gameStatus,
			gameConsole: requestBody.gameConsole,
			gameFormat: requestBody.gameFormat,
		});

		res.status(200).json({
			message: `Added game ${requestBody.gameId} to collection`,
			userId: userId,
			gameId: requestBody.gameId,
			gameStatus: requestBody.gameStatus,
			gameConsole: requestBody.gameConsole,
			gameFormat: requestBody.gameFormat,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: `Error adding game ${requestBody.gameId}` });
	}
};

const updateGame = async (req, res) => {
	const userId = req.userId;
	const { gameId } = req.params;
	const requestBody = req.body;

	try {
		await knex("game_collection")
			.where({
				userId: userId,
				gameId: gameId,
			})
			.update(requestBody);

		res.status(200).json({ message: `Updated game ${gameId} successfully` });
	} catch (error) {
		res.status(500).json({ message: `Error updating game ${gameId}` });
	}
};

const deleteGame = async (req, res) => {
	const userId = req.userId;
	const { gameId } = req.params;
	try {
		await knex("game_collection")
			.where({
				userId: userId,
				gameId: gameId,
			})
			.del();
		res.status(204).json({ message: `Deleted game ${gameId}` });
	} catch (error) {
		res.status(500).json({ message: `Error deleting game ${gameId}` });
	}
};

export { getGameCollection, addGame, updateGame, deleteGame };

function generateGameCoverUrl(url, size) {
	return url
		? url.replace("thumb", size)
		: "http://localhost:8080/images/no-cover.png";
}

function formatReleaseDate(timestamp) {
	if (timestamp) {
		const releasedTimestamp =
			String(timestamp).length === 10 ? timestamp * 1000 : timestamp;

		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(releasedTimestamp);
	} else {
		return "TBD";
	}
}

function getGameDeveloper(companies) {
	const developerInfo = companies?.find(
		(involvedCompany) => involvedCompany.developer
	);
	return developerInfo?.company
		? developerInfo.company.name
		: "Unknown developer";
}

function secondsToHours(seconds) {
	return Math.round(seconds / 3600);
}

function getTimeToBeat(timeInSeconds) {
	// console.log(timeInSeconds);
	return timeInSeconds ? `${secondsToHours(timeInSeconds)} hours` : "TBD";
}

function filterValidPlatforms(allPlatforms) {
	return allPlatforms
		?.map((platform) => validConsoleMap[platform.id])
		.filter((platform) => platform)
		.sort();
}

function getCollectionData(collectionData, gameId) {
	for (let collectionGame of collectionData)
		if (collectionGame.gameId === gameId) {
			return {
				gameConsole: collectionGame.gameConsole,
				gameFormat: collectionGame.gameFormat,
				gameStatus: collectionGame.gameStatus,
			};
		}
}
