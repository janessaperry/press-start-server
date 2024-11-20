import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);

const getGameCollection = async (req, res) => {
	const { userId } = req.params;

	try {
		const data = await knex("game_collection").where({ userId: userId });
		res.status(200).json(data);
	} catch (error) {
		console.error(error);
		res.status(500).send({
			message: "Error",
		});
	}
};

export { getGameCollection };
