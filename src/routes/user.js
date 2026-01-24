const express = require("express")
const router = express.Router()
const User = require("../models/user")
const { authMiddleware } = require("../middleware/auth")
const { updateUserValidation, getUserById } = require("../validation/user")

router.get("/users", authMiddleware, async (req, res) => {
	try {
		const users = await User.find()
		res.status(200).json(users)
	} catch (error) {
		res.status(500).send("Error fetching users: " + error.message)
	}
})

router.get("/user", authMiddleware, async (req, res) => {
	try {
		const users = await User.find({ emailId: req.body.emailId })
		res.status(200).json(users)
	} catch (error) {
		res.status(500).send("Error fetching users: " + error.message)
	}
})

router.get("/:id", authMiddleware, async (req, res) => {
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

router.get("/profile", authMiddleware, async (req, res) => {
	try {
		const user = await getUserById(req.user._id)
		if (!user) {
			return res.status(404).send("User not found")
		}
		res.status(200).json(user)
	} catch (error) {
		res.status(500).send("Error fetching user: " + error.message)
	}
})

router.delete("/:id", authMiddleware, async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id)
		if (!user) {
			return res.status(404).send("User not found")
		}
		res.status(200).send("User deleted successfully")
	} catch (error) {
		res.status(500).send("Error deleting user: " + error.message)
	}
})

router.patch("/:id", authMiddleware, async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		})
		if (!updateUserValidation(req.body)) {
			throw new Error("Invalid updates! Please check the fields to be updated.")
		}
		if (!user) {
			return res.status(404).send("User not found")
		}
		res.status(200).send("User updated successfully")
	} catch (error) {
		res.status(500).send("Error updating user: " + error.message)
	}
})

module.exports = router
