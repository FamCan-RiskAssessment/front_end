import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

import bimeSalamteMan from '../assets/logos/bime-salamte-man-icon.png';
import logoHybrid from '../assets/logos/Logo Hybrid 2.png';
import pajooheshkadeh from '../assets/logos/پژوهشکده.png';
import shahidBeheshti from '../assets/logos/شهیدبهشتی.jpg';
import tehranUni from '../assets/logos/لوگو انگلیسی دانشگاه تهران.jpg';
import behdasht from '../assets/logos/لوگو-وزارت-بهداشت-2-3.jpg';
import mazandaran from '../assets/logos/مازندران.webp';
import mohavateBehdashti from '../assets/logos/معاونت بهداشتی وزارت.jpg';

function Slider() {
    let arrOfIms = [
        { img: bimeSalamteMan, title: "", isBig: false, name: "بیمه سلامت" },
        {
            img: shahidBeheshti,
            title: "اعتبارسنجی و بومی سازی مدل های معتبر پیش بینی خطر  سرطان‌ ریه در جمعیت ایرانی (فازهای اول و دوم پروژه ملی پیشگیری فردمحور سرطان) طبقه‌بندی خطر و ثبت موارد. کد طرح: 43017023",
            isBig: false,
            name: "دانشگاه شهید بهشتی"
        },
        {
            img: tehranUni,
            title: "طراحی، تولید و اعتبارسنجی سامانه ریسکسنجی سرطانهای پستان و کولورکتال در جمعیت ایرانی(فازهای اول و دوم پروژه ملی پیشگیری فردمحور سرطان).کد طرح: 1404 - 1 - 107 - 91678",
            isBig: false,
            name: "دانشگاه تهران"
        },
        { img: behdasht, title: "", isBig: false, name: "وزارت بهداشت" },
        { img: mazandaran, title: "", isBig: false, name: "دانشگاه علوم پزشکی مازندران" },
        { img: mohavateBehdashti, title: "", isBig: false, name: "معاونت بهداشت" },
        { img: logoHybrid, title: "", isBig: true, name: "انجمن سرطان های ارثی و فامیلی" },
        { img: pajooheshkadeh, title: "", isBig: true, name: "پژوهشکده ی خون و انکولوژی" }
    ]

    return (
        <div className="image-list">
            <h2>نهاد های همکار</h2>
            <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView="auto"
                loop={true}
                navigation={true}
                className="mySwiper"
            >
                {arrOfIms.map((item, index) => (
                    <SwiperSlide key={index} className={`logo-slide ${item.isBig ? 'big-logo' : ''}`}>
                        {item.isBig ? (
                            <>
                                <div className='teammate hover3'>
                                    <div className="logo-bg" style={{ backgroundImage: `url(${item.img})` }} title={item.title}></div>
                                    <h3>{item.name}</h3>
                                </div>
                            </>
                        ) : (
                            <div className="teammate hover3">
                                <img src={item.img} alt={item.title} title={item.title} />
                                <h3>{item.name}</h3>
                            </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}

export default Slider