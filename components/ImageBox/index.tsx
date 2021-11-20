import React from 'react';

export interface ImageBoxType {
    url?: string;
    ratio?: { w: number; h: number };
    smRatio?: { w: number; h: number };
    ImgStyle?: Array<string>;
}

//default ratio = 16 / 9
//custom ratio by ratio={}
//custom ImgStyle class by ImgStyle
const ImageBox: React.FC<ImageBoxType> = (props) => {
    const { url, ratio, ImgStyle, smRatio } = props;
    const ratioRef = React.useRef<HTMLDivElement>(null);
    const ImgRef = React.useRef<HTMLImageElement>(null);
    React.useEffect(() => {
        if (smRatio?.w) {
            ratioRef.current?.classList.add(`tablet:aspect-w-${ratio.w}`, `tablet:aspect-h-${ratio.h}`);
            ratioRef.current?.classList.add(`aspect-w-${smRatio?.w}`, `aspect-h-${smRatio?.h}`);
        } else {
            ratioRef.current?.classList.add(`aspect-w-${ratio.w}`, `aspect-h-${ratio.h}`);
        }
    }, []);
    React.useEffect(() => {
        if (ImgStyle && ImgStyle.length > 0) {
            ImgStyle.map((d) => {
                ImgRef.current?.classList.add(d);
            });
        }
    }, []);
    return (
        <div ref={ratioRef} className=''>
            <img ref={ImgRef} className='object-cover' src={url ? url : '/'} alt='' />
        </div>
    );
};
ImageBox.defaultProps = {
    ratio: { w: 16, h: 9 },
};
export default ImageBox;
