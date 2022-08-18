/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

"use strict";

import { ccs_sample_main } from "./cccs-sample";
import { getTokenFromEnv } from "../reality-data/Utils";

async function sample_main()
{
    const token = await getTokenFromEnv();

    //rds_sample_main(token);  // Basic example using the Reality Data Services
    // rdas_sample_main(token); // Basic example using the Reality Data Analysis Services
    ccs_sample_main(token); // Basic example using the Context Capture Cloud Service
}

sample_main();
