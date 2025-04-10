"use client";

import { useState, useEffect } from "react";
import "../style/Component.css";

interface Slide {
    image: string;
    text: string;
    target: string;
}

export default function AdSlide() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [animate, setAnimate] = useState<boolean>(true);

    useEffect(() => {
        const fetchFestivalData = async () => {
            const serviceKey = process.env.NEXT_PUBLIC_FESTIVAL_API_KEY;

            const baseURL = "https://cors-anywhere.herokuapp.com/http://apis.data.go.kr/B551011/KorService1";
            const today = new Date();
            const yyyyMMdd = today.toISOString().slice(0, 10).replace(/-/g, '');
            const listUrl = `${baseURL}/searchFestival1?serviceKey=${serviceKey}&MobileOS=ETC&MobileApp=MyApp&_type=json&numOfRows=7&pageNo=1&eventStartDate=${yyyyMMdd}`;

            try {
                const res = await fetch(listUrl);
                const json = await res.json();
                const items = json.response.body.items.item;

                const detailPromises = items.map((item: any) =>
                    fetch(`${baseURL}/detailCommon1?serviceKey=${serviceKey}&MobileOS=ETC&MobileApp=MyApp&_type=json&contentId=${item.contentid}&contentTypeId=${item.contenttypeid || 15}&defaultYN=Y&firstImageYN=Y&overviewYN=Y`)
                        .then(res => res.json())
                        .then(detail => detail.response.body.items.item[0])
                );

                const detailedSlides = await Promise.all(detailPromises);

                const formattedSlides: Slide[] = detailedSlides
                    .filter(Boolean)
                    .map((item: any) => ({
                        image: item.firstimage || "/default.jpg",
                        text: item.title,
                        target: `https://korean.visitkorea.or.kr/kor/tt/pr_lod_view.jsp?cid=${item.contentid}`,
                    }));

                setSlides(formattedSlides);
            } catch (e) {
                console.error("축제 정보 불러오기 실패");
            }
        };

        fetchFestivalData();
    }, []);

    const onStop = () => setAnimate(false);
    const onRun = () => setAnimate(true);

    return (
        <div className="AdSlide">
            <div className="AdSlide_Header"><span>TourAPI4.0</span>에서 제공하는 축제 정보🎉</div>
            <div className="slide_container">
                <ul className="slide_wrapper" onMouseEnter={onStop} onMouseLeave={onRun}>
                    {["original", "clone"].map((type, idx) => (
                        <div key={idx} className={`slide ${type}${animate ? "" : " stop"}`}>
                            {slides.map((s, i) => (
                                <li key={`${type}-${i}`} className={i % 2 === 0 ? "big" : "small"}>
                                    <a href={s.target} target="_blank" rel="noopener noreferrer">
                                        <div className="item">
                                            <img className="item-img" src={s.image} alt="" />
                                            <div className="slide-text">{s.text}</div>
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </div>
                    ))}
                </ul>
            </div>
            <img className="flower1" src="images/바람개비.png" alt="f1" />
            <img className="flower2" src="images/바람개비.png" alt="f2" />
        </div>
    );
}
