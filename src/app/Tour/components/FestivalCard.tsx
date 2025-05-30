"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type FestivalCardProps = {
  contentId: string;
  image: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
};

const FestivalCard = ({
  contentId,
  image,
  title,
  startDate,
  endDate,
  location,
}: FestivalCardProps) => {
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${year}.${month}.${day}`;
  };

  useEffect(() => {
    const container = titleContainerRef.current;
    const text = titleTextRef.current;
    if (!container || !text) return;

    const containerWidth = container.offsetWidth;
    const textWidth = text.scrollWidth;

    if (textWidth > containerWidth) {
      text.classList.add("scroll-animation");
    } else {
      text.classList.remove("scroll-animation");
      text.style.paddingLeft = "0"; // 혹시 잔여 스타일 남아있을 경우 강제 제거
    }
  }, [title]);

  return (
    <Link href={`/Tour/${contentId}`}>
      <div className="festival-card">
        <div className="image-container">
          {image ? (
            <img src={image} alt={title} className="festival-image" />
          ) : null}
        </div>
        <div className="festival-info">
          <div className="festival-title" ref={titleContainerRef}>
            <span id="festival-title-span" ref={titleTextRef}>
              {title}
            </span>
          </div>
          <p className="festival-date">
            {formatDate(startDate)} ~ {formatDate(endDate)}
          </p>
          <p className="festival-location">{location}</p>
        </div>
      </div>
    </Link>
  );
};

export default FestivalCard;
