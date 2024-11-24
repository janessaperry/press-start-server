import { validConsoleMap } from "../data-cleaning/valid-consoles.js";

import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);
import axios from "axios";
const CLIENT_ID = process.env.CLIENT_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const getGameCollection = async (req, res) => {
	const { userId } = req.params;

	try {
		const collectionData = await knex("game_collection").where({
			userId: userId,
		});

		const gameIds = getGameIdQueries(collectionData);
		function getGameIdQueries(allData) {
			let gameIdString = "";
			for (let i = 0; i < allData.length; i++) {
				gameIdString += `${allData[i].gameId},`;
			}
			return `( ${gameIdString.slice(0, -1)} )`;
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

				const responseObject = gamesData.map((game) => {
					const timeToBeatInfo = timeToBeatData.find(
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
						timeToBeat: secondsToHours(timeToBeatInfo?.normally) || "n/a",
						collectionData: getCollectionData(collectionData, game.id),
					};
				});

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
	} catch (error) {
		console.error(error);
		res.status(500).send({
			message: "Error fetching game collection for user",
		});
	}
};

const updateGame = async (req, res) => {
	const { userId, gameId } = req.params;
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
	const { userId, gameId } = req.params;
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

export { getGameCollection, updateGame, deleteGame };

function generateGameCoverUrl(url, size) {
	return url.replace("thumb", size);
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

function getGameDeveloper(companies) {
	const developerInfo = companies?.find(
		(involvedCompany) => involvedCompany.developer
	);
	return developerInfo.company.name;
}

function secondsToHours(seconds) {
	return Math.round(seconds / 3600);
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
