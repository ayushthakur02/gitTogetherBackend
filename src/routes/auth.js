const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/user")

router.post("/login", async (req, res) => {
	try {
		const { emailId, password } = req.body
		const user = await User.findOne({ emailId })
		if (!user) {
			return res.status(400).send("Invalid email or password")
		} else {
			const isMatch = await bcrypt.compare(password, user.password)
			if (isMatch) {
				const token = await jwt.sign(
					{ _id: user._id },
					"process.env.JWT_SECRET_KEY",
				)
				res.cookie("token", token)
				res.status(200).send("User logged in successfully")
			} else {
				return res.status(400).send("Invalid email or password")
			}
		}
	} catch (error) {
		res.status(500).send("Error logging in user: " + error.message)
	}
})

router.post("/signup", async (req, res) => {
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

module.exports = router
