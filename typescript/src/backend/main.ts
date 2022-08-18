
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { parseContextScene } from "./server/ContextSceneParser";
import { getRealityData, getRealityDataUrl, getImageCollectionUrls, uploadRealityData, runRDAS, setAccessToken, getProgress, getProgressCCS, 
    getProgressUpload, cancelJobRDAS, cancelJobCCS, runCCS, download } from "./server/RealityDataApi";

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
        const imageUrls = await getImageCollectionUrls(id, azureBlobUrl);
        json = JSON.stringify(imageUrls);
    }
    return res.status(200).json({
        type: realityData.type,
        res: json
    });
});

router.get("/upload/:type/*", async (req: Request, res: Response) => {
    const realityDataId = await uploadRealityData(req.params[0], req.params.type);
    return res.status(200).json({
        id: realityDataId
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

router.get("/progressUpload", async (_req: Request, res: Response) => {
    const progress = await getProgressUpload();
    return res.status(200).json({
        progress
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

router.post("/download", async (req: Request, res: Response) => {
    await download(req.body.id, req.body.targetPath);
    return res.status(200).json({
        id: "test"
    });
});

app.listen(port, function() {
    console.log("Runnning on " + port);
});
