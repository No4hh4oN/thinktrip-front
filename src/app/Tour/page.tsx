"use client";

import { useEffect, useState } from "react";
import FestivalCard from "./components/FestivalCard";
import TourPagination from "./components/TourPagination";
import TourSearchBar from "./components/TourSearchBar";
import "../style/Tour.css";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import Lottie from "lottie-react";

type FestivalItem = {
  contentid: string;
  title: string;
  firstimage: string;
  eventstartdate: string;
  eventenddate: string;
  addr1: string;
};

export default function Tour() {
  const [festivals, setFestivals] = useState<FestivalItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const [loadingData, setLoadingData] = useState<any>(null);

  const [hasFetched, setHasFetched] = useState(false);

  const pageSize = 12;

  const fetchFestivals = async (page: number) => {
    setIsLoading(true);
    const serviceKey = process.env.NEXT_PUBLIC_FESTIVAL_API_KEY;
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    const url = `http://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=${serviceKey}&MobileOS=ETC&MobileApp=MyApp&_type=json&numOfRows=${pageSize}&pageNo=${page}&listYN=Y&arrange=A&eventStartDate=${today}`;

    const response = await fetch(url);
    const data = await response.json();
    const items = data.response.body.items.item;
    const totalCount = data.response.body.totalCount;

    setFestivals(items || []);
    setTotalResults(totalCount || 0);
    setIsLoading(false);
    setHasFetched(true);
  };

  const fetchSearchResults = async (keyword: string, page: number) => {
    setIsLoading(true);
    const serviceKey = process.env.NEXT_PUBLIC_FESTIVAL_API_KEY;

    const url = `http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${serviceKey}&MobileOS=ETC&MobileApp=MyApp&_type=json&keyword=${encodeURIComponent(
      keyword
    )}&numOfRows=${pageSize}&pageNo=${page}&contentTypeId=15`;

    const response = await fetch(url);
    const data = await response.json();
    const items = data.response.body.items.item;
    const totalCount = data.response.body.totalCount;

    setFestivals(items || []);
    setTotalResults(totalCount || 0);
    setIsLoading(false);
    setHasFetched(true);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    setCurrentPage(1);
    await fetchSearchResults(keyword, 1);
  };

  const handleReset = async () => {
    setIsSearching(false);
    setKeyword("");
    setCurrentPage(1);
    await fetchFestivals(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (isSearching) {
      fetchSearchResults(keyword, currentPage);
    } else {
      fetchFestivals(currentPage);
    }
  }, [currentPage]);

  return (
    <div className="Tour">
      <Header />
      <div className="TourContainer">
        <div className="search">
          <div className="Tour-Title">
            TourAPI4.0에서 제공하는 축제정보
          </div>
          <TourSearchBar
            keyword={keyword}
            setKeyword={setKeyword}
            onSearch={handleSearch}
            onReset={handleReset}
            isSearching={isSearching}
          />
        </div>

        <div className="festival-grid">
          {isLoading ? (
            <div className="empty-message">
              데이터를 불러오는중
            </div>
          ) : hasFetched && festivals.length === 0 ? (
            <div className="empty-message">검색 결과가 없습니다.</div>
          ) : (
            festivals.map((item) => (
              <FestivalCard
                contentId={item.contentid}
                key={item.contentid}
                image={item.firstimage}
                title={item.title}
                startDate={item.eventstartdate}
                endDate={item.eventenddate}
                location={`${item.addr1 || ""}`}
              />
            ))
          )}
        </div>

        <div className="page">
          <TourPagination
            currentPage={currentPage}
            totalResults={totalResults}
            pageSize={pageSize}
            groupSize={5}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
