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

    const [pageNo, setPageNo] = useState(1);
    const [maxPage, setMaxPage] = useState<number>(1);
    const numOfRows: number = 7;
    const onStop = () => setAnimate(false);
    const onRun = () => setAnimate(true);

    const goPrev = (): void => {
        setPageNo(prev => (prev === 1 ? maxPage : prev - 1));
    };

    const goNext = (): void => {
        setPageNo(prev => (prev === maxPage ? 1 : prev + 1));
    };

    useEffect(() => {
        const fetchFestivalData = async () => {
            const serviceKey = process.env.NEXT_PUBLIC_FESTIVAL_API_KEY;

            const baseURL = "https://apis.data.go.kr/B551011/KorService1";
            const today = new Date();
            const yyyyMMdd = today.toISOString().slice(0, 10).replace(/-/g, '');
            const listUrl = `${baseURL}/searchFestival1?serviceKey=${serviceKey}&MobileOS=ETC&MobileApp=MyApp&_type=json&numOfRows=${numOfRows}&pageNo=${pageNo}&eventStartDate=${yyyyMMdd}`;

            try {
                const res = await fetch(listUrl);
                const json = await res.json();
                const items = json.response.body.items.item;

                const totalCount = json.response.body.totalCount || 0;
                setMaxPage(Math.ceil(totalCount / numOfRows));

                const detailPromises = items.map((item: any) =>
                    fetch(`${baseURL}/detailCommon1?serviceKey=${serviceKey}&MobileOS=ETC&MobileApp=MyApp&_type=json&contentId=${item.contentid}&contentTypeId=${item.contenttypeid || 15}&defaultYN=Y&firstImageYN=Y&overviewYN=Y`)
                        .then(res => res.json())
                        .then(detail => detail.response.body.items.item[0])
                );

                const detailedSlides = await Promise.all(detailPromises);

                const formattedSlides: Slide[] = detailedSlides
                    .filter(Boolean)
                    .map((item: any) => {
                        const imageUrl = item.firstimage || "/default.jpg";
                        const secureImage = imageUrl.startsWith("http://")
                            ? imageUrl.replace("http://", "https://")
                            : imageUrl;

                        return {
                            image: secureImage,
                            text: item.title,
                            target: `https://korean.visitkorea.or.kr/kor/tt/pr_lod_view.jsp?cid=${item.contentid}`,
                        };
                    });

                setSlides(formattedSlides);
            } catch (e) {
                console.error("축제 정보 불러오기 실패");
            }
        };

        fetchFestivalData();
    }, [pageNo]);



    return (
        <div className="AdSlide">
            <div className="AdSlide_Header">
                <div><span>TourAPI4.0</span>에서 제공하는 축제 정보🎉</div>
                <div className="Adslide_controls">
                    <span id="Adslide_paging">{pageNo} / {maxPage}</span>
                    <button onClick={goPrev} className="slide-btn">◀ 이전</button>
                    <button onClick={goNext} className="slide-btn">다음 ▶</button>
                </div>
            </div>

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
