/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Button, LabeledInput } from "@itwin/itwinui-react";
import { decode } from "fast-png";
import React, { MutableRefObject, useEffect, useRef } from "react";
import { ContextScene } from "../common/models";
import "./Viewer2D.css";

interface Viewer2DProps {
    imageIndex: number;
    zoomLevel: number;
    idToDisplay: string;
    onIdChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onZoomChange: (newZoomLevel: number) => void
    onImageIndexChange: (newImageIndex: number) => void;
}

let contextScene: ContextScene = {
    photos: new Map(),
    lines3D: "",
    references: new Map(),
    labels: new Map(),
};

let imageCollectionUrls: string[] = [];
  
export function Viewer2D(props: Viewer2DProps) {

    const canvas = useRef() as MutableRefObject<HTMLCanvasElement>;
    const canvas2 = useRef() as MutableRefObject<HTMLCanvasElement>;

    useEffect(() => {
        const updateImage = async () => {
            const currentPhoto = getCurrentPhoto();
            if(props.imageIndex === - 1 || !currentPhoto)
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
    }, [props.imageIndex]);

    useEffect(() => {
        const updateImage = async () => {
            const currentPhoto = getCurrentPhoto();
            if(props.imageIndex === - 1 || !currentPhoto)
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
    }, [props.zoomLevel]);

    const getCurrentPhoto = (): string => {
        const currentPhoto = contextScene.photos.get(props.imageIndex);
        if(currentPhoto)
            return currentPhoto.path;
        
        if(imageCollectionUrls.length > props.imageIndex)
            return imageCollectionUrls[props.imageIndex];

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
            
        canvas.current.width = image.width * props.zoomLevel;
        canvas.current.height = image.height * props.zoomLevel;
        context.globalAlpha = 1;
        context.drawImage(image, 0, 0, canvas.current.width, canvas.current.height);
    };

    const drawO2D = (): void => {
        const photo = contextScene.photos.get(props.imageIndex);
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

        const segPath = contextScene.photos.get(props.imageIndex)?.segmentation2D.path;
        if(segPath === undefined)
            return;
        
        const response = await fetch(segPath);
        const buffer = await response.arrayBuffer();
        const depthData = decode(buffer).data as Uint16Array;
        const S2DImage = new Uint8ClampedArray(4 * canvas2.current.width * canvas2.current.height);

        for(let i = 0; i < depthData.length; i++) {
            if(depthData[i] > 0) {
                S2DImage[i * 4] = 255;
                S2DImage[i * 4 + 1] = 0;
                S2DImage[i * 4 + 2] = 0;
                S2DImage[i * 4 + 3] = 120;
            }
        }

        const imageData = new ImageData(S2DImage, canvas2.current.width, canvas2.current.height);
        // Resize image
        const ibm = await window.createImageBitmap(imageData, 0, 0, imageData.width, imageData.height, {
            resizeWidth :image.width * props.zoomLevel,
            resizeHeight: image.height * props.zoomLevel
        });
        canvas2.current.width = image.width * props.zoomLevel;
        canvas2.current.height = image.height * props.zoomLevel;
        context2.drawImage(ibm, 0, 0, canvas2.current.width, canvas2.current.height);
    };

    const drawS2DFromCanvas = async (image: HTMLImageElement): Promise<void> => {
        const context2 = canvas2.current!.getContext("2d");
        if(!context2)
            return;
            
        const data = context2.getImageData(0, 0, canvas2.current.width, canvas2.current.height);
        const ibm = await window.createImageBitmap(data, 0, 0, data.width, data.height, {
            resizeWidth :image.width * props.zoomLevel, 
            resizeHeight: image.height * props.zoomLevel
        });
        canvas2.current.width = image.width * props.zoomLevel;
        canvas2.current.height = image.height * props.zoomLevel;
        context2.drawImage(ibm, 0, 0, canvas2.current.width, canvas2.current.height);
    };

    const onImageIndexChange = (newImageIndex: number): void => {
        if(newImageIndex < 0) {
            if(contextScene.photos.size)
                props.onImageIndexChange(contextScene.photos.size - 1);
            else if(imageCollectionUrls.length)
                props.onImageIndexChange(imageCollectionUrls.length - 1);
        }
        else if((contextScene.photos.size && newImageIndex > contextScene.photos.size - 1) 
        || (imageCollectionUrls.length && newImageIndex > imageCollectionUrls.length - 1))
            props.onImageIndexChange(0);
        else
            props.onImageIndexChange(newImageIndex); 
    };

    const onZoomChange = (newZoomLevel: number): void => {
        props.onZoomChange(newZoomLevel);
    };

    const onIdChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        props.onIdChange(event);
    };
    
    /** Get the current photo file name. */
    const getImageName = (): string => {
        const photo = contextScene.photos.get(props.imageIndex);
        if(photo)
            return photo.name;
        
        if(imageCollectionUrls.length > 0)
        {
            const splitByAccess = imageCollectionUrls[props.imageIndex].split("?sv");
            if(splitByAccess.length < 2)
                return "";
            
            const splitDirectory = splitByAccess[0].split("/");
            const fileName = splitDirectory.pop();
            return fileName ?? "";
        }

        return "";
    };

    function reviver(_key: any, value: any) {
        if(typeof value === "object" && value !== null) {
            if (value.dataType === "Map") {
                return new Map(value.value);
            }
        }
        return value;
    }

    const onDisplay = async (): Promise<void> => {
        onImageIndexChange(-1);
        // Reset contextScene
        contextScene.photos.clear();
        contextScene.labels.clear();
        contextScene.references.clear();
        // Reset image collection
        imageCollectionUrls = [];

        const id = props.idToDisplay;
        const response = await fetch("http://localhost:3001/requests/realityData/" + id);
        const responseJson = await response.json();
        if(responseJson.type === "ContextScene")
        {
            contextScene = JSON.parse(responseJson.res, reviver);               
            onImageIndexChange(0);
        }
        else if(responseJson.type === "CCImageCollection")
        {
            imageCollectionUrls = JSON.parse(responseJson.res);              
            onImageIndexChange(0);
        }
    };

    return(
        <div>
            <div className="photo-viewer-controls-group">
                <LabeledInput displayStyle="inline" label="Entry" placeholder="Enter id here..." onChange={onIdChange} defaultValue={props.idToDisplay}/>
                <Button className="photo-viewer-control" onClick={onDisplay}>Display</Button>
            </div>
            <div className="photo-viewer-controls-group">
                <Button className="photo-viewer-control" disabled={props.imageIndex === -1} 
                    onClick={() => { onImageIndexChange(props.imageIndex - 1);}}>Previous</Button>
                <Button className="photo-viewer-control" disabled={props.imageIndex === -1} 
                    onClick={() => { onImageIndexChange(props.imageIndex + 1);}}>Next</Button>
                <Button className="photo-viewer-control" disabled={props.imageIndex === -1} 
                    onClick={() => { onZoomChange(props.zoomLevel - (props.zoomLevel / 10));}}>-</Button>
                <Button className="photo-viewer-control" disabled={props.imageIndex === -1} 
                    onClick={() => { onZoomChange(props.zoomLevel + (props.zoomLevel / 10));}}>+</Button>
                <p className="photo-viewer-control" hidden={props.imageIndex === -1}> {getImageName()} </p>
            </div>
            <div className="photo-viewer-canvas">
                <canvas ref={canvas} id="viewer" hidden={props.imageIndex === -1}/>
                <canvas ref={canvas2} id="viewer-S2D" hidden={props.imageIndex === -1}/>
            </div>
        </div>
    );
}