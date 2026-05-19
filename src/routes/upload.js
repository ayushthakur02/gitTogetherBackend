const express = require("express")
const uploadRouter = express.Router()
const cloudinary = require("../config/cloudinary")
const { authMiddleware } = require("../middleware/auth")

uploadRouter.get("/signature", authMiddleware, (req, res) => {
	const timestamp = Math.round(Date.now() / 1000)
	const folder = `gitTogether/${req.user._id}`

	const signature = cloudinary.utils.api_sign_request(
		{ timestamp, folder },
		process.env.CLOUDINARY_API_SECRET,
	)

	res.status(200).json({
		timestamp,
		signature,
		folder,
		api_key: process.env.CLOUDINARY_API_KEY,
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	})
})

uploadRouter.get("/signature/signup", (_req, res) => {
	const timestamp = Math.round(Date.now() / 1000)
	const folder = "gitTogether/signups"

	const signature = cloudinary.utils.api_sign_request(
		{ timestamp, folder },
		process.env.CLOUDINARY_API_SECRET,
	)

	res.status(200).json({
		timestamp,
		signature,
		folder,
		api_key: process.env.CLOUDINARY_API_KEY,
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	})
})

module.exports = uploadRouter
