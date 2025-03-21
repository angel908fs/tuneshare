const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
    {
        song_id: { type: String, default: uuidv4 }, 
        song_link: { type: String, required: true }, // Link to the song
        song_name:
        artist_name:
        album_name:
        
        created_at: { type: Date, default: Date.now }
    }
);

const Song = mongoose.model('Song', songSchema);
module.exports = Song;
