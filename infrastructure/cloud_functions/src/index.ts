import functions from "@google-cloud/functions-framework";

functions.http("health", (_, res) => {
    res.sendStatus(200);
})