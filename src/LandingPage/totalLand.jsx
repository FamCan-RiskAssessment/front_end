import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Navigation, Thumbs } from 'swiper/modules';
import LandNav from "./landNav";
import canlogo from './item1B1.png'
import './totalLand.css'
import minimul_sups from './minimal_supporters.svg'
import AD from './arrowD.svg'
import arrowRight from './compArrowRight.svg'
// import C1 from './Card1B2.svg'
// import C2 from './Card2B2.svg'
// import C3 from './Card3B2.svg'
import cards from './cards.png'
import Slider from "./slider";
// import SliderV2 from "./sliderV2";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

// Optional: custom styles for thumbnails
import './SwiperThumbs.css'; // see CSS below

import '../VazirFontFace.css'
import './responsiveLanding.css'
import bimeSalamteMan from '../assets/logos/bime-salamte-man-icon.png';
import logoHybrid from '../assets/logos/Logo Hybrid 2.png';
import pajooheshkadeh from '../assets/logos/پژوهشکده.png';
import shahidBeheshti from '../assets/logos/شهیدبهشتی.jpg';
import tehranUni from '../assets/logos/لوگو انگلیسی دانشگاه تهران.jpg';
import behdasht from '../assets/logos/لوگو-وزارت-بهداشت-2-3.jpg';
import mazandaran from '../assets/logos/مازندران.webp';
import mohavateBehdashti from '../assets/logos/معاونت بهداشتی وزارت.jpg';

import altIm from './altIm.svg'

function LandingPage() {
    let arrOfIms = [bimeSalamteMan, shahidBeheshti, tehranUni, behdasht, mazandaran, mohavateBehdashti]
    let range_arr = [1, 2, 3, 4]
    const mainSwiperRef = useRef(null);
    const thumbsSwiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0)
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <>
            {/* the top parts */}
            <div className="first-land">
                <LandNav></LandNav>
                <div className="gate">
                    <div className="gate-bell">
                        <h2>ارزیابی ریسک سرطان هوشمند و محرمانه</h2>
                        <button className="gate-enter hover1" onClick={() => {
                            localStorage.setItem("residentEnter", JSON.stringify(false))
                            navigate("/gate")
                        }}>
                            <span>محاسبه ی ریسک سرطان</span>
                            <span style={{ display: "flex", alignItems: "center" }}>
                                <img src={arrowRight} alt="" />
                            </span>
                        </button>
                    </div>
                    <div className="item1B1">
                        <img src={canlogo} alt="canlogo" />
                    </div>
                </div>
                <div className='minimal_sups'>
                    <img src={minimul_sups} alt="miniSupporters" />
                </div>
                <div className="moreInf">
                    <p>اطلاعات بیشتر</p>
                    <a href="#approches">
                        <img src={AD} alt="AD" className='hover3' />
                    </a>
                </div>
            </div>

            {/* the middle parts */}
            <div className="second-land">
                <div className="approaches" id='approches'>
                    <h3>رویکرد ما</h3>
                    {/* <img src={cards} alt="cards" /> */}
                    <div className="innapproaches">
                        <div className="approach1 inntext hover3">
                            <h2>ثبت امن اطلاعات</h2>
                            <h3>با پر کردن یک فرم تخصصی در کمتر از 15 دقیقه،اطلاعات و سوابق پزشکی به صورت امن و محرمانه ثبت میشوند و صرفا برای تحلیل پزشکی استفاده خواهند شد.</h3>
                        </div>
                        <div className="approach2 inntext hover3">
                            <h2>تحلیل هوشمند</h2>
                            <h3>مدلهای هوش مصنوعی،دادههای شما را با نهایت دقت بررسی کرده و ریسکهای احتمالی را شناسایی میکنند.</h3>
                        </div>
                        <div className="approach3 inntext hover3">
                            <h2>دریافت گزارش</h2>
                            <h3>با توجه به دادههای ورودی،یک توصیهنامۀ کاربردی دریافت میکنید.</h3>
                        </div>
                    </div>
                </div>
                <div className="teammates" id='teammates'>
                    <div className="innteammates">
                        <Slider></Slider>
                    </div>
                </div>
                <div className="aboutus">
                    <h3>درباره ما</h3>
                    <div className="about-info">
                        <div className="desctext">
                            <p>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit facilis culpa quas ex? Mollitia
                                veniam reiciendis, quod labore sunt dolor doloribus cumque tempora veritatis ex ab vitae repudiandae, soluta quaerat?
                                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolore earum consequuntur officiis eaque
                                harum laudantium perferendis, possimus consectetur quo voluptate labore est voluptates eos incidunt exercitationem provident culpa eligendi quod!
                            </p>
                        </div>
                        <div className="image-aboutus gallery-container">
                            <Swiper
                                modules={[Navigation, Thumbs]}
                                spaceBetween={10}
                                navigation={true}
                                thumbs={{ swiper: thumbsSwiperRef.current }}
                                onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
                                className="main-swiper"
                            >
                                {arrOfIms.map((img, idx) => (
                                    <SwiperSlide key={idx}>
                                        <img
                                            src={img}
                                            alt={"image"}
                                            style={{ width: '100%', height: 'auto', display: 'block' }}
                                        />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                    <div className="image-choose gallery-container">
                        <Swiper
                            modules={[Thumbs]}
                            onSwiper={(swiper) => (thumbsSwiperRef.current = swiper)}
                            watchSlidesProgress={true}
                            spaceBetween={8}
                            slidesPerView="auto" // ← key: show as many as fit
                            className="thumbs-swiper"
                        >
                            {arrOfIms.map((img, idx) => (
                                <SwiperSlide key={idx} className="thumb-slide">
                                    <img
                                        src={img}
                                        alt={`thumb ${idx}`}
                                        className={`thumb-btn ${idx === activeIndex ? 'active' : ''}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onClick={() => {
                                            mainSwiperRef.current?.slideTo(idx)
                                            setActiveIndex(idx)
                                        }}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </div>


            <div className='third-land'>
                <div className='right-holder'>
                    <div className='Footer-titr'>
                        <h2>فم کن</h2>
                        <h1></h1>
                    </div>
                    <div className='explanations'>
                        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minus ducimus blanditiis vel explicabo. Assumenda alias provident
                            aliquid autem, pariatur delectus ex vero necessitatibus. Deserunt cupiditate facilis quas accusantium, fugiat error.</p>
                    </div>
                    <div className='Footer-images'>
                        {range_arr.map((arri, index) => {
                            return (
                                <div className='Footer-image'>
                                    <img src={altIm} alt="altIm" />
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className='left-holder'>
                    <div className='set1-links'>
                        <h2>لینک های مفید</h2>
                        <ul>
                            <li>لینک</li>
                            <li>لینک</li>
                            <li>لینک</li>
                            <li>لینک</li>
                        </ul>
                    </div>
                    <div className='set2-links'>
                        <h2>لینک های مفید</h2>
                        <ul>
                            <li>لینک</li>
                            <li>لینک</li>
                            <li>لینک</li>
                            <li>لینک</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}
export default LandingPage