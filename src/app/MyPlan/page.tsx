"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import dynamic from "next/dynamic";
import AxiosClient from "../AxiosClient";
import '../style/MyPlan.css';
import Header from "../Component/Header";
import Footer from '../Component/Footer';

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


export default function MyPlan() {
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

    useEffect(() => {
        const items = document.querySelectorAll(".MyPlan-Items");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    } else {
                        entry.target.classList.remove("visible"); // 재등장 시 다시 애니메이션
                    }
                });
            },
            { threshold: 0.2 }
        );

        items.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [plans.length, visibleCount]);


    return (
        <div className="MyPlan">
            <Header />
            <div className="MyPlan-Container">
                <div className="MyPlan-Header">
                    저장된 여행 계획
                </div>
                <div className="MyPlan-List">
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

            <div className="MyPlan-Container-Mobile">
                <img id="subtract" src="/images/Subtract.png" alt="" />
                <div className="MyPlan-Header-Mobile">
                    <span id="pageName">
                        저장된 여행 계획
                    </span>
                    <span>
                        직접 계획하기 어려운 여행은<br />
                        GPT와 함께해요!
                    </span>
                </div>
                <div className="MyPlan-List-Mobile">
                    {loading ? (
                        <p>불러오는 중...</p>
                    ) : plans.length === 0 ? (
                        <p>저장된 계획이 없습니다.</p>
                    ) : (
                        <>
                            <div className="PlanList">
                                {plans.slice(0, visibleCount).map(plan => (
                                    <div key={plan.id} className="MyPlan-Items animate" onClick={() => handleClick(plan.id)}>
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
                <Link href="/SelfPlan" className="postFloating">
                    <img src="/images/posting.png" alt="직접계획" />
                </Link>
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
            <Footer />
        </div>
    )
}