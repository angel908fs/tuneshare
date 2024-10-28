const User = require("../models/user.js"); // Import the User model
const bcrypt = require("bcrypt"); // For password hashing

async function createAccount(username, email, password)
{
    try
    {
        // Create the new user object
        const newUser = new User(
        {
            email,
            username, // switched email and user
            password: await bcrypt.hash(password, 10)
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
