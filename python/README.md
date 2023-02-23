# Introduction 

Python SDK for Bentley Systems Reality Data Analysis (RDA) and ContextCapture (CC) Services. It has been created and tested with Python 3.8.

This SDK is based on the APIs:

- [Reality Data Analysis](https://developer.bentley.com/apis/realitydataanalysis/)
- [Context Capture](https://developer.bentley.com/apis/contextcapture/) 

It also contains Reality Data (RD) utils to upload and download reality data. 
See [Reality Data](https://developer.bentley.com/apis/reality-data/) for more information.

## Getting Started

- You will need an iTwin platform account and a registered application to use this SDK. A general tutorial of how to register to the iTwin platform and how to create an Application can be found [here](https://developer.bentley.com/tutorials/register-and-modify-application/). 


- If you don’t have a ProjectWise project you will need to create one. [This video](https://learn.bentley.com/app/VideoPlayer/LinkToIndividualCourse?LearningPathID=109270&CourseId=114330&MediaID=5006537#.Y7V6Hx86JiY.link) shows a step by step of how to do this at [CONNECT Center](https://connect.bentley.com/).


When creating an Application you will need to include scopes so that the Application has authorization to start jobs, etc. To be able to use the Reality Data Analysis and ContextCapture services and also have the possibility to upload and download data you should choose **Reality Capture**, **Digital Twin Management** and **Reporting & Insights** as API associations. Your application should have at least `contextcapture:modify`, `contextcapture:read`,`realitydataanalysis:modify`, `realitydataanalysis:read`, `realitydata:modify` and `realitydata:read` as Allowed scopes for this SDK to function properly. Other scopes won’t interfere with the service. 

By default, the token factories provided expect as redirect URI `http://localhost:8080/sign-oidc`. 

You may choose any Application type but be conscious the authorization process is different between them. An explanation of each authorization code flow process can be found [here](https://developer.bentley.com/apis/overview/authorization/). This SDK includes an example of a token factory for each type of Application. You may code your own factory for authorization tokens but you will have to implement the functions present at `AbstractTokenFactory` so that your code integrates properly with this SDK.

After creating an application and a ProjectWise project if you didn't have one, clone this repository and you are good to go. 

## Software dependencies

Necessary Python modules can also be found at the requirements.txt file.

```
bottle >= 0.12
oauthlib >= 3.2
requests-oauthlib >= 1.3.1
azure-storage-blob >= 12.9
```

## Upload context scenes and orientations

In order to get consistent context scenes and orientations on Context Share, you have to upload the data referenced in those files first. Indeed, context scenes and orientations contain local paths to image collections, point clouds, etc. However, when the context scene is uploaded, these paths are not valid anymore. To have a working context scene or ccorientation when uploading from your local machine, you have to:

**Upload references first.** When uploading an image folder, images should be at the root of this folder, and at the same level (no sub folders). The same thing applies to orientations, files should be uploaded **before** you upload the ccorientation file.

**Change the references.** You can do that by hand by saving the ids of the files you uploaded to the cloud, opening your context scene or ccorientation file in a text editor and changing the paths to those ids. You can also use the `ReferenceTable` object to save paths and ids while uploading reality data and the `upload_context_scene` or `upload_ccorientation` functions to replace paths automatically before uploading those types of files.  

## Examples

To run an example file you will need to change the `config.py` file: `client_id` should be the id of your application and `project_id` the id of your ProjectWise project. To retrieve the id of your project, click on the `ContextShare` button bellow the name of your project at [CONNECT Center](https://connect.bentley.com/) and copy the **contextId** string on the address bar. Don't forget to also change the **secret** variable if your application has one.

You will also need to change the variables at the beginning of the example file you’re running so that they reflect the files you want to use and where you want to save the results. You can download the detectors available as well as example datasets [here](https://communities.bentley.com/products/3d_imaging_and_point_cloud_software/w/wiki/54656/context-insights-detectors-download-page). Don't forget to first open context scene files with a text editor and replace the reference paths to the path of the images in your machine so that they point to the local path where you saved the images.

## API references

https://developer.bentley.com/apis/realitydataanalysis/overview/

https://developer.bentley.com/apis/contextcapture/overview/

https://developer.bentley.com/apis/reality-data/overview/


