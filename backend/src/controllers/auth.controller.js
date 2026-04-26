import CONFIG from "../config/config.js"
import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken";

async function sendTokenResponse(user, res, message) {
    const token = jwt.sign({
        id: user._id,
    }, CONFIG.JWT_SECRET, {
        expiresIn: "7d"
    })
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })
    res.status(200).json({
        success: true,
        message,
        token,
        user: {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            contact: user.contact,
            role: user.role
        }
    })

}

async function GetMeController(req, res) {
    // req.user is populated by the auth.middleware
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            fullname: req.user.fullname,
            email: req.user.email,
            contact: req.user.contact,
            role: req.user.role
        }
    });
}

async function RegisterController(req, res) {
    console.log(req.body)
    const { organization_name, email, contact_person, contact_number, password } = req.body
    let userExits = await userModel.findOne({
        $or: [
            { email },
            {organization_name},
        ]
    })
    if (userExits) {
        return res.status(400).json({
            message: "user already exits with this email or contact"
        })
    }
    let user = await userModel.create({
       organization_name, email, contact_person, contact_number, password
    })
    await sendTokenResponse(user, res, "user registered successfully")

}
async function LoginController(req, res) {
    let {  organization_name, email, password } = req.body;
    let user = await userModel.findOne({ email })
    if (!user) {
        return res.status(400).json({
            message: "invalid email or password"
        })
    }
    let isMatch = await user.comparePassword(password)
    if (!isMatch) {
        return res.status(400).json({
            message: "invalid email or password"
        })
    }
    await sendTokenResponse(user, res, "user logged in successfully")

}
async function LogoutController(req, res) {
    // Clear the auth cookie server-side
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
}
export default { RegisterController, LoginController, GetMeController, LogoutController }