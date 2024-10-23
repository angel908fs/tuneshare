const User = require("./models/User"); // Import the User model
const bcrypt = require("bcrypt"); // For password hashing

async function createAccount(username, email, password, bio = "", profile_picture = "")
{
    try
    {
        // Check if username or email already exists
        const existingUser = await User.findOne(
        {
            $or: [{ username }, { email }],
        });

        if (existingUser)
        {
            return {
                success: false,
                message: "The username with the associated email already exists. Please use another one.",
            };
        }
        
        // Create the new user object
        const newUser = new User(
        {
            username,
            email,
            password: await bcrypt.hash(password, 10),
            bio,
            profile_picture,
        });

        // Save the new user to the database
        await newUser.save();

        return { success: true, message: "Account created successfully.", user: newUser };
    }
    catch (error)
    {
        console.error(`${error}`);
        return { success: false, message: `Could not create an account for ${username}. Please try again later.` };
    }
}

module.exports = createAccount;
