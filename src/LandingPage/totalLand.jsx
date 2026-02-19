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
import AboutUsImage from './AboutUs.jpg'
import logoImage from './logomonochrome_white.png';
import textLogoImage from './logotype_white.png';
import instaLogo from './instagram.svg'
import phoneIcon from './phone.svg'
import mailIcon from './mail.svg'
import FBLogo from './facebook.svg'
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
                            navigate("/attention")
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
                        <div className="approach1 inntext hover4">
                            <h2>ثبت امن اطلاعات</h2>
                            <h3>با پر کردن یک فرم تخصصی در کمتر از 15 دقیقه،اطلاعات و سوابق پزشکی به صورت امن و محرمانه ثبت میشوند و صرفا برای تحلیل پزشکی استفاده خواهند شد.</h3>
                        </div>
                        <div className="approach2 inntext hover4">
                            <h2>تحلیل هوشمند</h2>
                            <h3>مدلهای هوش مصنوعی،دادههای شما را با نهایت دقت بررسی کرده و ریسکهای احتمالی را شناسایی میکنند.</h3>
                        </div>
                        <div className="approach3 inntext hover4">
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
                    <div className="top-half">
                        <img src={AboutUsImage} alt="about us" />
                    </div>

                    <div className="bottom-half">
                        {/* empty */}
                    </div>

                    <div className="overlay-center">
                        <h2>دربارۀ ما</h2>
                        <p className="subtitle">
                            فم‌کن – انجمن سرطان‌های ارثی-فامیلی به پیشگیری از سرطان در افراد پرخطر می‌پردازد.
                        </p>
                        <p className="description">
                            فم‌کن یک رجیستری سندرم‌های استعداد ابتلا به سرطان است. کاربران فم‌کن، افراد مبتلا و در خطر این
                            سندرم‌ها‌اند. فم‌کن یک سازمان مردم‌نهاد (NGO) غیرانتفاعی و عام‌المنفعه است که به ارگان‌های
                            دولتی وابسته نیست. اعضای فم‌کن متخصصین فعال در زمینۀ مدیریت بیماران مبتلا به سرطان‌اند. ما در
                            کلینیک‌های پزشکی افراد در خطر ابتلا به سرطان را شناسایی می‌کنیم، سپس به پیگیری فعال
                            (Active Follow-up) ایشان می‌پردازیم تا قبل از رخداد سرطان در ایشان و یا خانواده‌شان اقدام
                            به پیشگیری ‌کنیم.
                        </p>
                    </div>
                </div>

            </div>


            <div className='third-land'>
                <div className='Footer-titr'>
                    <img src={logoImage} style={{ width: "25rem" }} alt="FamCan Logo" className='footer-logo' />
                    <img src={textLogoImage} style={{ height: "10rem" }} alt="FamCan Text Logo" className='footer-text-logo' />
                </div>
                <div className='Footer-text'>
                    <div className='explanations'>
                        <div className='contact-item'>
                            {/* <MdLocationOn size={20} /> */}
                            <div>
                                <strong>دفتر مرکزی</strong>
                                <p>
                                    تهران، خیابان کارگر شمالی، جنب پمپ بنزین، کوچه اکبری،
                                    پلاک ۳۴، طبقه ۴، کد پستی: ۱۴۱۴۶۳۳۴۶۵
                                </p>
                            </div>
                        </div>
                        <div className='contact-item'>
                            {/* <MdEmail size={20} /> */}
                            <img src={mailIcon} style={{ height: '20', width: '20' }} alt="" />
                            <a href="mailto:info@famcan.org">info@famcan.org</a>
                        </div>
                        <div className='contact-item'>
                            <img src={phoneIcon} style={{ height: '20', width: '20' }} alt="" />
                            <a href="tel:02187700073">۸۷۷۰۰۰۷۳ - ۰۲۱</a>
                        </div>
                    </div>
                    <div className='Footer-images'>
                        <div className='Footer-image'>
                            <a
                                href="https://www.instagram.com/famcan_institute/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                            >
                                <img src={instaLogo} style={{ height: '28', width: '28' }} alt="" />
                                {/* <FaInstagram size={28} /> */}
                            </a>
                        </div>
                        <div className='Footer-image'>
                            <a
                                href="https://m.facebook.com/FamCanInstitute/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                            >
                                <img src={FBLogo} style={{ height: '28', width: '28' }} alt="" />
                                {/* <FaFacebookF size={28} /> */}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default LandingPage