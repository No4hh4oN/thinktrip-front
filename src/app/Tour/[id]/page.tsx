"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import "../../style/Tour.css";
import Header from "@/app/Component/Header";
import Footer from "@/app/Component/Footer";
import Lottie from "lottie-react";

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function FestivalDetail() {
  const { id } = useParams();

  const [festival, setFestival] = useState<any>(null);

  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [showProgram, setShowProgram] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [slidesLoaded, setSlidesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  
  useEffect(() => {
    const fetchDetailData = async () => {
      setIsLoading(true);
      const serviceKey = process.env.NEXT_PUBLIC_FESTIVAL_API_KEY;
      const baseUrl = "https://apis.data.go.kr/B551011/KorService1";

      //행사 개요
      const detailUrl = `${baseUrl}/detailCommon1?serviceKey=${serviceKey}&MobileOS=ETC&MobileApp=MyApp&_type=json&contentId=${id}&defaultYN=Y&overviewYN=Y&firstImageYN=Y&addrinfoYN=Y`;
      //행사 정보
      const introUrl = `${baseUrl}/detailIntro1?serviceKey=${serviceKey}&MobileOS=ETC&MobileApp=MyApp&_type=json&contentId=${id}&contentTypeId=15`;
      //행사 이미지
      const imageUrl = `${baseUrl}/detailImage1?serviceKey=${serviceKey}&MobileOS=ETC&MobileApp=MyApp&_type=json&contentId=${id}&imageYN=Y&subImageYN=Y`;

      try {
        const detailRes = await fetch(detailUrl);
        const detailData = await detailRes.json();
        const detailItem = detailData.response.body.items.item[0];

        const introRes = await fetch(introUrl);
        const introData = await introRes.json();
        const introItem = introData.response.body.items.item[0];

        const imageRes = await fetch(imageUrl);
        const imageData = await imageRes.json();
        const images = imageData.response.body.items.item;

        //배열 형태로 통일
        const allImages = Array.isArray(images)
          ? images //이미 배열이면 그대로 사용
          : images
            ? [images] // 객체 한 개면 배열로 감싸줌
            : []; // 값이 없으면 빈 배열

        //포스터 이미지 찾기
        //imgname에 포스터가 포함되어 있으면 저장
        const posterObj = allImages.find(
          (img) => img.imgname && img.imgname.includes("포스터")
        );

        const poster =
          posterObj?.originimgurl ||
          detailItem.firstimage ||
          allImages[0]?.originimgurl ||
          null;

        // 포스터 제외한 이미지들은 슬라이드 형식으로 넣게 따로 빼두기
        const slideImage = allImages
          .filter((img) => img.originimgurl !== poster)
          .map((img) => img.originimgurl);

        setFestival({ ...detailItem, ...introItem });
        setPosterImage(poster);
        setSlideImages(slideImage);
      } catch (error) {
        console.error("API 오류", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailData();
  }, [id]);

  const formatDate = (str?: string) => {
    if (!str || str.length !== 8) return "-";
    return `${str.slice(0, 4)}.${str.slice(4, 6)}.${str.slice(6, 8)}`;
  };

  const getDday = (dateStr: string) => {
    const today = new Date();
    const eventDate = new Date(
      `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
    );
    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const dDay =
    festival?.eventstartdate && festival.eventstartdate.length === 8
      ? getDday(festival.eventstartdate)
      : null;

  return (
    <div className="Tour">
      <Header />
      <div className="festival-detail-container">
        {isLoading ? (

          <div className="festival-detail-wrapper">데이터를 불러오는 중</div>
        ) : !festival ? (
          <div className="festival-detail-wrapper">데이터를 불러오지 못했습니다.</div>
        ) : (
          <div className="festival-detail-wrapper">
            {/*축제 상세 페이지 상단*/}
            <div className="festival-detail">
              <div className="festival-header-block">
                <div className="festival-title">{festival.title}</div>
                <div className="festival-meta">
                  <span className="festival-meta-Dday">
                    {dDay === null
                      ? "-"
                      : dDay > 0
                        ? `D-${dDay}`
                        : festival.eventenddate &&
                          new Date() <=
                          new Date(
                            `${festival.eventenddate.slice(
                              0,
                              4
                            )}-${festival.eventenddate.slice(
                              4,
                              6
                            )}-${festival.eventenddate.slice(6, 8)}`
                          )
                          ? "진행 중"
                          : "종료됨"}
                  </span>
                </div>

                <div className="festival-dates">
                  {formatDate(festival.eventstartdate)} ~{" "}
                  {formatDate(festival.eventenddate)}
                </div>

              </div>

              {/*축제 개요 정리*/}
              <div className="festival-description">
                {posterImage ? (
                  <div className="poster-area">
                    <img src={posterImage} alt="포스터 이미지" loading="lazy" />
                  </div>
                ) : (
                  <div className="poster-area">
                    포스터 이미지가 없습니다.
                  </div>
                )
              
              }

                <div className="overview-text">
                  <span className="festival-description-header">축제 개요</span>
                  {festival.overview}

                  <div className="festival-info-list">
                    <div>
                      <span id="festival-info-place">장소</span> {festival.addr1}
                    </div>
                    <div>
                      <span id="festival-info-fee">요금</span>{" "}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: festival.usetimefestival.replace(
                            /\\u003cbr\\u003e/g,
                            "<br>"
                          ),
                        }}
                      />
                    </div>
                    <div>
                      <span id="festival-info-sponser">주최</span> {festival.sponsor1 || "정보 없음"}
                    </div>
                    <div>
                      <span id="festival-info-tel">전화번호</span>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: festival.tel.replace(/\\u003cbr\\u003e/g, "<br>"),
                        }}
                      />
                    </div>
                    {festival.homepage && (
                      <a
                        className="homepage-btn"
                        href={festival.homepage.replace(/(<([^>]+)>)/gi, "")}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        공식 홈페이지 바로가기🌐
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/*축제 상세 페이지 하단*/}
            {slideImages.length > 0 && (
              <div className="festival-info-section">
                <div className="festival-image-slider-header">
                  축제 관련 이미지
                </div>
                <Swiper
                  spaceBetween={10}
                  slidesPerView={2.4}
                  centeredSlides={false}
                  loop={false}
                >
                  {slideImages.map((url, idx) => (
                    <SwiperSlide key={idx}>
                      <img src={url} alt={`축제 이미지 ${idx + 1}`} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>
        )}
      </div>
      {/* <div className="festival-detail-container-Mobile">

      </div> */}
      <Footer />
    </div>
  );
}