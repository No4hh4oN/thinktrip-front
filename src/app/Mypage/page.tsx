"use client";

import { useState, useEffect, ChangeEvent } from "react";
import dynamic from "next/dynamic";
import AxiosClient from "../AxiosClient";
import '../style/Mypage.css';
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

            if(res.data.isGenerated === true){
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
                    </div>
                    <div className="Mypage-Body-bottom">
                        {/* 다이어리 */}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
