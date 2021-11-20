import Link from 'next/link';
import React from 'react';
import ImageBox from '@components/ImageBox';
export interface I_BannerType {
    data?: Array<Banner>;
    ratio?: { w: number; h: number }; //寬高比  數字1~16
    timmer?: number; //輪播時間  ms  , 不輪播傳入null
    smRatio?: { w: number; h: number }; //phonesize
}
interface Banner {
    herf?: string;
    path?: string;
    title?: string;
}

const Banner: React.FC<I_BannerType> = ({ data, ratio, timmer, smRatio }) => {
    const [carouselWidth, setCarouselWidth] = React.useState(0);
    const [titleWidth, setTitleWidth] = React.useState(0);
    const [itemLength, setItemLength] = React.useState(0);
    const bannerLocation = React.useRef(0);
    const titleLocation = React.useRef(0);
    const indexRef = React.useRef(0);
    const stopRef = React.useRef(false);
    const freezeRef = React.useRef(false);
    let interval;
    //Banner 元素
    const CarouselElements = data.map((d, i) => {
        return (
            <div className='min-w-full min-h-full' key={i}>
                {d.herf ? (
                    <Link href={d.herf}>
                        <a>
                            <ImageBox url={d.path} ratio={ratio} smRatio={smRatio} />
                        </a>
                    </Link>
                ) : (
                    <ImageBox url={d.path} ratio={ratio} smRatio={smRatio} />
                )}
            </div>
        );
    });
    //Title元素
    const TitleElements = data.map((d, i) => {
        return (
            <h1 key={`title${i}`} className='self-center min-w-full text-center tablet:text-3xl text-2xl font-medium '>
                標題 {i + 1}
            </h1>
        );
    });
    //控制點點元素
    const ControlElements = data.map((d, i) => {
        return (
            <div
                key={`dot${i}`}
                id={`dot${i}`}
                onClick={() => {
                    handleController(i);
                    stopRef.current = true;
                }}
                className='w-9 h-2.5 bg-Xinmedia-Gainsboro  rounded-full cursor-pointer opacity-80 hover:opacity-100'
            />
        );
    });
    //控制顯示
    const handleController = (i: number) => {
        bannerLocation.current = i * -carouselWidth;
        titleLocation.current = i * -titleWidth;
        let control = document.querySelector('#control').childNodes;
        document.querySelector('#carousel-change').setAttribute('style', `transform: translateX(${bannerLocation.current}px)`);
        document.querySelector('#title-change').setAttribute('style', `transform: translateX(${titleLocation.current}px)`);
        control.forEach((d: HTMLDivElement, index) => {
            if (index === i) {
                d.classList.add('bg-Xinmedia-White');
                d.classList.add('opacity-100');
            } else {
                d.classList.remove('bg-Xinmedia-White');
                d.classList.remove('opacity-100');
            }
        });
        indexRef.current = i;
    };

    //左右按鈕、輪播用
    const handleSlide = (offset: number) => {
        let currentIndex: number;
        currentIndex = setCurrentIndex();
        function setCurrentIndex() {
            if (indexRef.current + offset <= itemLength - 1 && indexRef.current + offset >= 0) {
                return indexRef.current + offset;
            } else if (indexRef.current + offset > itemLength - 1) {
                return 0;
            } else if (indexRef.current + offset < 0) {
                return itemLength - 1;
            }
        }
        handleController(currentIndex);
    };
    // 輪播功能
    const AutoCarousel = () => {
        interval = setInterval(() => {
            if (freezeRef.current === true) {
                //凍結
                return;
            } else if (stopRef.current !== true) {
                //執行
                handleSlide(1);
            } else {
                //點擊後暫停一次
                stopRef.current = false;
            }
        }, timmer);
    };

    //設定螢幕寬度
    const handleWidth = () => {
        setCarouselWidth(document.getElementById('carousel-container').offsetWidth);
        setTitleWidth(document.getElementById('title').offsetWidth);
    };
    //初始設定
    React.useEffect(() => {
        handleWidth();
        //Banner 圖片數
        setItemLength(document.querySelectorAll('#carousel-change')[0].childNodes.length);
        //Controller 初始位置
        handleController(indexRef.current);
        //偵測螢幕寬
        window.addEventListener('resize', handleWidth);
        return () => {
            window.removeEventListener('resize', handleWidth);
        };
    }, []);
    //resize 後自動復位
    React.useEffect(() => {
        bannerLocation.current = indexRef.current * -carouselWidth;
        titleLocation.current = indexRef.current * -titleWidth;
        document.querySelector('#carousel-change').setAttribute('style', `transform: translateX(${bannerLocation.current}px)`);
        document.querySelector('#title-change').setAttribute('style', `transform: translateX(${titleLocation.current}px)`);
    }, [carouselWidth, titleWidth]);
    // 輪播計時;
    React.useEffect(() => {
        if (itemLength && timmer) {
            AutoCarousel();
            return () => {
                clearInterval(interval);
            };
        }
    }, [carouselWidth, titleWidth]);

    return (
        <div className=' mb-10'>
            <div className='max-w-full relative'>
                <div
                    className=' overflow-hidden'
                    id='carousel-container'
                    onMouseEnter={() => {
                        freezeRef.current = true;
                    }}
                    onMouseLeave={() => {
                        freezeRef.current = false;
                    }}
                >
                    <div className='flex flex-row transform duration-700' id='carousel-change'>
                        {CarouselElements}
                    </div>
                </div>
                <div className='flex gap-4 absolute left-2/4 tablet:bottom-14 bottom-6 -translate-x-1/2 transform ' id='control'>
                    {ControlElements}
                </div>
                <div
                    id='title'
                    className='absolute bg-Xinmedia-WhiteSmoke w-11/12 tablet:h-1/5 h-1/3 border-black border rounded-md 
                            -bottom-6 tablet:-bottom-8 left-2/4 -translate-x-1/2 transform overflow-hidden'
                >
                    <div id='title-change' className='flex flex-row transform duration-700 w-full h-full'>
                        {TitleElements}
                    </div>
                </div>
            </div>
        </div>
    );
};

Banner.defaultProps = {
    ratio: { w: 4, h: 1 },
    smRatio: { w: 3, h: 1 },
    timmer: 6000,
};
export default Banner;
