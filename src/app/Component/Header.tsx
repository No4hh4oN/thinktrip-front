"use client";
import { useState, useEffect } from "react";
import AxiosClient from "../AxiosClient";
import "../style/Component.css";
import Link from 'next/link';

export default function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [triggerAnimation, setTriggerAnimation] = useState(false);
    // 모바일 / 리스트 토글 다운
    const [showMenu, setShowMenu] = useState(false);

    const [imageUrl, setImageUrl] = useState<string | null>(null);




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

    useEffect(() => {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfileImage();
        }
    }, [isAuthenticated]);

    return (
        <div className="Header">
            <div className="Header-Logo">
                <Link href="/">
                    <span className="Header-Logo-1">T</span>h<span className="Header-Logo-2">!</span>nk<span className="Header-Logo-3">T</span>r<span className="Header-Logo-4">!</span>p
                </Link>
            </div>
            <div className="Header-List">
                <div className="Header-gpt">
                    여행추천
                    <div className="Header-dropdown-content">
                        <Link href="/PlanByAI">
                            <span>GPT에게 추천받는 나의 여행</span>
                        </Link>
                        <Link href="/SelfPlan">
                            <span>직접 계획하는 나의 여행</span>
                        </Link>
                        <Link href="/Tour">
                            <span>TourAPI가 추천하는 여행</span>
                        </Link>
                        <Link href="/MyPlan">
                            <span>저장한 여행 계획</span>
                        </Link>
                    </div>
                </div>
                <div className="Header-diary">
                    다이어리
                    <div className="Header-dropdown-content">
                        <Link href="/Report">
                            <span>여행일기 작성하기</span>
                        </Link>
                        <Link href="/Diary">
                            <span>내 여행일기 보기</span>
                        </Link>
                    </div>
                </div>
                <div className="Header-mypage">
                    <Link href="/Mypage">
                        마이페이지
                    </Link>
                </div>
            </div>
            <div className="Header-Logo-Mobile">
                <Link href="/"><span className="Header-Logo-1">T</span>h<span className="Header-Logo-2">!</span>nk<span className="Header-Logo-3">T</span>r<span className="Header-Logo-4">!</span>p</Link>
            </div>
        </div>
    );
}