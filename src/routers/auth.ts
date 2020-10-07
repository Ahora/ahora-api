import express, { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { GIT_HUB_CLIENT_ID, GIT_HUB_CLIENT_SECRET, GIT_HUB_CALLBACK_URL } from "../config";
import User from "../models/users";

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
        const user: User | null = await User.findOne({ where: { id } });
        cb(null, user);

    } catch (error) {
        cb(error);
    }
});

passport.use(new GitHubStrategy({
    clientID: GIT_HUB_CLIENT_ID,
    clientSecret: GIT_HUB_CLIENT_SECRET,
    callbackURL: GIT_HUB_CALLBACK_URL,
    scope: ['user:email', "public_repo"]
},
    async (accessToken: string, refreshToken: string, profile: any, cb: any) => {
        try {
            let existingUser: User | null = await User.findOne({
                where: { gitHubId: profile.id }
            });

            let email: string | null = null;
            if (profile.emails && profile.emails.length > 0) {
                email = profile.emails[0].value
            }


            const userToUpdateOrCreate: any = {
                displayName: profile.displayName,
                gitHubId: profile.id,
                username: profile.username!,
                accessToken,
                refreshToken,
                email: email
            }

            if (existingUser != null) {
                const updatedInstances = await User.update(userToUpdateOrCreate, { where: { id: existingUser.id } });
                const user: User | null = await User.findOne({ where: { id: existingUser.id } });
                if (user) {
                    cb(null, user);
                }
                else {
                    cb(new Error("notfound"));
                }

            } else {
                const newUser: User = await User.create(userToUpdateOrCreate);
                cb(null, newUser);
            }
        }
        catch (error) {
            cb(error);
        }
    }
));

const router: Router = express.Router();

router.get('/github', passport.authenticate('github'));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {

    res.redirect("/");
});

export default router;