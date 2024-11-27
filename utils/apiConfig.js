const CLIENT_ID = process.env.CLIENT_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

export const apiConfig = {
	method: "post",
	maxBodyLength: Infinity,
	headers: {
		"Client-ID": CLIENT_ID,
		Authorization: ACCESS_TOKEN,
		"Content-Type": "text/plain",
	},
};
