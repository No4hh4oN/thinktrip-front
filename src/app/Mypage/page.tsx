"use client";

import { useState, useEffect, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import AxiosClient from "../AxiosClient";
import '../style/Mypage.css';
import '../style/MyPlan.css';
import '../style/Diary.css';
import Header from "../Component/Header";
import Footer from '../Component/Footer';


interface FormState {
    userId: string;
    password: string;
    userName?: string;
    nickname?: string;
    userEmail?: string;
    address?: string;
}

interface userState {
    name: String;
    nickname: string;
    userId: string;
    is_premium: Boolean;
}


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

const ToastViewer = dynamic(() => import("@toast-ui/react-editor").then(mod => mod.Viewer), {
    ssr: false,
});

interface Plan {
    id: number;
    title: String;
    content: string;
    startDate: string;
    endDate: string;
    isGenerated: boolean;
    createdAt: Date;
}

export default function Mypage() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // 임시로 true로 설정
    const [form, setForm] = useState<FormState>({
        userId: "",
        password: "",
        userName: "",
        nickname: "",
        address: "",
    });

    const [userInfo, setUserInfo] = useState<userState>({
        name: "",
        nickname: "",
        userId: "",
        is_premium: false,
    });

    useEffect(() => {
        if (isAuthenticated) {
            handleUserProfile();

            checkGptUsage().then((remaining) => {
                setGptUsage(remaining);
            });
        }
    }, [isAuthenticated]);


    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleUserProfile = async () => {
        try {
            const response = await AxiosClient.get<{
                name: string;
                nickname: string;
                email: string;
                profileImage: string;
                is_premium: Boolean;
            }>("/users/me");

            const userInfo = response.data;

            setUserInfo({
                name: userInfo.name,
                nickname: userInfo.nickname,
                userId: userInfo.email,
                is_premium: userInfo.is_premium,
            });

            if (isAuthenticated) {
                fetchProfileImage();
            }
        } catch (error) {
            console.error("유저 정보 불러오기 실패", error);
        }
    };

    const fetchProfileImage = async () => {
        try {
            const response = await AxiosClient.get("/users/profile-image", {
                responseType: "blob",
            });

            const url = URL.createObjectURL(response.data);
            setImageUrl(url);
        } catch (error) {
            console.error("프로필 이미지 로딩 실패");
        }
    };

    const handleProfileImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            await AxiosClient.post("/users/profile-image", formData);
            alert("프로필 이미지가 업로드되었습니다.");
            handleUserProfile();
        } catch (err: any) {
            console.error("업로드 실패");
            alert("이미지 업로드에 실패했습니다.");
        }
    };
    // 로그인 됐는지 체크하는 기능
    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);
    useEffect(() => {
        handleUserProfile();
    }, []);

    // Gpt 사용량 조회
    const [GptUsage, setGptUsage] = useState<number | null>(null);

    const checkGptUsage = async () => {
        try {
            const response = await AxiosClient.get("users/gpt/usage");
            return response.data.remainingCalls;
        } catch (error) {
            console.error("GPT 사용 횟수 조회 실패");
            return 0;
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("정말 탈퇴하시겠습니까? 탈퇴 후 복구할 수 없습니다.");
        if (!confirmed) return;

        try {
            await AxiosClient.delete("/users/me", { withCredentials: true });

            alert("회원 탈퇴가 완료되었습니다.");
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");

            window.location.href = "/"; // 메인 페이지로 리다이렉트
        } catch (error) {
            console.error("회원 탈퇴 실패", error);
            alert("회원 탈퇴 중 오류가 발생했습니다.");
        }
    };

    //여행계획 리스트 형식, 항목 선택시 해당 id에 대해 상세 조회
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const [userRes, gptRes] = await Promise.all([
                    AxiosClient.get("/travel-plans/user"),
                    AxiosClient.get("/travel-plans/gpt")
                ]);

                const userPlans = userRes.data.map((plan: any) => ({
                    ...plan,
                    isGenerated: false,
                }));

                const gptPlans = gptRes.data.map((plan: any) => ({
                    ...plan,
                    isGenerated: true,
                    title: "GPT 추천 여행",
                }));

                const merged = [...userPlans, ...gptPlans];
                const sorted = merged.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setPlans(sorted);
            } catch (error) {
                console.error("계획 목록 불러오기 실패");
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handleClick = async (planId: number) => {
        try {
            const res = await AxiosClient.get(`/travel-plans/${planId}`);
            setSelectedPlan(res.data);
            setShowModal(true);

            if (res.data.isGenerated === true) {
                title: "GPT 추천 여행"
            }
        } catch (e) {
            console.error("상세 조회 실패", e);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedPlan(null);
    };

    //다이어리 리스트 형식, 항목 선택시 해당 id에 대해 상세 조회

    const [list, setList] = useState<DiaryResponse[]>([]);
    const [selected, setSelected] = useState<DiaryResponse | null>(null);

    const [detailLoading, setDetailLoading] = useState(false);
    const [loadingData, setLoadingData] = useState<any>(null);

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

    const [showDiaryModal, setShowDiaryModal] = useState(false);

    const handleSelectMobile = async (item: DiaryResponse) => {
        setShowDiaryModal(true);
        setDetailLoading(true);
        try {
            const res = await AxiosClient.get(`/diaries/${item.id}`);
            setSelected(res.data); // API 응답이 DiaryResponse 단일 객체라고 가정
        } catch (e: any) {
            alert("다이어리 상세 조회 실패: " + (e.response?.data?.message || e.message));
        }
        setDetailLoading(false);
    };

    const closeDiaryModal = () => {
        setShowDiaryModal(false);
    };

    return (
        <div className="Mypage">
            <Header />
            <div className="Mypage-Container">
                <div className="Mypage-Header">마이페이지</div>
                <div className="Mypage-BodyContainer">
                    <div className="Mypage-Body-top">
                        <div className="Mypage-User">
                            <div className="Mypage-ProfileImg-Container">
                                <label htmlFor="profile-upload" style={{ cursor: 'pointer' }}>
                                    <img
                                        className="Mypage-ProfileImg"
                                        src={imageUrl || "/images/profile.webp"}
                                        alt="프로필 이미지"
                                    />
                                </label>
                                <input
                                    id="profile-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleProfileImageUpload}
                                />
                            </div>
                            <div>이름 : {userInfo.name}</div>
                            <div>닉네임: {userInfo.nickname}</div>
                            <div>이메일(ID): {userInfo.userId}</div>
                            <div>프리미엄: {userInfo.is_premium ? "✅ 사용 중" : "❌ 미사용"}</div>
                            <div className="MainScreen-UserDetailInfo-AI">
                                <span className="MainScreen-UserDetailInfo-AI-label">AI 사용가능 횟수</span>
                                <span className="MainScreen-UserDetailInfo-AI-data"><span>{GptUsage}</span> / 5</span>
                            </div>

                            <button onClick={handleDeleteAccount} className="Mypage-DeleteBtn">
                                회원 탈퇴하기
                            </button>
                        </div>
                        <div className="MyPage-Plans">
                            {loading ? (
                                <p>불러오는 중...</p>
                            ) : plans.length === 0 ? (
                                <p>저장된 계획이 없습니다.</p>
                            ) : (
                                <>
                                    <div className="PlanList">
                                        {plans.slice(0, visibleCount).map(plan => (
                                            <div key={plan.id} className="MyPlan-Items" onClick={() => handleClick(plan.id)}>
                                                <span className="MyPlan-Items-Title">{plan.title}</span>
                                                <span className="MyPlan-Item-Dates">{plan.startDate} ~ {plan.endDate}</span>
                                                <div className="MyPlan-Items-Content">{plan.content.slice(0, 50)}...</div>
                                            </div>
                                        ))}
                                    </div>
                                    {visibleCount < plans.length && (
                                        <div className="ShowMoreWrapper">
                                            <button className="ShowMoreButton" onClick={() => setVisibleCount(prev => prev + 6)}>더보기</button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                        {showModal && selectedPlan && (
                            <div className="ModalOverlay" onClick={closeModal}>
                                <div className="ModalContent" onClick={e => e.stopPropagation()}>
                                    <span className="MyPlan-Items-Title">{selectedPlan.title ? selectedPlan.title : "어느 한 여행 계획"}</span>
                                    <span className="MyPlan-Item-Dates">{selectedPlan.startDate} ~ {selectedPlan.endDate}</span>
                                    <div className="ViewerWrapper">
                                        <ToastViewer initialValue={selectedPlan.content} />
                                    </div>
                                    <button className="closeModal" onClick={closeModal}>닫기</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="Mypage-Body-bottom">
                        {/* 다이어리 */}
                        {list.length === 0 && <div>작성한 다이어리가 없습니다.</div>}
                            {list.map((item) => (
                                <div
                                    key={item.id}
                                    className={`Diary-List-Item${selected?.id === item.id ? " active" : ""}`}
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
                            {showDiaryModal && selected && (
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
                            <button className="closeDiaryModal" onClick={closeDiaryModal}>닫기</button>
                        </div>
                    </div>
                )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
