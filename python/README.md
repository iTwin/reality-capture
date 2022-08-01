# Introduction 
Python SDK for Bentley Systems Reality Data Analysis service (RDA). It has been tested with Python 3.6 and should work with Python 3.6 or newer.

Reality Data Analysis is a service that runs Artificial Intelligence/Machine Learning (AI/ML) on photos, maps, meshes or point clouds. It can detect objects or features in 2D and 3D for defect analysis, image anonymization, image indexing, asset management, mobile mapping, aerial surveying, and more.

A description of the service and how data should be presented can be found [here](https://developer.bentley.com/apis/realitydataanalysis/). We assume you are familiar with the concept of Context Scenes and Context Detectors.

# Getting Started
You will need a [Cloud Services Subscription](https://www.bentley.com/en/subscriptions/cloud-services-subscription/cloud-services-subscription). You will also need an iTwin platform account and a registered application to use this SDK.

If you don’t have a ProjectWise project you will need to create one. [This video](https://learn.bentley.com/app/VideoPlayer/LinkToIndividualCourse?LearningPathID=109270&CourseId=114330&MediaID=5006537") shows a step by step of how to do this at [CONNECT Center](https://connect.bentley.com/).

A general tutorial of how to register to the iTwin platform and how to create an application can be found [here](https://developer.bentley.com/tutorials/register-and-modify-application/). When creating the application for the RDA service, choose **Digital Twin Management** and **Reporting & Insights** as API associations. It should have at least `realitydataanalysis:modify`, `realitydata:read`, `realitydata:modify` and `realitydataanalysis:read` as Allowed scopes. Other scopes won’t interfere with the service. 

Choose the Application type as `Desktop/Mobile` and as redirect URIs register both `http://127.0.0.1:8080/sign-oidc` and `http://localhost:8080/sign-oidc`. 

After creating an application and a ProjectWise project if you didn't have one, clone this repository and you are good to go. 

To run an example file you will need to change the `config.py` file on the examples folder: `client_id` should be the id of your application and `project_id` the id of your ProjectWise project. To retrieve the id of your project, click on the `ContextShare` button bellow the name of your project at [CONNECT Center](https://connect.bentley.com/) and copy the **contextId** string on the address bar. 

You will also need to change the `ccimage_collections`, `photos` or `orthophotos`, `detector` and `output_dir` variables on the example file you’re running so that they reflect the CCImageCollections, ContextScenes and ContextDetectors you want to use znd where you want to save the results. You can download the detectors available as well as example datasets [here](https://communities.bentley.com/products/3d_imaging_and_point_cloud_software/w/wiki/54656/context-insights-detectors-download-page). Don't forget to change the ContextScene file and change the reference path to the images used.


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

