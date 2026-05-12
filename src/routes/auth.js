const express = require("express")
const authRouter = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/user")
const { authMiddleware } = require("../middleware/auth")

authRouter.post("/login", async (req, res) => {
	try {
		const { userId, password } = req.body
		const user = await User.findOne({
			$or: [{ emailId: userId }, { userName: userId }],
		})
		if (!user) {
			return res.status(400).send({ error: "Invalid email or password" })
		} else {
			const isMatch = await user.comparePassword(password)
			if (isMatch) {
				const token = await user.getJWT()
				const userObj = user.toObject()
				delete userObj.password
				res.cookie("token", token)
				res.status(200).json(userObj)
			} else {
				return res.status(400).send("Invalid email or password")
			}
		}
	} catch (error) {
		res.status(500).send("Error logging in user: " + error.message)
	}
})

authRouter.post("/logout", async (req, res) => {
	try {
		res.clearCookie("token")
		res.status(200).send("User logged out successfully")
	} catch (error) {
		res.status(500).send("Error logging out user: " + error.message)
	}
})

authRouter.get("/me", authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password")
		return res.status(200).json(user)
	} catch (error) {
		return res.status(500).send("Something went wrong")
	}
})

authRouter.post("/signup", async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			emailId,
			userName,
			age,
			gender,
			country,
			state,
			city,
			bio,
			profilePic,
			morePhotos,
			skills,
			phoneNumber,
		} = req.body
		const passwordHash = await bcrypt.hash(req?.body?.password, 10)
		const user = new User({
			firstName,
			lastName,
			emailId,
			userName,
			age,
			gender,
			country,
			state,
			city,
			bio,
			profilePic,
			morePhotos,
			skills,
			phoneNumber,
			password: passwordHash,
		})
		await user.save()
		res.status(201).send({ message: "User signed up successfully" })
	} catch (error) {
		res.status(500).send("Error signing up user :" + error.message)
	}
})

module.exports = authRouter
