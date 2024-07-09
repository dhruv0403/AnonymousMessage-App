import CredentialsProvider from "next-auth/providers/credentials"
import { NextAuthOptions } from "next-auth"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/models/User"

export const authOptions: NextAuthOptions = {
    secret:'123456sdfghjertydfghheertyuio8765re',
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect()
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier },
                        ]
                    });
                    console.log('user auth',user);
                    if (!user) {
                        throw new Error('No user found with this email');
                    }

                    if (!user.isVerified) {
                        throw new Error('Please verify your account before logging in');
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if (isPasswordCorrect) {
                        return user;
                    } else {
                        throw new Error('Incorrect password');
                    }

                } catch (error: any) {
                    console.log('session errorrr')
                    throw new Error(error);
                }
            }
        })
    ],
    callbacks:{
        async session({ session,token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            console.log('session:',session);
            return session
        },
        async jwt({ token, user}) {
            if(user){
                token._id=user._id,
                token.isVerified=user.isVerified,
                token.isAcceptingMessages=user.isAcceptingMessages,
                token.username=user.username
            }
            return token
        }
    },
    session:{
        strategy:'jwt'
    },
    pages:{
        signIn:'/sign-in'
    }

};