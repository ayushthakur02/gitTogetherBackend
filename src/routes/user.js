const express = require("express")
const userRouter = express.Router()
const User = require("../models/user")
const { authMiddleware } = require("../middleware/auth")

userRouter.get("/users", authMiddleware, async (req, res) => {
	try {
		const users = await User.find()
		res.status(200).json(users)
	} catch (error) {
		res.status(500).send("Error fetching users: " + error.message)
	}
})

userRouter.get("/user", authMiddleware, async (req, res) => {
	try {
		const users = await User.find({ userName: req.body.userName })
		res.status(200).json(users)
	} catch (error) {
		res.status(500).send("Error fetching users: " + error.message)
	}
})

userRouter.get("/user/:id", authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.params.id)
		if (!user) {
			return res.status(404).send("User not found")
		}
		res.status(200).json(user)
	} catch (error) {
		res.status(500).send("Error fetching user: " + error.message)
	}
})

module.exports = userRouter
