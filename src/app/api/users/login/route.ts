import { connect } from "@/dbConfig/dbConfig";
import User from '@/models/User'
import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from "@/helpers/mailers";
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

connect()

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json()
        const { email, password } = reqBody
        // validation
        console.log(reqBody);

        const user = await User.findOne({ email })

        if (!user) {
            return NextResponse.json({ error: "User does not exists" }, { status: 400 })
        }

        console.log("User exists");

        const validPassword = await bcryptjs.compare(password, user.password)

        if (!validPassword) {
            return NextResponse.json({ error: "Check your credentials" }, { status: 400 })
        }

        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email
        }

        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: '1d' })

        const response = NextResponse.json({
            message: "Logged in Success",
            success: true
        })

        response.cookies.set("token", token, {
            httpOnly: true
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}