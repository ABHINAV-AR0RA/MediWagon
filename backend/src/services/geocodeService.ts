import axios from "axios";

export async function getCoordinatesFromAddress(address: string)
{
	try {
		const res = await axios.get("https://nominatim.openstreetmap.org/search", {
			params: {
				q: address,
				format: "json",
				limit: 1
			},
			headers: {
				"User-Agent": "AashaHealthApp/1.0 (amogh.devgun@muj.edu)"
			}
		});

		console.log("✅ Response received:", res.data);
		return res.data;
	}
	catch (err)
	{
		console.error("❌ Error:", err);
	}
}
