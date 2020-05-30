import express from "express";
import http from "http";

export default () => {


    const app = express();
    const port = 3002;

    app.use((req, res, next) => {
        console.log(req.query);
        next();
    })

    app.get('/login/oauth/authorize', (req, res) => {
        console.log("---------------------------------------");
        console.log(req.query);

        process.exit(1);
        res.send({
            "tolat": "meshi"
        });
    });

    const oauthServer = http.createServer(app);
    oauthServer.listen(port);
    return oauthServer;
}