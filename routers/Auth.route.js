const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { UserRegisterModel } = require("../models/authentication.model")


const UserRouter = express.Router()

UserRouter.post("/register", async (req, res) => {
    try {
        const { name, username, email, password } = req.body
        bcrypt.hash(password, 7, async (err, hashed) => {
            const submitData = new UserRegisterModel({ name, username, email, password: hashed })
            try {
                await submitData.save()
                res.status(200).json({ msg: "Signup successful" })
            } catch (error) {
                if (error.code == 11000) {
                    res.status(400).json({ result: false, error: error.keyValue, msg: "User Allready exists" })
                }
            }
        })
    } catch (err) {
        res.send({ result: false, msg: "Signup failed" })
    }
})

UserRouter.post("/login", async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await UserRegisterModel.findOne({ $or: [{ username }, { email: username }] })
        if (user) {
            bcrypt.compare(password, user.password, (err, valid) => {
                if (err) {
                    return res.status(500).json({ result: false, msg: "Wrong Password" })
                }
                const jwtToken = jwt.sign({ username: user.username, email: user.email }, process.env.JWT_KEY)
                res.cookie("token", `${jwtToken}`, { maxAge: 900000000 })
                res.status(200).json({ result: true, msg: "Login successful" })
            })
        } else {
            res.status(500).json({ result: false, msg: "User not found" })
        }

    } catch (err) {
        res.status(400).json({ result: false, msg: "Somthing went wrong" })
    }
})

module.exports = { UserRouter }