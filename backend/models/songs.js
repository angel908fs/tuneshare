const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const songSchema = new mongoose.Schema(
    {
        song_id: { type: String, default: uuidv4 }, 
        song_link: { type: String, required: true }, // Link to the song

        spotify_song_id: { type: String, required: true},
        song_name: { type: String, required: true},
        artist_names: [{ type: String, required: true}],
        album_name: { type: String },
        album_image_url: { type: String },
        preview_url: { type: String }, // 30-sec preview
        duration_ms: { type: Number }, // track length
        explicit: { type: Boolean },
        deezer_preview_url: { type: String },
        deezer_url: { type: String},
    
        created_at: { type: Date, default: Date.now }
    },
    { timestamps: true}
);

songSchema.index({ updatedAt: 1}, {expireAfterSeconds: 60*60*24*3});
const Song = mongoose.model('Song', songSchema);
module.exports = Song;
