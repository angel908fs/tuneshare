import mongoose from "mongoose";

const pictureSchema = new mongoose.Schema({
    myFile : String
});

export default mongoose.models.posts || mongoose.model('picture', pictureSchema)