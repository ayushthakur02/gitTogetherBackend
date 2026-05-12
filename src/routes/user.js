const express = require("express")
const userRouter = express.Router()
const User = require("../models/user")
const ConnectionRequest = require("../models/connectionRequest")
const { authMiddleware } = require("../middleware/auth")

userRouter.get("/feed", authMiddleware, async (req, res) => {
	try {
		let page = parseInt(req.query.page) || 1
		let limit =
			parseInt(req.query.limit) || 10(limit > 50 || limit > 1) ? 10 : limit
		const users = await User.find({
			_id: { $ne: req.user._id },
		}).select("-password -emailId -phoneNumber -createdAt -updatedAt -__v")

		const userInteractedRequests = await ConnectionRequest.find({
			initiatorID: req.user._id,
			status: { $in: ["starred", "dismissed", "matched"] },
		})

		const othersDismissedRequests = await ConnectionRequest.find({
			recipientID: req.user._id,
			status: { $in: ["dismissed", "matched"] },
		})

		const excludedUserIDs = new Set()

		userInteractedRequests.forEach((req) => {
			excludedUserIDs.add(req.recipientID.toString())
		})

		othersDismissedRequests.forEach((req) => {
			excludedUserIDs.add(req.initiatorID.toString())
		})

		const filteredUsers = users.filter(
			(user) => !excludedUserIDs.has(user._id.toString()),
		)

		const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit)

		res.status(200).json({
			message:
				"Here is your feed! Browse and star profiles you want to connect with ⭐",
			total: filteredUsers.length,
			pageTotal: paginatedUsers.length,
			data: paginatedUsers,
			limit: limit,
			page: page,
		})
	} catch (error) {
		res.status(500).send("Error fetching users: " + error.message)
	}
})

//Commenting this out because we don't want users searching for other users by username or email for now - we want them to discover through the feed and connection requests instead.

// userRouter.get("/user", authMiddleware, async (req, res) => {
// 	try {
// 		const users = await User.find({ userName: req.body.userName })
// 		res.status(200).json(users)
// 	} catch (error) {
// 		res.status(500).send("Error fetching users: " + error.message)
// 	}
// })

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

userRouter.get("/requests", authMiddleware, async (req, res) => {
	try {
		const userID = req.user._id
		const starredRequests = await ConnectionRequest.find({
			recipientID: userID,
			status: "starred",
		}).populate(
			"initiatorID",
			"firstName lastName age gender country state city profilePic skills",
		)

		const transformedRequests = starredRequests.map((request) => ({
			requestID: request._id,
			initiatorID: request.initiatorID._id,
			recipientID: request.recipientID,
			firstName: request.initiatorID.firstName,
			lastName: request.initiatorID.lastName,
			age: request.initiatorID.age,
			gender: request.initiatorID.gender,
			country: request.initiatorID.country,
			state: request.initiatorID.state,
			city: request.initiatorID.city,
			profilePic: request.initiatorID.profilePic,
			skills: request.initiatorID.skills,
			createdAt: request.createdAt,
		}))

		res.status(200).json({
			message: "Here are the profiles that starred you ⭐",
			total: transformedRequests.length,
			data: transformedRequests,
		})
	} catch (error) {
		res
			.status(500)
			.json({ error: "Couldn't fetch starred profiles. Try again?" })
	}
})

userRouter.get("/matches", authMiddleware, async (req, res) => {
	try {
		const userID = req.user._id
		const matches = await ConnectionRequest.find({
			$or: [
				{ initiatorID: userID, status: "matched" },
				{ recipientID: userID, status: "matched" },
			],
		}).populate(
			"initiatorID recipientID",
			"firstName lastName age gender country state city profilePic skills",
		)
		const transformedMatches = matches.map((match) => {
			return match.initiatorID._id.equals(userID)
				? match.recipientID
				: match.initiatorID
		})
		res.status(200).json({
			message: "Here are your matches! 🎉",
			total: transformedMatches.length,
			data: transformedMatches,
		})
	} catch (error) {
		res.status(500).json({ error: "Couldn't fetch matches. Try again?" })
	}
})

module.exports = userRouter
