const mongoose = require("mongoose")
const { getNames } = require("country-list")
const { isEmail, isURL, isStrongPassword } = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			minLength: 2,
			maxLength: 20,
		},
		lastName: {
			type: String,
			required: true,
			minLength: 2,
			maxLength: 20,
		},
		emailId: {
			type: String,
			lowercase: true,
			trim: true,
			required: true,
			unique: true,
			maxLength: 50,
			validate(value) {
				if (!isEmail(value)) {
					throw new Error("Email ID is not valid")
				}
			},
		},
		userName: {
			type: String,
			required: true,
			unique: true,
			minLength: 3,
			maxLength: 15,
		},
		password: {
			type: String,
			required: true,
			validate(value) {
				if (!isStrongPassword(value)) {
					throw new Error("Password is not strong enough")
				}
			},
		},
		age: {
			type: Number,
			required: true,
			min: 18,
		},
		gender: {
			type: String,
			required: true,
			enum: {
				values: ["male", "female", "others"],
				message: `{VALUE} is not a valid gender`,
			},
			validate(value) {
				if (!["male", "female", "others"].includes(value.toLowerCase())) {
					throw new Error("Gender is not valid")
				}
			},
		},
		country: {
			type: String,
			required: true,
			validate(value) {
				if (!getNames().includes(value)) {
					throw new Error("Country is not valid")
				}
			},
		},
		state: {
			type: String,
		},
		city: {
			type: String,
		},
		bio: {
			type: String,
		},
		profilePic: {
			type: String,
			validate(value) {
				if (!isURL(value)) {
					throw new Error("Profile picture URL is not valid")
				}
			},
		},
		morePhotos: {
			type: [String],
			validate(value) {
				const validURLS = value.every((url) => isURL(url))
				if (!validURLS) {
					throw new Error("Photos URL is not valid")
				} else if (value.length > 5) {
					throw new Error("More photos cannot be more than 5")
				}
			},
		},
		skills: {
			type: [String],
			validate(value) {
				if (value.length > 10) {
					throw new Error("Skills cannot be more than 10")
				}
			},
		},
		phoneNumber: {
			type: String,
			unique: true,
			validate(value) {
				const phoneRegex = /^\d{7,15}$/
				if (!phoneRegex.test(value)) {
					throw new Error("Phone number is not valid")
				}
			},
		},
	},
	{ timestamps: true },
)
userSchema.methods.getJWT = async function () {
	const user = this
	const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
		expiresIn: "7d",
	})
	return token
}

userSchema.methods.comparePassword = async function (password) {
	const user = this
	return await bcrypt.compare(password, user.password)
}

const User = mongoose.model("User", userSchema)

module.exports = User
