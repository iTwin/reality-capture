import { AccessToken, JsonUtils } from "@itwin/core-bentley";
import { Cartographic, EcefLocationProps, EcefLocation, RealityDataProvider, RealityDataFormat, RealityDataSourceKey, ContextRealityModelProps } from "@itwin/core-common";
import { BlankConnectionProps, RealityModelTileUtils, RealityDataSource, IModelConnection, SpatialViewState } from "@itwin/core-frontend";
import { Range3d, Transform, YawPitchRollAngles, Vector3d, Range3dProps, Matrix3d, StandardViewIndex } from "@itwin/core-geometry";
import { Downloader, DownloaderXhr, CRSManager, OnlineEngine, UrlFS, ALong, PageCachedFile, PointCloudReader, OPCReader, OrbitGtBounds } from "@itwin/core-orbitgt";
import { RealityDataAccessClient, RealityDataClientOptions } from "@itwin/reality-data-client";

interface BlankContextRealityModelProps {
    realityModel: ContextRealityModelProps;
    location: Cartographic | EcefLocationProps;
    worldRange: Range3dProps;
}

/**
 * Query BlankConnectionProps from context reality data.
 *
 * @param realityDataId reality data id.
 * @param accessToken the access token string.
 * @returns blank connection with extent and location
 */
export async function getBlankConnection(realityDataId : string, accessToken: string): Promise<BlankConnectionProps> {
    const blankContextRealityModel = await getBlankContextRealityModel(accessToken, realityDataId);
    const modelExtents: Range3d = Range3d.createNull();
    const realityExtents: Range3d = Range3d.fromJSON(blankContextRealityModel[0].worldRange);
    modelExtents.extendRange(realityExtents);
    const blankConnectionProps: BlankConnectionProps = {
        // call this connection using Reality Data name
        name: blankContextRealityModel[0].realityModel.name !== undefined ? blankContextRealityModel[0].realityModel.name : "Reality Data",
        // put the center of the connection near the center of the Reality Data
        location: blankContextRealityModel[0].location,
        // The volume of interest, in meters, centered around `location`
        extents: modelExtents.toJSON(),
        iTwinId: process.env.IMJS_PROJECT_ID,
    };
    return blankConnectionProps;
}

/**
 * Extracts reality data info from a json file.
 * @private
 * @param json json file containing info to extract.
 * @param realityDataName name of the reality data to read.
 * @param realityDataId [optional] id of the reality data to read.
 * @param realityDataType [optional] type of the reality data to read.
 * @returns context reality data info.
 */
function realityModelFromJson(json: any, realityDataName: string, realityDataId?: string, realityDataType?: string): BlankContextRealityModelProps {
    const worldRange = new Range3d();
    let location: Cartographic | EcefLocationProps = Cartographic.createZero();

    if (undefined === json?.root) {
        throw new Error("Invalid root json file : root member does not exist.");
    }

    if (undefined !== json?.root?.boundingVolume?.region) {
        const region = JsonUtils.asArray(json.root.boundingVolume.region);

        if (undefined === region) {
            throw new TypeError("Unable to determine GeoLocation - no root Transform or Region on root.");
        }

        const ecefLow = (Cartographic.fromRadians({ longitude: region[0], latitude: region[1], height: region[4] })).toEcef();
        const ecefHigh = (Cartographic.fromRadians({ longitude: region[2], latitude: region[3], height: region[5] })).toEcef();
        const ecefRange = Range3d.create(ecefLow, ecefHigh);
        const cartoCenter = Cartographic.fromRadians({ longitude: (region[0] + region[2]) / 2.0, latitude: (region[1] + region[3]) / 2.0, height: (region[4] + region[5]) / 2.0 });
        location = cartoCenter;
        const ecefLocation = EcefLocation.createFromCartographicOrigin(cartoCenter);
        const ecefToWorld = ecefLocation.getTransform().inverse()!;
        worldRange.extendRange(Range3d.fromJSON(ecefToWorld.multiplyRange(ecefRange)));
    } else {
        let worldToEcefTransform = RealityModelTileUtils.transformFromJson(json.root.transform);

        const range = RealityModelTileUtils.rangeFromBoundingVolume(json.root.boundingVolume)!;
        if (undefined === worldToEcefTransform)
            worldToEcefTransform = Transform.createIdentity();

        const ecefRange = worldToEcefTransform.multiplyRange(range.range); // range in model -> range in ecef
        const ecefCenter = worldToEcefTransform.multiplyPoint3d(range.range.center); // range center in model -> range center in ecef
        const cartoCenter = Cartographic.fromEcef(ecefCenter); // ecef center to cartographic center
        const isNotNearEarthSurface = cartoCenter && (cartoCenter.height < -5000); // 5 km under ground!
        const earthCenterToRangeCenterRayLenght = range.range.center.magnitude();

        if (worldToEcefTransform.matrix.isIdentity && (earthCenterToRangeCenterRayLenght < 1.0E5 || isNotNearEarthSurface)) {
            worldRange.extendRange(Range3d.fromJSON(ecefRange));
            const centerOfEarth: EcefLocationProps = { origin: { x: 0.0, y: 0.0, z: 0.0 }, orientation: { yaw: 0.0, pitch: 0.0, roll: 0.0 } };
            location = centerOfEarth;
        } 
        else {
            let ecefLocation: EcefLocation;
            const locationOrientation = YawPitchRollAngles.tryFromTransform(worldToEcefTransform);
            // Fix Bug 445630: [RDV][Regression] Orientation of georeferenced Reality Mesh is wrong.
            // Use json.root.transform only if defined and not identity -> otherwise will use a transform computed from cartographic center.
            if (!worldToEcefTransform.matrix.isIdentity && locationOrientation !== undefined && locationOrientation.angles !== undefined) {
                const xVector: Vector3d = Vector3d.createFrom(worldToEcefTransform.matrix.columnX());
                const yVector: Vector3d = Vector3d.createFrom(worldToEcefTransform.matrix.columnY());
                ecefLocation = new EcefLocation({ origin: locationOrientation.origin, xVector, yVector, orientation: locationOrientation.angles});
            } else {
                // For georeferenced Reality Meshes, its origin is translated to model origin (0,0,0).
                // Apply range center to translate it back to its original position.
                const worldCenter = !worldToEcefTransform.matrix.isIdentity ? range.range.center : undefined;
                ecefLocation = EcefLocation.createFromCartographicOrigin(cartoCenter!, worldCenter);
            }
            location = ecefLocation;
            // iModelDb.setEcefLocation(ecefLocation);
            const ecefToWorld = ecefLocation.getTransform().inverse()!;
            worldRange.extendRange(Range3d.fromJSON(ecefToWorld.multiplyRange(ecefRange)));
        }
    }
    const provider = RealityDataProvider.ContextShare;
    const format = realityDataType === "OPC" ? RealityDataFormat.OPC : RealityDataFormat.ThreeDTile;
    const rdSourceKey: RealityDataSourceKey = realityDataId ? { provider, format, id: realityDataId } : RealityDataSource.createKeyFromUrl(
        "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata/" + realityDataId + "?projectId=" + process.env.IMJS_PROJECT_ID);

    const realityModel: ContextRealityModelProps = { 
        rdSourceKey, 
        tilesetUrl: "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata/" + realityDataId + "?projectId=" + process.env.IMJS_PROJECT_ID, 
        name: realityDataName, 
        realityDataId: realityDataId
    };

    const blankContextrealityModel: BlankContextRealityModelProps = { realityModel, location, worldRange };
    return blankContextrealityModel;
}

/**
 * Gets a root document in json format from a root document url
 * @private
 * @param rootDocUrl document url
 * @returns a json containing reality data info
 */
async function getRootDocJson(rootDocUrl: string): Promise<any> {
    let rootDocjson: any;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", rootDocUrl, false);
    xhr.send();
    if (xhr.status === 200) {
        rootDocjson = JSON.parse(xhr.responseText);
    }
    
    return rootDocjson;
}

/**
 * Extracts reality data info from an OPC file.
 * @private
 * @param blobFileURL the BlobSasUrl to the file.
 * @param realityDataUrl url of the reality data to read.
 * @param realityDataName name of the reality data to read.
 * @param realityDataId [optional] id of the reality data to read.
 * @returns context reality data info.
 */
async function realityModelFromOPC(blobFileURL: string, rdUrl: string, rdName: string, rdId?: string): Promise<BlankContextRealityModelProps> {
    let worldRange = new Range3d();
    let location: Cartographic | EcefLocationProps;

    if (Downloader.INSTANCE == null)
        Downloader.INSTANCE = new DownloaderXhr();
    
    if (CRSManager.ENGINE == null)
        CRSManager.ENGINE = await OnlineEngine.create();
    
    const urlFS: UrlFS = new UrlFS();
    // wrap a caching layer (16 MB) around the blob file
    const blobFileSize: ALong = await urlFS.getFileLength(blobFileURL);
    const blobFile: PageCachedFile = new PageCachedFile(urlFS, blobFileURL, blobFileSize, 128 * 1024, 128);
    const fileReader: PointCloudReader = await OPCReader.openFile(blobFile, blobFileURL, true);

    const bounds = fileReader.getFileBounds();
    worldRange = Range3d.createXYZXYZ(bounds.getMinX(), bounds.getMinY(), bounds.getMinZ(), bounds.getMaxX(), bounds.getMaxY(), bounds.getMaxZ());
    const fileCrs = fileReader.getFileCRS();
    if (fileCrs) {
        await CRSManager.ENGINE.prepareForArea(fileCrs, bounds);
        const wgs84ECEFCrs = "4978";
        await CRSManager.ENGINE.prepareForArea(wgs84ECEFCrs, new OrbitGtBounds());

        const ecefBounds = CRSManager.transformBounds(bounds, fileCrs, wgs84ECEFCrs);
        const ecefRange = Range3d.createXYZXYZ(ecefBounds.getMinX(), ecefBounds.getMinY(), ecefBounds.getMinZ(), ecefBounds.getMaxX(), ecefBounds.getMaxY(), ecefBounds.getMaxZ());
        const ecefCenter = ecefRange.localXYZToWorld(.5, .5, .5)!;
        const cartoCenter = Cartographic.fromEcef(ecefCenter)!;
        cartoCenter.height = 0;
        const ecefLocation = EcefLocation.createFromCartographicOrigin(cartoCenter);
        location = ecefLocation;
        const ecefToWorld = ecefLocation.getTransform().inverse()!;
        worldRange = ecefToWorld.multiplyRange(ecefRange);
    }
    else {
        // NoGCS case
        const centerOfEarth: EcefLocationProps = { origin: { x: 0.0, y: 0.0, z: 0.0 }, orientation: { yaw: 0.0, pitch: 0.0, roll: 0.0 } };
        location = centerOfEarth;
    }
    
    const provider = RealityDataProvider.ContextShare;
    const format = RealityDataFormat.OPC;
    const rdSourceKey: RealityDataSourceKey = rdId ? { provider, format, id: rdId } : RealityDataSource.createKeyFromUrl(rdUrl);
    const realityModel: ContextRealityModelProps = { 
        rdSourceKey, 
        tilesetUrl: rdUrl, 
        name: rdName, 
        realityDataId: rdId 
    };
    const blankContextrealityModel: BlankContextRealityModelProps = { realityModel, location, worldRange };
    return blankContextrealityModel;
}

/**
 * Extracts reality data info from reality data url.
 * @private
 * @param accessToken the access token string.
 * @param realityDataId id of the reality data to read.
 * @returns array of context reality data info.
 */
async function getBlankContextRealityModel(accessToken: string, realityDataId: string): Promise<BlankContextRealityModelProps[]> {
    const blankContextRealityModels: BlankContextRealityModelProps[] = [];
  
    const realityDataClientOptions: RealityDataClientOptions = {
        baseUrl: "https://" + process.env.IMJS_URL_PREFIX + "api.bentley.com/realitydata",
    };
    const rdaClient = new RealityDataAccessClient(realityDataClientOptions);
    const rdUrl = await rdaClient.getRealityDataUrl(process.env.IMJS_PROJECT_ID, realityDataId);
    
    // The dataset came from RDS
    const realityData = await rdaClient.getRealityData(accessToken, process.env.IMJS_PROJECT_ID, realityDataId);
    if(!realityData)
        return blankContextRealityModels;
    
    const rdName = realityData.displayName !== undefined ? realityData.displayName : "Reality Data";
    const rootDoc = realityData.rootDocument !== undefined ? realityData.rootDocument : `${rdName  }.json`;
    const url = await realityData.getBlobUrl(accessToken, rootDoc);
    const rootDocUrl = url.toString();
    
    // handle supported reality data types
    if (realityData.type && (realityData.type === "OPC"))  {
        // Get the reality data root document to extract info needed to create reality data model and view in iModel
        const blankContextRealityModel = await realityModelFromOPC(rootDocUrl, rdUrl, rdName, realityDataId);
        blankContextRealityModels.push(blankContextRealityModel); 
    } 
    else if (realityData.type && realityData.type === "Cesium3DTiles") {
        // Get the reality data root document to extract info needed to create reality data model and view in iModel
        const rootDocjson: any = await getRootDocJson(rootDocUrl);
        const blankContextRealityModel = realityModelFromJson(rootDocjson, rdName, realityData.id, realityData.type);
        blankContextRealityModels.push(blankContextRealityModel);

    } else {
        throw new Error("Invalid reality data type : " + realityData.type!);
    }
    
    return blankContextRealityModels;
}

/**
 * Create a new *blank* SpatialViewState. The returned SpatialViewState will have non-persistent empty [[CategorySelectorState]] and [[ModelSelectorState]],
 * and a non-persistent [[DisplayStyle3dState]] with default values for all of its components. Generally after creating a blank SpatialViewState,
 * callers will modify the state to suit specific needs.
 * @param accessToken the access token string.
 * @param iModelConnection The IModelConnection for the new SpatialViewState.
 * @param realityDataId id of the reality data to read.
 * @returns 
 */
export async function createBlankViewState(accessToken: AccessToken, iModelConnection: IModelConnection, realityDataId: string): Promise<SpatialViewState> {
    const blankContextRealityModel = await getBlankContextRealityModel(accessToken, realityDataId);
    const rdViewState = createRealityContextViewState(iModelConnection, blankContextRealityModel);
    return rdViewState;
}

/**
 * create a new spatial view initialized to show the project extents from top view. Model and
 * category selectors are empty, so this is useful for showing backgroundMaps, reality models, terrain, etc.
 * @private
 * @param iModelConnection The IModelConnection for the new SpatialViewState.
 * @param blankContextRealityModels array of context reality data info.
 * @returns 
 */
function createRealityContextViewState(iModelConnection: IModelConnection, blankContextRealityModels: BlankContextRealityModelProps[]): SpatialViewState {
    const ext = iModelConnection.projectExtents;
    const rotation = Matrix3d.createStandardWorldToView(StandardViewIndex.Iso);

    // start with a new "blank" spatial view to show the extents of the project, from top view
    const realityContextViewState = SpatialViewState.createBlank(iModelConnection, ext.low, ext.high.minus(ext.low), rotation);
    const style = realityContextViewState.displayStyle;
    blankContextRealityModels.forEach((rmElement) => {
        style.attachRealityModel(rmElement.realityModel);
    });

    return realityContextViewState;
}