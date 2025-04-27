import React from 'react';
interface ImagePropsType extends ImageProps{
    src: string;
    width: number;
    height: number;
}
const Image:React.FC<ImagePropsType> = (props) => {
    return <img src={props.src} style={{width: props.width, height: props.height}}/>
}
export default Image;