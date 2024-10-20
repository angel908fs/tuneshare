# TuneShare

## Team Members
* Angel Alvarez
* Malachi Peel
* Rodrigo Esteves
* Bryan Camarillo
* Ryan Moua
* Pineapple Wang

## Requirements
These are the requirements needed to run TuneShare

1. NodeJS should be installed on your machine (always go with the latest version!)
2. NPM is also needed but you don't need to install it since it gets installed automatically when you install NodeJS

## Generating node_modules
Node modules are essential libraries for both the backend and the frontend of TuneShare, you might find yourself not having them on your local repository or missing some of them, if that's the case, you can just `cd` into the respective folders with `cd backend` and `cd frontend` and then run `npm i` for both folders which will generate and/or update all the node modules needed for those two folders


## Running TuneShare
The application has frontend and backend components which are independent from each other, thus need to be run separately, ideally you can have a separte terminal tab/window running each one of them so that it's easier to debug them

To start the backend simply `cd` into the folder with `cd backend` and then run `npm run dev`

To start the frontend simply `cd` into the folder with `cd frontend` and then run `npm start`

> Always start the backend first, otherwise you might run into issues since the frontend depends on the backend


# Guidelines
- Confidential information such as API keys, passwords, etc should **NEVER** be hardcoded, instead they should be put in the `.env` files