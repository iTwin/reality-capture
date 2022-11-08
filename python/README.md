# Introduction 
Python SDK for Bentley Systems Reality Data Analysis (RDA) and ContextCapture (CC) Services. It has been created and tested with Python 3.8.

# Reality data analysis
Reality Data Analysis is a service that runs Artificial Intelligence/Machine Learning (AI/ML) on photos, maps, meshes or point clouds. It can detect objects or features in 2D and 3D for defect analysis, image anonymization, image indexing, asset management, mobile mapping, aerial surveying, and more.

A description of the service and how data should be presented can be found [here](https://developer.bentley.com/apis/realitydataanalysis/).

# ContextCapture 
ContextCapture  is a service that turns images and point clouds into reality meshes, orthophotos and other by-products.

A description of the service and how data should be presented can be found [here](https://developer.bentley.com/apis/contextcapture/).

# Getting Started
You will need a [Cloud Services Subscription](https://www.bentley.com/en/subscriptions/cloud-services-subscription/cloud-services-subscription). You will also need an iTwin platform account and a registered application to use this SDK.

If you don’t have a ProjectWise project you will need to create one. [This video](https://learn.bentley.com/app/VideoPlayer/LinkToIndividualCourse?LearningPathID=109270&CourseId=114330&MediaID=5006537") shows a step by step of how to do this at [CONNECT Center](https://connect.bentley.com/).

A general tutorial of how to register to the iTwin platform and how to create an Application can be found [here](https://developer.bentley.com/tutorials/register-and-modify-application/). 

When creating an Application you will need to include scopes so that the Application has authorization to start jobs, etc. To be able to use the Reality Data Analysis and ContextCapture services and also have the possibility to upload and download data you should choose **Reality Capture**, **Digital Twin Management** and **Reporting & Insights** as API associations. Your application should have at least `contextcapture:modify`, `contextcapture:read`,`realitydataanalysis:modify`, `realitydataanalysis:read`, `realitydata:modify` and `realitydata:read` as Allowed scopes for this SDK to function properly. Other scopes won’t interfere with the service. 

By default, this SDK expects as redirect URIs both `http://127.0.0.1:8080/sign-oidc` and `http://localhost:8080/sign-oidc`. 

You may choose any Application type but be conscious the authorization process is different between them. An explanation of each authorization code flow process can be found [here](https://developer.bentley.com/apis/overview/authorization/). This SDK includes an example of a token factory for each type of Application. You may code your own factory for authorization tokens but you will have to implement the functions present at `AbstractTokenFactory` so that your code integrates properly with this SDK.
After creating an application and a ProjectWise project if you didn't have one, clone this repository and you are good to go. 

# Upload context scenes and orientations

In order to get consistent context scenes and orientations on Context Share, you have to upload the data referenced in those files first. Indeed, context scenes and orientations contain local paths to image collections, point clouds, etc. However, when the context scene is uploaded, these paths are not valid anymore. To have a working context scene or ccorientation, you have to:

**Upload  references first**. When uploading an image folder, images should be at the root of this folder, and at the same level (no sub folders). The same thing applies to orientations, files should be uploaded **before** you upload the ccorientation file.

**Change the references.** You can do that by hand by saving the id of the files you uploaded to the cloud, opening your file in a text editor and changing the paths to this id. You can also use the `ReferenceTable` object to save paths and ids and the `upload_context_scene` or `upload_ccorientation` functions to replace paths automatically before uploading them.  

# Examples

To run an example file you will need to change the `config.py` file: `client_id` should be the id of your application and `project_id` the id of your ProjectWise project. To retrieve the id of your project, click on the `ContextShare` button bellow the name of your project at [CONNECT Center](https://connect.bentley.com/) and copy the **contextId** string on the address bar. 

You will also need to change the variables at the beginning of the example file you’re running so that they reflect the files you want to use and where you want to save the results. You can download the detectors available as well as example datasets [here](https://communities.bentley.com/products/3d_imaging_and_point_cloud_software/w/wiki/54656/context-insights-detectors-download-page). Don't forget to open ContextScene files with a text editor and replace the reference path to the images used so that they point to the local path where you saved the images.

# Software dependencies
Necessary Python modules can also be found at the requirements.txt file.

```
python-dateutil==2.8.2
azure-storage-blob==12.9.0
bottle==0.12.19
requests~=2.27.1
pyOpenSSL>=22.0.0
```

# API references
https://developer.bentley.com/apis/realitydataanalysis/overview/
https://developer.bentley.com/apis/contextcapture/overview/
https://developer.bentley.com/apis/reality-data/overview/


