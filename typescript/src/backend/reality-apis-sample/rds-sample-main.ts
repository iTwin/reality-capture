/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

"use strict";

import { RealityDataSampleREST } from "./rds-sample-REST.js";
import { RealityDataSampleLIB } from "./rds-sample-LIB.js";
import { getTokenFromEnv } from "../reality-apis-wrappers/Utils.js";
import { AccessToken } from "@itwin/core-bentley";
import { IModelHost } from "@itwin/core-backend";

async function rds_sampleREST_main(token: AccessToken)
{
    await new RealityDataSampleREST(token).run().catch((err : any) => 
    {
        console.log(err);
        console.error("Error running realityData sample:", err.message);
    });
    await IModelHost.shutdown();
}

async function rds_sampleLIB_main(token: AccessToken)
{
    await new RealityDataSampleLIB(token).run().catch((err : any) => 
    {
        console.log(err);
        console.error("Error running RealityDataClient sample:", err.message);
    });
    await IModelHost.shutdown();
}

export async function rds_sample_main(token : AccessToken|undefined = undefined)
{
    if (typeof(token) === undefined)
        token = await getTokenFromEnv();

    await rds_sampleREST_main(token as AccessToken);
    // await rds_sampleLIB_main(token as AccessToken);
}