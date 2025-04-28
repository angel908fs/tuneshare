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
		return res.status(400).json({ success: false, message: "missing request body" });
	}

	const { spotifyUrl, spotifyToken } = body;

	if (!spotifyUrl || !spotifyToken) {
		return res.status(400).json({ success: false, message: "missing spotifyUrl or spotifyToken" });
	}

	const spotifyId = extractSpotifyId(spotifyUrl);
	if (!spotifyId) {
		return res.status(400).json({ success: false, message: "invalid Spotify URL" });
	}

	try {
		let song = await Song.findOne({ spotify_song_id: spotifyId });

		// if song already exists, check if deezer_preview_url still works
		if (song) {
			let needsRefresh = false;

			if (song.deezer_preview_url) {
				try {
					const response = await axios.head(song.deezer_preview_url, { timeout: 3000 });
					if (response.status !== 200) {
						needsRefresh = true;
					}
				} catch (headErr) {
					// if 403 or any error while trying the preview
					console.warn("Deezer preview check failed:", headErr.message);
					needsRefresh = true;
				}
			} else {
				needsRefresh = true;
			}

			// if link is dead, refresh from Deezer
			if (needsRefresh) {
				console.log("🔄 Refreshing expired Deezer preview...");
				try {
					const deezerResp = await axios.get("http://localhost:8080/api/deezer-search", {
						params: { query: `${song.artist_names[0]} ${song.song_name}` },
					});
					if (deezerResp.data.data.length > 0) {
						const topResult = deezerResp.data.data[0];
						song.deezer_preview_url = topResult.preview || null;
						song.deezer_url = topResult.link || null;
						await song.save();
					}
				} catch (deezerErr) {
					console.error("Deezer refresh error:", deezerErr.message);
				}
			}

			return res.json({ success: true, data: song, from: needsRefresh ? "db-refreshed" : "db" });
		}

		// if song does NOT exist
		const [spotifyResp, deezerResp] = await Promise.all([
			axios.get(`https://api.spotify.com/v1/tracks/${spotifyId}`, {
				headers: { Authorization: `Bearer ${spotifyToken}` },
				params: { market: "US" },
			}),
			axios.get("http://localhost:8080/api/deezer-search", {
				params: { query: null }, // will retry after we get artist+name if needed
			}).catch(() => ({ data: { data: [] } })),
		]);

		const track = spotifyResp.data;

		// fix Deezer if empty
		let deezerPreview = null;
		let deezerUrl = null;
		if (!deezerResp.data.data.length) {
			try {
				const retryDeezerResp = await axios.get("http://localhost:8080/api/deezer-search", {
					params: { query: `${track.artists[0].name} ${track.name}` },
				});
				if (retryDeezerResp.data.data.length > 0) {
					const topResult = retryDeezerResp.data.data[0];
					deezerPreview = topResult.preview || null;
					deezerUrl = topResult.link || null;
				}
			} catch (retryErr) {
				console.error("Deezer retry error:", retryErr.message);
			}
		} else {
			const topResult = deezerResp.data.data[0];
			deezerPreview = topResult.preview || null;
			deezerUrl = topResult.link || null;
		}

		// Save new song
		const newSong = await Song.create({
			song_link: spotifyUrl,
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

		return res.json({ success: true, data: newSong, from: "spotify" });

	} catch (err) {
		console.error("Internal server error:", err.message);
		return res.status(500).json({ success: false, message: "Internal server error" });
	}
});

module.exports = router;
