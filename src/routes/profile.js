const profileRouter = require("express").Router()
const User = require("../models/user")
const { authMiddleware } = require("../middleware/auth")
const { updateUserValidation } = require("../validation/user")
const bcrypt = require("bcrypt")
const { isStrongPassword } = require("validator")

profileRouter.get("/view", authMiddleware, async (req, res) => {
	try {
		res.status(200).json(req.user)
	} catch (error) {
		res.status(500).send("Error fetching user: " + error.message)
	}
})

profileRouter.delete("/delete/:id", authMiddleware, async (req, res) => {
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

profileRouter.patch("/edit", authMiddleware, async (req, res) => {
	try {
		if (!updateUserValidation(req.body)) {
			throw new Error("Invalid updates! Please check the fields to be updated.")
		}

		const user = await User.findByIdAndUpdate(req.user._id, req.body, {
			new: true,
			runValidators: true,
		})
		if (!user) {
			return res.status(404).send("User not found")
		}
		res.status(200).send(`${req.user.firstName}'s profile updated successfully`)
	} catch (error) {
		res.status(500).send("Error updating user: " + error.message)
	}
})

profileRouter.patch("/change-password", authMiddleware, async (req, res) => {
	try {
		const { oldPassword, newPassword, confirmNewPassword } = req.body
		const User = req.user
		const isMatch = await User.comparePassword(oldPassword)
		if (!isMatch) {
			return res.status(400).send("Old password is incorrect")
		} else if (oldPassword === newPassword) {
			return res
				.status(400)
				.send("New password must be different from old password")
		} else if (newPassword !== confirmNewPassword) {
			return res.status(400).send("New passwords do not match")
		} else if (isStrongPassword(newPassword)) {
			const passwordHash = await bcrypt.hash(newPassword, 10)
			Object.assign(req.user, { password: passwordHash })
			await req.user.save()
			res.status(200).send("Password changed successfully")
		} else {
			return res.status(400).send("Password is not strong enough")
		}
	} catch (error) {
		res.status(500).send("Error changing password: " + error.message)
	}
})

module.exports = profileRouter
