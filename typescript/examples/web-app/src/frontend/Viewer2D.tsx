/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Button } from "@itwin/itwinui-react";
import { RealityDataAccessClient, ITwinRealityData } from "@itwin/reality-data-client";
import { decode } from "fast-png";
import React, { MutableRefObject, useEffect, useRef } from "react";
import { SelectRealityData } from "./SelectRealityData";
import { ContextScene, parseContextScene } from "./utils/ContextSceneParser";
import "./Viewer2D.css";

interface Viewer2DProps {
    realityDataAccessClient: RealityDataAccessClient;
}

let contextScene: ContextScene = {
    photos: new Map(),
    lines3D: "",
    references: new Map(),
    labels: new Map(),
};
  
export function Viewer2D(props: Viewer2DProps) {
    const [idToDisplay, setIdToDisplay] = React.useState<string>("");
    const [imageIndex, setImageIndex] = React.useState<number>(-1);
    const [zoomLevel, setZoomLevel] = React.useState<number>(1);

    const canvas = useRef() as MutableRefObject<HTMLCanvasElement>;
    const canvas2 = useRef() as MutableRefObject<HTMLCanvasElement>;

    useEffect(() => {
        const updateImage = async () => {
            const currentPhoto = getCurrentPhoto();
            if(imageIndex === - 1 || !currentPhoto)
                return;

            // Display background image (the photo)
            const image = new Image();
            image.onload = async function() {
                resizeImage(image);
                drawPhoto(image);
                drawO2D();
                drawS2DFromFile(image);
            };
            image.src = currentPhoto;
        };
        updateImage();
        window.addEventListener("resize", updateImage);
        return () => { window.removeEventListener("resize", updateImage); };
    }, [imageIndex]);

    useEffect(() => {
        const updateImage = async () => {
            const currentPhoto = getCurrentPhoto();
            if(imageIndex === - 1 || !currentPhoto)
                return;
            // Display background image (the photo)
            const image = new Image();            
            image.onload = async function() {
                resizeImage(image);
                drawPhoto(image);
                drawO2D();
                drawS2DFromCanvas(image);
            };
            image.src = currentPhoto;
        };
        updateImage();
    }, [zoomLevel]);

    const getCurrentPhoto = (): string => {
        const currentPhoto = contextScene.photos.get(imageIndex);
        if(currentPhoto)
            return currentPhoto.path;

        return "";
    };

    const resizeImage = async (image: HTMLImageElement): Promise<void> => {
        if(image.width > window.innerWidth || image.height > window.innerHeight) {
            const ratioW = image.width / window.innerWidth;
            const ratioH = image.height / window.innerHeight;
            if(ratioH > ratioW)
            {
                const imageRatio = image.width / image.height;
                image.height = window.innerHeight;
                image.width = image.height * imageRatio;
            }
            else {
                const imageRatio = image.height / image.width;
                image.width = window.innerWidth;
                image.height = image.width * imageRatio;                     
            }
        }
    };

    const drawPhoto = (image: HTMLImageElement): void => {
        const context = canvas.current!.getContext("2d");
        if(!context)
            return;
            
        canvas.current.width = image.width * zoomLevel;
        canvas.current.height = image.height * zoomLevel;
        context.globalAlpha = 1;
        context.drawImage(image, 0, 0, canvas.current.width, canvas.current.height);
    };

    const drawO2D = (): void => {
        const photo = contextScene.photos.get(imageIndex);
        if(!photo)
            return;

        const context = canvas.current!.getContext("2d");
        if(!context)
            return;

        photo.objects2D.forEach((object2D) =>{
            context.beginPath();
            const color = contextScene.labels.get(object2D.labelId);
            if(!color)
                return;

            context.fillStyle = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + "0.3 )";
            const xmin = object2D.xmin * canvas.current.width;
            const ymin = object2D.ymin * canvas.current.height;
            const xmax = object2D.xmax * canvas.current.width;
            const ymax = object2D.ymax * canvas.current.height;
            const objectWidth = xmax - xmin;
            const objectHeight = ymax - ymin;
            context.fillRect(xmin, ymin, objectWidth, objectHeight);
        });
    };

    const drawS2DFromFile = async (image: HTMLImageElement): Promise<void> => {
        const context2 = canvas2.current!.getContext("2d");
        if(!context2)
            return;

        canvas2.current.width = image.naturalWidth;
        canvas2.current.height = image.naturalHeight;

        const segPath = contextScene.photos.get(imageIndex)?.segmentation2D.path;
        if(segPath === undefined)
            return;
        
        const response = await fetch(segPath);
        const buffer = await response.arrayBuffer();
        const depthData = decode(buffer).data as Uint16Array;
        const S2DImage = new Uint8ClampedArray(4 * canvas2.current.width * canvas2.current.height);

        for(let i = 0; i < depthData.length; i++) {
            if(depthData[i] > 0) {
                console.log(depthData[i]);
                S2DImage[i * 4] = 255;
                S2DImage[i * 4 + 1] = 0;
                S2DImage[i * 4 + 2] = 0;
                S2DImage[i * 4 + 3] = 120;
            }
        }

        const imageData = new ImageData(S2DImage, canvas2.current.width, canvas2.current.height);
        // Resize image
        const ibm = await window.createImageBitmap(imageData, 0, 0, imageData.width, imageData.height, {
            resizeWidth :image.width * zoomLevel,
            resizeHeight: image.height * zoomLevel
        });
        canvas2.current.width = image.width * zoomLevel;
        canvas2.current.height = image.height * zoomLevel;
        context2.drawImage(ibm, 0, 0, canvas2.current.width, canvas2.current.height);
    };

    const drawS2DFromCanvas = async (image: HTMLImageElement): Promise<void> => {
        const context2 = canvas2.current!.getContext("2d");
        if(!context2)
            return;
            
        const data = context2.getImageData(0, 0, canvas2.current.width, canvas2.current.height);
        const ibm = await window.createImageBitmap(data, 0, 0, data.width, data.height, {
            resizeWidth :image.width * zoomLevel, 
            resizeHeight: image.height * zoomLevel
        });
        canvas2.current.width = image.width * zoomLevel;
        canvas2.current.height = image.height * zoomLevel;
        context2.drawImage(ibm, 0, 0, canvas2.current.width, canvas2.current.height);
    };

    const onImageIndexChange = (newImageIndex: number): void => {
        if(newImageIndex < 0) {
            if(contextScene.photos.size)
                setImageIndex(contextScene.photos.size - 1);
        }
        else if((contextScene.photos.size && newImageIndex > contextScene.photos.size - 1))
            setImageIndex(0);
        else
            setImageIndex(newImageIndex);
    };

    const onIdChange = async (select: string): Promise<void> => {
        setIdToDisplay(select);
    };
    
    const onZoomChange = (newZoomLevel: number): void => {
        setZoomLevel(newZoomLevel);
    };
    
    /** Get the current photo file name. */
    const getImageName = (): string => {
        const photo = contextScene.photos.get(imageIndex);
        if(photo)
            return photo.name;

        return "";
    };

    const onDisplay = async (): Promise<void> => {
        onImageIndexChange(-1);
        // Reset contextScene
        contextScene.photos.clear();
        contextScene.labels.clear();
        contextScene.references.clear();

        const realityData: ITwinRealityData = await props.realityDataAccessClient.getRealityData("", 
            import.meta.env.IMJS_PROJECT_ID, idToDisplay);
        if(realityData.type === "ContextScene")
            contextScene = await parseContextScene(props.realityDataAccessClient, idToDisplay);
        else if(realityData.type === "CCImageCollection")
            contextScene = await parseContextScene(props.realityDataAccessClient, idToDisplay, false);
        
        onImageIndexChange(0);
    };

    return(
        <div>
            <div className="photo-viewer-controls-group">
                <h2 className="photo-viewer-control">2D Viewer</h2>
            </div>
            <div className="photo-viewer-controls-group">
                <div className="photo-viewer-control">
                    <SelectRealityData realityDataAccessClient={props.realityDataAccessClient} 
                        onSelectedDataChange={onIdChange} selectedRealityData={idToDisplay} 
                        realityDataType={["CCImageCollection", "ContextScene"]} />                 
                </div>         
            </div>
            <div className="photo-viewer-controls-group">
                <div className="photo-viewer-control">
                    <Button onClick={onDisplay}>Display</Button>
                </div>
            </div>
            { imageIndex !== -1 && (
                <div>
                    <div className="photo-viewer-controls-group">
                        <div className="photo-viewer-control">
                            <Button onClick={() => { onImageIndexChange(imageIndex - 1);}}>Previous</Button>
                        </div>
                        <div className="photo-viewer-control">
                            <Button className="photo-viewer-control" onClick={() => { onImageIndexChange(imageIndex + 1);}}>Next</Button>
                        </div>
                        <div className="photo-viewer-control">
                            <Button className="photo-viewer-control" onClick={() => { onZoomChange(zoomLevel - (zoomLevel / 10));}}>-</Button>
                        </div>
                        <div className="photo-viewer-control">
                            <Button className="photo-viewer-control" onClick={() => { onZoomChange(zoomLevel + (zoomLevel / 10));}}>+</Button>
                        </div>
                        <p className="photo-viewer-control"> {getImageName()} </p>
                    </div>
                    <div className="photo-viewer-canvas">
                        <canvas ref={canvas} id="viewer"/>
                        <canvas ref={canvas2} id="viewer-S2D"/>
                    </div>
                </div>
            )}
        </div>
    );
}