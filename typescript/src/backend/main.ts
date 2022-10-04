
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { parseContextScene } from "./server/ContextSceneParser";
import { getRealityData, getRealityDataUrl, runRDAS, setAccessToken, getProgress, getProgressCCS,
    cancelJobRDAS, cancelJobCCS, runCCS, writeTempSceneFromImageCollection } from "./server/RealityApisWrapper";


const app = express();
const port = 3001;

const router = express.Router();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/requests", router);

function replacer(_key: any, value: any[]) {
    if(value instanceof Map) {
        return {
            dataType: "Map",
            value: Array.from(value.entries()),
        };
    } else {
        return value;
    }
}

router.get("/realityData/:id", async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const realityData = await getRealityData(id);
    const azureBlobUrl = await getRealityDataUrl(id); // TODO : change this
    let json = "";

    if(!realityData)
        return; // TODO : change this

    if(realityData.type === "ContextScene") {
        const contextScene = await parseContextScene(azureBlobUrl);
        json = JSON.stringify(contextScene, replacer);
    }
    else if(realityData.type === "CCImageCollection") {
        const output = await writeTempSceneFromImageCollection(id, azureBlobUrl);
        const contextScene = await parseContextScene(output, true);
        json = JSON.stringify(contextScene, replacer);
    }
    return res.status(200).json({
        res: json
    });
});

router.post("/rdas", async (req: Request, res: Response) => {
    const realityDataIds = await runRDAS(req.body.inputs, req.body.outputTypes, req.body.jobType);
    return res.status(200).json({
        outputIds: realityDataIds
    });
});

router.get("/accesstoken/:token", async (req: Request, res: Response) => {
    await setAccessToken(req.params.token);
    return res.status(200).json({
        id: "test"
    });
});

router.get("/progress", async (_req: Request, res: Response) => {
    const progress = await getProgress();
    if(progress[0] === "Failed") {
        return res.status(200).json({
            error: "Failed",
        });
    }
    return res.status(200).json({
        step: progress[0],
        percentage: progress[1],
    });
});

router.get("/progressCCS", async (_req: Request, res: Response) => {
    const progress = await getProgressCCS();
    if(progress[0] === "Failed") {
        return res.status(200).json({
            error: "Failed",
        });
    }
    return res.status(200).json({
        step: progress[0],
        percentage: progress[1],
    });
});

router.post("/cancelJobRDAS", async (_req: Request, res: Response) => {
    await cancelJobRDAS();
    return res.status(200).json({
        id: "test"
    });
});

router.post("/cancelJobCCS", async (_req: Request, res: Response) => {
    await cancelJobCCS();
    return res.status(200).json({
        id: "test"
    });
});

router.post("/contextCapture", async (req: Request, res: Response) => {
    const realityDataId = await runCCS(req.body.inputs, req.body.type);
    return res.status(200).json({
        outputIds: realityDataId
    });
});

app.listen(port, function() {
    console.log("Runnning on " + port);
});
