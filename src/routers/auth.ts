import express, { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import GitHubStrategy from "passport-github";
import db from "../models";
import { IUserInstance, IUserAttributes } from "../models/users";
import { GIT_HUB_CLIENT_ID, GIT_HUB_CLIENT_SECRET } from "../config";

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user: any, cb: any) {
    cb(null, user.id);
});

passport.deserializeUser(async (id: number, cb) => {
    try {
        const user: IUserInstance| null = await db.users.findOne({ where: { id } });
        cb(null, user);
        
    } catch (error) {
        cb(error);
    }
});
  

passport.use(new GitHubStrategy({
    clientID: GIT_HUB_CLIENT_ID,
    clientSecret: GIT_HUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback",
    scope: ['user:email', 'read:org']
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {      
        let existingUser: IUserInstance | null = await db.users.findOne({
            where: { gitHubId: profile.id }
        });

        let email: string | undefined;
        if(profile.emails && profile.emails.length > 0) {
            email = profile.emails[0].value
        }


        const userToUpdateOrCreate: IUserAttributes = {
            displayName: profile.displayName,
            gitHubId: profile.id,
            username: profile.username,
            accessToken,
            refreshToken,
            email: email
        }

        if(existingUser!=null) {
            const updatedInstances = await db.users.update(userToUpdateOrCreate, { where: { id: existingUser.id }});
            const user: IUserInstance| null = await db.users.findOne({ where: { id: updatedInstances[0] } });
            if(user) {
                cb(null, user);
            }
            else {
                cb(new Error("notfound"));
            }

        } else {
            const newUser: IUserInstance = await db.users.create(userToUpdateOrCreate);
            cb(null, newUser);
        }
    }
    catch(error) {
        cb(error);
    }
  }
));

const router: Router = express.Router();

router.get('/github', passport.authenticate('github'));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),(req, res) => {

    res.redirect("/");
});

export default router;