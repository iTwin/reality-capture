/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import type { GuidString } from "@itwin/core-bentley";

/**
 * Contains information on a project that is associated to a RealityData. More details about a project can be requested from the Projects API.
 */
export class Project {

  /** Project identifier */
  public id: GuidString;

  /** Project URL in the Projects API, for more information about the project */
  public projectDetailsLink: URL;

  public constructor(project: any){
    this.id = project.id;
    this.projectDetailsLink = project._links.self.href;
  }
}

