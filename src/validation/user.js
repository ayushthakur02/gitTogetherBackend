const bcrypt = require("bcrypt")
const User = require("../models/user")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const updateUserValidation = (data) => {
	const allowedUpdates = ["age", "skills", "bio", "profilePic", "morePhotos"]
	const isValidOperation = Object.keys(data).every((update) =>
		allowedUpdates.includes(update),
	)
	return isValidOperation
}

const verifyToken = (token) => {
	return jwt.verify(token, "process.env.JWT_SECRET_KEY")
}

const getUserById = async (id) => {
	return await User.findById(id)
}

module.exports = { updateUserValidation, getUserById, verifyToken }
