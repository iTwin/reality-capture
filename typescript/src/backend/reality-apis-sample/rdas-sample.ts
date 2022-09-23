/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

"use strict";

import { AccessToken } from "@itwin/core-bentley";
import { IModelHost } from "@itwin/core-backend";
import { getTokenFromEnv } from "../reality-apis-wrappers/Utils";
import { RealityDataAnalysis } from "../reality-apis-wrappers/Rdas";
import * as fs from "fs";
import * as path from "path";
import { RealityDataClientBase } from "../reality-apis-wrappers/Rds";
import { RealityDataTransfer } from "../reality-apis-wrappers/RealityDataTransfer";

export class RealityDataAnalysisSample extends RealityDataAnalysis {
    private imageCollectionId  = "";
    private detectorId  = "";
    private inputSceneId  = "";
    private outputSceneId  = "";
    private realityDataClient: RealityDataClientBase;
    private backupPath : string[] = [];

    constructor(accessToken : AccessToken) 
    {
        super(accessToken);
        this.realityDataClient = new RealityDataClientBase(accessToken);
    }

    public patchInputPhotoSceneFile(imgColId: string[], localPath: string, doSave = true)
    {
        const fTmp = path.join(path.dirname(localPath), path.basename(localPath, path.extname(localPath)) + ".xml");

        this.replacePathInScene(localPath, fTmp, imgColId, doSave);
        return fTmp;
    }

    // Create a modified version of file "inPath" in "outPath" where the <Path>...</Path> content is replaced by "target"
    // Return the content that has been replaced
    private replacePathInScene(inPath: string, outPath: string, targets: string[], doSave = true)
    {
        const files = fs.readFileSync(inPath, {encoding:"utf8", flag:"r"}).toString();
        if (files == "")
            throw new Error("Cannot read input scene file template");
        
        const pos1 = files.search("<Path>") + 6;
        const len = files.search("</Path>") - pos1;
        const a = files.split("");
        targets.forEach((target) => {
            this.backupPath.push(a.splice(pos1, len, "rds:" + target).join(""));
        });
        
        if (doSave)
            fs.writeFileSync(outPath, a.join(""));
        
    }

    // Prepare on RDS all the data necessary to run analysis on RDAS
    public async prepareDataForRDAS() 
    {
        // Image collection
        if(!this.imageCollectionId)
        {
            const imageCollectionRd = await this.realityDataClient.createItemRDS("RDAS Sample App", "CCImageCollection", "An image Collection for the RDAS Sample App");
            //let ic =  await this.CreateImageCollectionRDS(projectId);
            console.log("Image collection RealityData created: ", imageCollectionRd.id);
            console.log("Uploading image collection to RealityData");
            this.imageCollectionId = imageCollectionRd.id as string;
            await RealityDataTransfer.Instance.uploadRealityData(this.imageCollectionId, "D:/RDASImages/Motos", this.realityDataClient);
        }

        // Detector
        if(!this.detectorId)
        {
            const dectectorRd = await this.realityDataClient.createItemRDS("RDAS Sample App", "ContextDetector", "Detector for the RDAS Sample App");
            console.log("Detector RealityData created: ", dectectorRd.id);
            console.log("Uploading detector to RealityData");
            this.detectorId = dectectorRd.id as string;
            await RealityDataTransfer.Instance.uploadRealityData(this.detectorId, "D:/RDASImages/Coco2017_v1.19", this.realityDataClient);
        }

        // Context scene
        if(this.inputSceneId)
        {
            // In this case, make sure the ContextScene has <Path>rds:...</Path> pointing to the image collection
            // Run file patching without saving the result, to initialize this.backupPath
            await this.patchInputPhotoSceneFile([this.imageCollectionId], "D:/RDASImages/Scene/ContextScene.xml", false);
        }
        else
        {
            const sceneRd = await this.realityDataClient.createItemRDS("RDAS Sample App", "ContextScene", "Scene for the RDAS Sample App");
            console.log("ContextScene RealityData Created: ", sceneRd.id);
            this.inputSceneId = sceneRd.id as string;
            const scenePath = await this.patchInputPhotoSceneFile([this.imageCollectionId], "D:/RDASImages/Scene/ContextScene.xml", true) as string;
            await RealityDataTransfer.Instance.uploadRealityData(this.inputSceneId, scenePath, this.realityDataClient); // Has to be this name for RDAS to work
        }

        console.log("Input reality data available for processing");
    }

    // Retrieve the resulting scene, perform some post-process 
    private async finalizeScene()
    {
        // This is where we want the final scene to land
        const destDirection = "D:/RDASImages/output";
        const tmpDirection = path.join(destDirection, this.outputSceneId);
        const destPath = path.join(destDirection, "ContextScene_final.xml");

        // download the result
        if (!fs.existsSync(tmpDirection))
            fs.mkdirSync(tmpDirection);
        await RealityDataTransfer.Instance.downloadRealityData(this.outputSceneId, this.realityDataClient, tmpDirection);

        if (fs.existsSync(destPath))
            fs.rmSync(destPath);

        // replace the path with the initial one to produce the final scene file
        this.replacePathInScene(path.join(tmpDirection, "ContextScene.xml"), destPath, this.backupPath);

        console.log("SUCCESS : Final ContexScene written in ", destPath);
    }

    public async run()
    {
        await this.prepareDataForRDAS();
        await this.runJobRDASSample();
        await this.finalizeScene();

        console.log("Run RDAS: DONE");
    }

    public async runJobRDASSample(): Promise<void> {
        // Check that all the input data is on RDS (list blobs without download)
        await RealityDataTransfer.Instance.downloadRealityData(this.imageCollectionId, this.realityDataClient);
        await RealityDataTransfer.Instance.downloadRealityData(this.detectorId, this.realityDataClient);
        await RealityDataTransfer.Instance.downloadRealityData(this.inputSceneId, this.realityDataClient);

        if (this.outputSceneId)
        {
            return;
        }

        const jobInputs = new Map<string, string>();
        jobInputs.set("photos", this.inputSceneId);
        jobInputs.set("photoObjectDetector", this.detectorId);
        const jobOutputTypes = [];
        jobOutputTypes.push("objects2D");
        const jobType = "objects2D";
        const result  = await this.runJobRDAS(true, jobInputs, jobOutputTypes, jobType, 6);
        this.outputSceneId = result[0];
    }

}

export async function rdas_sample_main(token : AccessToken|undefined = undefined)
{
    if (typeof(token) === undefined)
        token = await getTokenFromEnv();

    const rdasSample = new RealityDataAnalysisSample(token as AccessToken);

    await rdasSample.run().catch((err) => 
    {
        console.log(err);
        console.error("Error running Reality Data Analysis Service sample:", err.message);
    });

    await IModelHost.shutdown();
}
