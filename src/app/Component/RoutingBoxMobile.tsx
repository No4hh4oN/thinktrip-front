"use client";
import AxiosClient from "../AxiosClient";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // ✅ 추가
import '../style/RoutingBoxMobile.css';

export default function RoutingBoxMobile() {
    const pathname = usePathname(); // ✅ 현재 경로 확인

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
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
        <div className="RoutingBox">
            <div className={`Mainpage-Button ${pathname === "/" ? "active" : ""}`}>
                <Link href="/">
                    <img id="home" src="/images/home.png" alt="홈 버튼" />
                </Link>
            </div>
            <div className={`PlanByAI-Button ${pathname === "/PlanByAI" ? "active" : ""}`}>
                <Link href="/PlanByAI">
                    <img id="gptPlan" src="/images/calendar.png" alt="계획하기 버튼" />
                </Link>
            </div>
            <div className={`SelfPlan-Button ${pathname === "/SelfPlan" ? "active" : ""}`}>
                <Link href="/SelfPlan">
                    <img id="selfPlan" src="/images/calendar2.png" alt="직접계획하기 버튼" />
                </Link>
            </div>
            <div className={`Diary-Button ${pathname === "/Diary" ? "active" : ""}`}>
                <Link href="/Diary">
                    <img id="diary" src="/images/book.png" alt="다이어리 버튼" />
                </Link>
            </div>
            <div className={`Mypage-Button ${pathname === "/Mypage" ? "active" : ""}`}>
                <Link href="/Mypage">
                    <img
                        className="ProfileImg-Mobile"
                        src={imageUrl || "/images/profile.webp"}
                        alt=""
                    />
                </Link>
            </div>
        </div>
    );
}
