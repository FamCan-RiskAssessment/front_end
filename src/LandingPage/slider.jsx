import { useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Import required modules (optional features)
import { Pagination, Navigation, Autoplay } from 'swiper/modules';


import bimeSalamteMan from '../assets/logos/bime-salamte-man-icon.png';
import logoHybrid from '../assets/logos/Logo Hybrid 2.png';
import pajooheshkadeh from '../assets/logos/پژوهشکده.png';
import shahidBeheshti from '../assets/logos/شهیدبهشتی.jpg';
import tehranUni from '../assets/logos/لوگو انگلیسی دانشگاه تهران.jpg';
import behdasht from '../assets/logos/لوگو-وزارت-بهداشت-2-3.jpg';
import mazandaran from '../assets/logos/مازندران.webp';
import mohavateBehdashti from '../assets/logos/معاونت بهداشتی وزارت.jpg';

function Slider() {
    let arrOfIms = [{ img: bimeSalamteMan, title: "" }, {
        img: shahidBeheshti, title: "اعتبارسنجی و بومی سازی مدل های معتبر پیش بینی خطر  سرطان‌ ریه در جمعیت ایرانی (فازهای اول و دوم پروژه ملی پیشگیری فردمحور سرطان) طبقه‌بندی خطر و ثبت موارد. کد طرح: 43017023"
    }
        , {
        img: tehranUni, title: "طراحی، تولید و اعتبارسنجی سامانه ریسکسنجی سرطانهای پستان و کولورکتال در جمعیت ایرانی(فازهای اول و دوم پروژه ملی پیشگیری فردمحور سرطان).کد طرح: 1404 - 1 - 107 - 91678"
    }
        , { img: behdasht, title: "" }, { img: mazandaran, title: "" }, { img: mohavateBehdashti, title: "" }]
    let arrofNames = []
    return (

        // <Swiper
        //     modules={[Pagination, Navigation, Autoplay]}
        //     spaceBetween={10}
        //     slidesPerView="auto"
        //     loop={true}
        //     autoplay={{
        //         delay: 3000,
        //         disableOnInteraction: false,
        //     }}
        //     pagination={{
        //         clickable: true,
        //     }}
        //     navigation={true}
        //     className="mySwiper"
        // >
        //     <SwiperSlide>
        //         <img className="slider-img" src={bimeSalamteMan} alt="Slide 1" />
        //     </SwiperSlide>
        //     <SwiperSlide>
        //         <img className="slider-img" src={logoHybrid} alt="Slide 2" />
        //     </SwiperSlide>
        //     <SwiperSlide>
        //         <img className="slider-img" src={pajooheshkadeh} alt="Slide 2" />
        //     </SwiperSlide>
        //     <SwiperSlide>
        //         <img className="slider-img" src={shahidBeheshti} alt="Slide 2" />
        //     </SwiperSlide>
        //     <SwiperSlide>
        //         <img className="slider-img" src={tehranUni} alt="Slide 2" />
        //     </SwiperSlide>
        //     <SwiperSlide>
        //         <img className="slider-img" src={behdasht} alt="Slide 2" />
        //     </SwiperSlide>
        //     <SwiperSlide>
        //         <img className="slider-img" src={mazandaran} alt="Slide 2" />
        //     </SwiperSlide>
        //     <SwiperSlide>
        //         <img className="slider-img" src={mohavateBehdashti} alt="Slide 2" />
        //     </SwiperSlide>
        // </Swiper>
        <>

            <div className="image-list">
                <h2>نهاد های همکار</h2>
                <div>
                    {arrOfIms.map((img, index) => {
                        return (
                            <div className="teammate hover3">
                                <img src={img.img} alt="" title={img.title} />
                                {/* <div style={{ background: `url(${img})`, backgroundRepeat: "no-repeat" }}></div> */}
                                {/* <div className="teammate-name"></div> */}
                            </div>
                        )
                    })}
                </div>
                <div className="bigLandlogos">
                    <img src={logoHybrid} className="hover3" alt="" />
                    <img src={pajooheshkadeh} className="hover3" alt="" />
                </div>
            </div>
        </>
    )
}

export default Slider