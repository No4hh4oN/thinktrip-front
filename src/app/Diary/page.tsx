"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import dynamic from "next/dynamic";
import AxiosClient from "../AxiosClient";
import Header from "../Component/Header";
import '../style/Diary.css'
import "../style/Component.css";
import Footer from "../Component/Footer";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";


const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
const ToastViewer = dynamic(
    () => import("@toast-ui/react-editor").then(mod => mod.Viewer),
    { ssr: false }
);

type DiaryResponse = {
    id: number;
    title: string;
    content: string;
    startDate: string;
    endDate: string;
    travelPlanId: number;
    userId: number;
    imageUrls: string[];
    createdAt: string;
    updatedAt: string;
};

export default function Diary() {
    const [list, setList] = useState<DiaryResponse[]>([]);
    const [selected, setSelected] = useState<DiaryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [loadingData, setLoadingData] = useState<any>(null);
    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        fetch("/lottie/Loading.json")
            .then((res) => res.json())
            .then((data) => setLoadingData(data));
    }, []);


    useEffect(() => {
        (async () => {
            try {
                const res = await AxiosClient.get("/diaries");
                setList(res.data);
            } catch (e: any) {
                alert("다이어리 목록 조회 실패: " + (e.response?.data?.message || e.message));
            }
            setLoading(false);
        })();
    }, []);

    // 리스트 아이템 클릭 → 상세조회
    const handleSelect = async (item: DiaryResponse) => {
        setDetailLoading(true);
        try {
            const res = await AxiosClient.get(`/diaries/${item.id}`);
            setSelected(res.data); // API 응답이 DiaryResponse 단일 객체라고 가정
        } catch (e: any) {
            alert("다이어리 상세 조회 실패: " + (e.response?.data?.message || e.message));
        }
        setDetailLoading(false);
    };



    const [showModal, setShowModal] = useState(false);

    const handleSelectMobile = async (item: DiaryResponse) => {
        setShowModal(true);
        setDetailLoading(true);
        try {
            const res = await AxiosClient.get(`/diaries/${item.id}`);
            setSelected(res.data); // API 응답이 DiaryResponse 단일 객체라고 가정
        } catch (e: any) {
            alert("다이어리 상세 조회 실패: " + (e.response?.data?.message || e.message));
        }
        setDetailLoading(false);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
  const items = document.querySelectorAll(".Diary-List-Item");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}, [list.length, visibleCount]);

    return (
        <div className="Diary">
            <Header />
            <div className="Diary-Container">
                <div className="Diary-Header">다이어리</div>
                {loading ? (
                    <Lottie
                        animationData={loadingData}
                        loop
                        autoplay
                        style={{ width: 200, height: 240 }}
                    />
                ) : (
                    <div className="Diary-ContentsBox">
                        <div className="Diary-List">
                            <div className="Diary-List-Header">
                                글 목록
                            </div>
                            {list.length === 0 && <div>작성한 다이어리가 없습니다.</div>}
                            {list.slice(0, visibleCount).map((item) => (
                                <div
                                    key={item.id}
                                    className={`Diary-List-Item animate${selected?.id === item.id ? " active" : ""}`}
                                    onClick={() => handleSelect(item)}
                                    style={{
                                        cursor: "pointer",
                                        padding: "8px 0",
                                        borderBottom: "1px solid #eee",
                                        fontWeight: selected?.id === item.id ? "bold" : undefined,
                                    }}
                                >
                                    <div className="DiaryList-L_Info">
                                        <span id="listTitle">{item.title}</span>
                                        <span id="listDate">{item.startDate} ~ {item.endDate}</span>
                                    </div>
                                    <div className="DiaryList-R_Info">
                                        <span id="listCreated">{item.createdAt?.slice(0, 16).replace("T", " ")}</span>
                                    </div>
                                </div>
                            ))}
                            {visibleCount < list.length && (
                                <div className="ShowMoreWrapper">
                                    <button className="ShowMoreButton" onClick={() => setVisibleCount(prev => prev + 6)}>
                                        더보기
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="Diary-Content">
                            {detailLoading ? (
                                <div className="LoadingBox">
                                    <Lottie
                                        animationData={loadingData}
                                        loop
                                        autoplay
                                        style={{ width: 200, height: 240 }}
                                    />
                                </div>
                            ) : selected ? (
                                <>
                                    <div className="Diary-Contents-Header">
                                        <span id="Diary-Title">{selected.title}</span>
                                        <div className="Diary-Contents-DateBox">
                                            <div className="Diary-Contents-StartEnd">
                                                <span>여행 기간 : </span>
                                                <span>{selected.startDate} ~ {selected.endDate}</span>
                                            </div>
                                            <div className="Diary-Contents-Created">
                                                <span id="Diary-Created-label">작성일 : </span>
                                                <span>{selected.createdAt?.slice(0, 16).replace("T", " ")}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="Diary-Contents-Body">
                                        {selected.imageUrls && selected.imageUrls.length > 0 && (
                                            <div style={{ display: "flex", gap: 8 }}>
                                                {selected.imageUrls.map((url, i) => (
                                                    <img
                                                        key={i}
                                                        src={url.startsWith("/") ? "https://thinktrip.it.com" + url : url}
                                                        alt={`다이어리 이미지 ${i + 1}`}
                                                        style={{ maxHeight: 120, borderRadius: 8 }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <ToastViewer initialValue={selected.content} />
                                    </div>
                                </>
                            ) : (
                                <div className="Diary-Content-Announce">
                                    <img src="/images/scope.webp" alt="상세조회" />
                                    <span>다이어리 상세조회</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="Diary-Container-Mobile">
                <img id="subtract" src="/images/Subtract.png" alt="" />
                <div className="Diary-Header">
                    <span id="pageName">
                        다이어리
                    </span>
                    <span>여행의 소중한 순간들을 기록해봐요!</span>
                </div>
                <div className="Diary-List">
                    <div className="Diary-List-Header">
                        글 목록
                    </div>
                    {list.length === 0 && <div>작성한 다이어리가 없습니다.</div>}
                    {list.slice(0, visibleCount).map((item) => (
                        <div
                            key={item.id}
                            className={`Diary-List-Item animate${selected?.id === item.id ? " active" : ""}`}
                            onClick={() => handleSelectMobile(item)}
                            style={{
                                cursor: "pointer",
                                padding: "8px 0",
                                borderBottom: "1px solid #eee",
                                fontWeight: selected?.id === item.id ? "bold" : undefined,
                            }}
                        >
                            <div className="DiaryList-L_Info">
                                <span id="listTitle">{item.title}</span>
                                <span id="listDate">{item.startDate} ~ {item.endDate}</span>
                            </div>
                            <div className="DiaryList-R_Info">
                                <span id="listCreated">{item.createdAt?.slice(0, 16).replace("T", " ")}</span>
                            </div>
                        </div>
                    ))}
                    {visibleCount < list.length && (
                        <div className="ShowMoreWrapper">
                            <button className="ShowMoreButton" onClick={() => setVisibleCount(prev => prev + 6)}>
                                더보기
                            </button>
                        </div>
                    )}
                    <Link href="/Report" className="postFloating">
                        <img src="/images/posting.png" alt="" />
                    </Link>
                </div>
                {showModal && selected && (
                    <div className="ModalOverlay" onClick={closeModal}>
                        <div className="ModalContent" onClick={e => e.stopPropagation()}>
                            <div className="Diary-Contents-Header">
                                <span id="Diary-Title">{selected.title}</span>
                                <div className="Diary-Contents-DateBox">
                                    <div className="Diary-Contents-StartEnd">
                                        <span>여행 기간 : </span>
                                        <span>{selected.startDate} ~ {selected.endDate}</span>
                                    </div>
                                    <div className="Diary-Contents-Created">
                                        <span id="Diary-Created-label">작성일 : </span>
                                        <span>{selected.createdAt?.slice(0, 16).replace("T", " ")}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="Diary-Contents-Body">
                                {selected.imageUrls && selected.imageUrls.length > 0 && (
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {selected.imageUrls.map((url, i) => (
                                            <img
                                                key={i}
                                                src={url.startsWith("/") ? "https://thinktrip.it.com" + url : url}
                                                alt={`다이어리 이미지 ${i + 1}`}
                                                style={{ maxHeight: 120, borderRadius: 8 }}
                                            />
                                        ))}
                                    </div>
                                )}
                                <ToastViewer initialValue={selected.content} />
                            </div>
                            <button className="closeModal" onClick={closeModal}>닫기</button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
