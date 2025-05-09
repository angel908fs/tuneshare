const Post = require("../models/post.js");
const User = require("../models/user.js");

async function createPost(userID, songLink, postContent)
{
    try
    {
        const user = await User.findOne({ user_id: userID });
        if (!user) {
            return { success: false, message: "User not found." };
        }

        const newPost = new Post(
        {   
            user_id: userID,
            song_link: songLink,
            content: postContent,
            comments: [],
            verified: user.verified
        });
        
        await newPost.save();

        // insert backslashes before double-quotes for JSON
        postContent = postContent.replace(/"/g, '\\"');

        await User.findOneAndUpdate(
            { user_id: userID },
            { $push: { posts: `{"post_id": "${newPost.post_id}", "content": "${postContent}"}` } }
        );

        return { success: true, message: "Post created successfully.", data: 
            {
                user_id: userID,
                song_link: songLink,
                content: postContent,
                comments: [],
                verified: user.verified // optional, just to include in response
            }
        };
    }
    catch (error)
    {
        // console.error("Post creation failure: ", error);
        return { success: false, message: "Could not create the post. Please try again later.", error: error.message};
    }
}

async function getUserPosts(username)
{
    try
    {
        // search a username in the User collection
        const user = await User.findOne({ username });
        
        if (!user)
        {
            return { success: false, message: "This username does not exist." };
        }
        
        // retrieve posts by user ID    
        const posts = await Post.find({ user_id: user.user_id }).populate("user_id").exec();
        
        return {
            success: true, post: posts.map(p => ({
                user_id: p.user_id,
                song_link: p.song_link,
                content: p.content,
                comments: p.comments
            }))
        };
            
    }
    catch (error)
    {
        // console.error("Post retrieval failure: ", error);
        return { success: false, message: "Could not retrieve posts. Please try again later.", error: error.message};
    }
}

module.exports = { createPost, getUserPosts };
