const express = require("express");
let router = express.Router();
const { userNameExists, userEmailExists } = require("../utils/user.js");
const createAccount = require("../utils/account_creation.js");

// create user
router.post("/user/create", async (req, res, next) => {
    try {
        // check if required request parameters are present
        if (!req.body.username || !req.body.email || !req.body.password) {
            return res.status(400).send({ error: "Missing required parameters" });
        }

        // Check for conflicting usernames and emails separately
        const userExists = await userNameExists(req.body.username);
        const emailExists = await userEmailExists(req.body.email);

        if (userExists) {
            return res.status(409).send({
                success: false,
                message: "This username is already taken by another account. Please use another one."
            });
        }

        if (emailExists) {
            return res.status(409).send({
                success: false,
                message: "This email is already associated with an account. Please use another one."
            });
        }

        // If no conflicts, proceed to create the account
        const accountCreationResult = await createAccount(req.body.username, req.body.email, req.body.password);
        return res.status(200).send(accountCreationResult);

    } catch (err) {
        return res.status(500).send({ error: "Server error" });
    }
});

module.exports = router;
