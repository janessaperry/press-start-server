import { validConsoleMap, consolesByPlatform } from "./validConsoles.js";

export function generateGameCoverUrl(url, size) {
	return url
		? url.replace("thumb", size)
		: "http://localhost:8080/images/no-cover.png";
}

export function formatReleaseDate(timestamp) {
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

export function getGameDeveloper(companies) {
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

export function getTimeToBeat(timeInSeconds) {
	return timeInSeconds ? `${secondsToHours(timeInSeconds)} hours` : "TBD";
}

export function filterValidPlatforms(allPlatforms) {
	return allPlatforms
		?.map((platform) => validConsoleMap[platform.id])
		.filter((platform) => platform)
		.sort();
}

export function filterAgeRatings(allAgeRatings) {
	return allAgeRatings
		?.filter((ratings) => ratings.category === 1)
		.map((ratings) =>
			ratings.content_descriptions?.map((cd) => {
				return cd.description;
			})
		)
		.flat();
}

export function getSimilarGames(similarGames) {
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
		.filter((game) => game.platforms?.length > 0);
}

export function getCollectionData(collectionData, gameId) {
	for (let collectionGame of collectionData)
		if (collectionGame.gameId === gameId) {
			return {
				gameConsole: collectionGame.gameConsole,
				gameFormat: collectionGame.gameFormat,
				gameStatus: collectionGame.gameStatus,
			};
		}
}

export function getConsolesByPlatform(platform) {
	return consolesByPlatform[platform];
}
