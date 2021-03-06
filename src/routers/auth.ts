import express, { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { GIT_HUB_CLIENT_ID, GIT_HUB_CLIENT_SECRET, GIT_HUB_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from "../config";
import User, { UserType } from "../models/users";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UserSource, { UserAuthSource } from "../models/userSource";

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function (user: any, cb: any) {
    cb(null, user.id);
});

passport.deserializeUser(async (id: number, cb) => {
    try {
        const user: User | null = await User.findOne({
            where: { id }
        });

        cb(null, user);

    } catch (error) {
        cb(error);
    }
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    scope: ['profile', "email"]
},
    async (accessToken, refreshToken, profile, cb) => {
        try {
            let existingUserSource: UserSource | null = await UserSource.findOne({
                where: { authSourceId: profile.id, authSource: UserAuthSource.Google }
            });

            let email: string | null = null;
            if (profile.emails && profile.emails.length > 0) {
                email = profile.emails[0].value
            }


            const userToUpdateOrCreate: any = {
                authSource: UserAuthSource.Google,
                authSourceId: profile.id,
                username: email?.replace(/[^a-zA-Z0-9]/g, "")!,
                avatar: (profile.photos && profile.photos.length > 0) ? profile.photos[0].value : null,
                accessToken,
                refreshToken,
                email: email
            }

            if (existingUserSource != null) {
                const updatedInstances = await UserSource.update(userToUpdateOrCreate, { where: { id: existingUserSource.id } });
                const user: User | null = await User.findOne({ where: { id: existingUserSource.userId } });
                if (user) {
                    cb(undefined, user);
                }
                else {
                    cb(new Error("notfound"));
                }

            } else {
                const newUser = await User.create({
                    displayName: profile.displayName,
                    username: userToUpdateOrCreate.username,
                    avatar: userToUpdateOrCreate.avatar,
                    userType: UserType.User,
                    email: email
                });
                const userSource: UserSource = await UserSource.create({ ...userToUpdateOrCreate, userId: newUser.id });
                cb(undefined, newUser);
            }
        }
        catch (error) {
            cb(error);
        }
    }
));

passport.use(new GitHubStrategy({
    clientID: GIT_HUB_CLIENT_ID,
    clientSecret: GIT_HUB_CLIENT_SECRET,
    callbackURL: GIT_HUB_CALLBACK_URL,
    scope: ['user:email', "repo"]
},
    async (accessToken: string, refreshToken: string, profile: any, cb: any) => {
        try {
            let existingUserSource: UserSource | null = await UserSource.findOne({
                where: { authSourceId: profile.id, authSource: UserAuthSource.Github }
            });


            let email: string | null = null;
            if (profile.emails && profile.emails.length > 0) {
                email = profile.emails[0].value
            }


            const userToUpdateOrCreate: any = {
                authSource: UserAuthSource.Github,
                authSourceId: profile.id,
                username: profile.username,
                avatar: (profile.photos && profile.photos.length > 0) ? profile.photos[0].value : null,
                accessToken,
                refreshToken,
                email: email
            }

            if (existingUserSource != null) {
                await UserSource.update(userToUpdateOrCreate, { where: { id: existingUserSource.id } });

                const user: User | null = await User.findOne({ where: { id: existingUserSource.userId } });
                if (user) {
                    cb(undefined, user);
                }
                else {
                    cb(new Error("notfound"));
                }

            } else {
                const newUser = await User.create({
                    displayName: profile.displayName,
                    username: userToUpdateOrCreate.username,
                    avatar: userToUpdateOrCreate.avatar,
                    userType: UserType.User,
                    email: email
                });
                const userSource: UserSource = await UserSource.create({ ...userToUpdateOrCreate, userId: newUser.id });
                cb(undefined, newUser);
            }
        }
        catch (error) {
            cb(error);
        }
    }
));

const router: Router = express.Router();

router.get('/github', passport.authenticate('github'));
router.get('/google', passport.authenticate('google'));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    res.redirect("/");
});
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect("/");
});

export default router;