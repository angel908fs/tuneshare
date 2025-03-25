const express = require("express");
const router = express.Router();
const Song = require("../models/songs.js");
const axios = require("axios");

const extractSpotifyId = (url) => {
	try {
		return url.split("/track/")[1].split("?")[0];
	} catch {
		return null;
	}
};

router.post("/song-metadata", async (req, res) => {
	const body = req.body;

	if (!body || typeof body !== "object") {
		return res.status(400).json({ success: false, message: "Missing request body." });
	}

	if (!body.spotifyUrl) {
		return res.status(400).json({ success: false, message: "Missing spotifyUrl." });
	}

	if (!body.spotifyToken) {
		return res.status(400).json({ success: false, message: "Missing spotifyToken." });
	}

	const spotifyUrl = body.spotifyUrl;
	const spotifyToken = body.spotifyToken;

	const spotifyId = extractSpotifyId(spotifyUrl);
	if (!spotifyId) {
		return res.status(400).json({ success: false, message: "Invalid Spotify URL." });
	}

	try {
		// Check DB cache
		const existing = await Song.findOne({ spotify_song_id: spotifyId });
		if (existing) {
			console.log("✅ [Metadata] Fetched from database (already cached)");
			return res.json({ success: true, data: existing, from: "db" });
		}

		// Fetch from Spotify
		const response = await axios.get(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
			headers: { Authorization: `Bearer ${spotifyToken}` },
			params: { market: "US" },
		});

		const track = response.data;

		// Always attempt Deezer match
		let deezerPreview = null;
		let deezerUrl = null;

		try {
			const deezerResp = await axios.get("http://localhost:8080/api/deezer-search", {
				params: {
					query: `${track.artists[0].name} ${track.name}`,
				},
			});

			if (deezerResp.data.data.length > 0) {
				const topResult = deezerResp.data.data[0];
				deezerPreview = topResult.preview || null;
				deezerUrl = topResult.link || null;
				console.log("🎧 [Deezer] Found track:", deezerUrl);
			} else {
				console.log("⚠️ [Deezer] No match found.");
			}
		} catch (deezerErr) {
			console.warn("❌ [Deezer] Search failed:", deezerErr.message);
		}

		// Save song to DB (Spotify + Deezer info)
		const newSong = await Song.create({
			song_link: spotifyUrl, // Spotify full link
			spotify_song_id: track.id,
			song_name: track.name,
			artist_names: track.artists.map((a) => a.name),
			album_name: track.album.name,
			album_image_url: track.album.images?.[0]?.url || "",
			preview_url: track.preview_url || null,
			duration_ms: track.duration_ms,
			explicit: track.explicit,
			deezer_preview_url: deezerPreview,
			deezer_url: deezerUrl,
		});

		console.log("✅ [Metadata] Fetched from Spotify API (and saved to DB)");
		res.json({ success: true, data: newSong, from: "spotify" });

	} catch (err) {
		console.error("❌ error in /api/song-metadata:", err.message);
		res.status(500).json({ success: false, message: "Internal server error." });
	}
});

module.exports = router;
