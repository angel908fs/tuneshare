const User = require("../models/user.js"); // Import the User model
const bcrypt = require("bcrypt"); // For password hashing

async function createAccount(username, email, password)
{
    try
    {
        // Check for conflicting usernames and emails separately
        const userExists = await User.findOne({ username });
        const emailExists = await User.findOne({ email });

        if (userExists)
        {
            return { success: false, message: "This username is already taken by another account. Please user another one." };
        }

        if (emailExists)
        {
            return { success: false, message: "This email is already ascociated with an account. Please use another one." };
        }
                
        // Create the new user object
        const newUser = new User(
        {
            username,
            email,
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
