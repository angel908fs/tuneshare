const express = require('express');
const axios = require("axios");
let router = express.Router();


const DEEZER_API_URL = "https://api.deezer.com/search";


// Proxy Route for Deezer API
router.get("/deezer-search", async (req, res) => {
    const { query } = req.query;


    // Log the incoming query for debugging
    console.log("Received Deezer search request for:", query);


    if (!query) {
        console.error("Missing track query in request.");
        return res.status(400).json({ error: "Missing track query" });
    }


    try {
        const response = await axios.get(DEEZER_API_URL, {
            params: { q: query },
            headers: { 'Accept': 'application/json' }
        });


        console.log("Deezer API response:", response.data); // Debug response from Deezer


        // If API returns data
        if (response.data && response.data.data.length > 0) {
            res.json(response.data);
        } else {
            res.status(404).json({ error: "No tracks found on Deezer" });
        }
    } catch (error) {
        console.error("Error fetching track from Deezer:", error.message);
        if (error.response) {
            console.error("Deezer API Response:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Failed to fetch track preview from Deezer" });
        }
    }
});


const { exec } = require("child_process");


// Route to play MPV
router.get("/play", (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }


    exec(`mpv --input-ipc-server=\\\\.\\pipe\\mpvsocket "${url}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error playing track: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        res.json({ message: "Playing track in MPV" });
    });
});


router.get("/pause", (req, res) => {
    exec(`echo cycle pause > \\\\.\\pipe\\mpvsocket`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error pausing MPV: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        res.json({ message: "Paused MPV" });
    });
});


module.exports = router;