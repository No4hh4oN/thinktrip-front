"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import AxiosClient from "./AxiosClient";
import "./style/Mainpage.css";
import About from './Component/About';
import Footer from './Component/Footer';

declare global {
    interface Window {
        daum: any;
    }
}

interface FormState {
    userId: string;
    password: string;
    userName?: string;
    userEmail?: string;
    address?: string;
}
export default function Home() {

    const [form, setForm] = useState<FormState>({
        userId: "",
        password: "",
        userName: "",
        address: "",
    });


    const [pwCheck, setPwCheck] = useState("");
    const [step, setStep] = useState<number>(1);

    const [isLogin, setIsLogin] = useState<boolean>(true);
    const router = useRouter(); // 라우터 사용

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };


    const handleLogin = async () => {
        try {
            const response = await AxiosClient.post<{ message: string }>("/login", {
                userId: form.userId,
                password: form.password,
            });
            alert("로그인 성공: " + response.data.message);
        } catch (error) {
            console.error("로그인 실패", error);
            alert("로그인 실패");
        }
    };

    const handleRegister = async () => {
        try {
            const response = await AxiosClient.post<{ message: string }>("/register", {
                userId: form.userId,
                password: form.password,
                userName: form.userName,
                address: form.address,
            });
            alert("회원가입 성공: " + response.data.message);
            setIsLogin(true);
        } catch (error) {
            console.error("회원가입 실패", error);
            alert("회원가입 실패");
        }
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function (data: any) {
                setForm(prev => ({ ...prev, address: data.address }));
            },
        }).open();
    };
    return (
        <div className="MainScreen">
            <div className="MainScreen-Container">
                <div className="MainScreen-Header">
                    <div className="MainScreen-Header-Logo">Th<span>!</span>nkTrip</div>
                    <div className="MainScreen-Header-List">
                        <div className="MainScreen-Header-gpt">여행추천</div>
                        <div className="MainScreen-Header-diary">다이어리</div>
                        <div className="MainScreen-Header-mypage">마이페이지</div>
                    </div>
                </div>
                <div className="MainScreen-Box">
                    {isLogin ? (
                        <div className="MainScreen-LoginBox">
                            <img className="paperPlane" src="/images/paperPlane.png" alt="" width={171} height={181} />
                            <div className="MainScreen-Login">로그인</div>
                            <form className="MainScreen-Form">
                                <input className="idInput" type="text" name="userId" placeholder="이메일" onChange={handleChange} />
                                <input className="pwInput" type="password" name="password" placeholder="비밀번호" onChange={handleChange} />
                                <div className="keepLogin"><input type="checkbox" name="keepLogin" />로그인 상태 유지</div>
                                <button className="LoginButton" onClick={handleLogin}>로그인하고 여행 추천받기</button>
                                <div className="JoinSuggestion">떠나보자GO!가 처음이라면,  <span onClick={() => setIsLogin(false)}>회원가입</span>  하기</div>
                            </form>
                        </div>
                    ) : (
                        <div className="MainScreen-JoinBox">
                            <img className="paperPlane" src="/images/paperPlane.png" alt="" width={171} height={181} />
                            <div className="MainScreen-Join">회원가입<span className="MainScreen-JoinCancel" onClick={() => {
                                setForm({
                                    userId: "",
                                    password: "",
                                    userName: "",
                                    address: "",
                                });
                                setPwCheck("");
                                setStep(1);
                                setIsLogin(true);
                            }}>X</span></div>

                            <form className="MainScreen-Form" onSubmit={(e) => e.preventDefault()}>
                                {step === 1 && (
                                    <>
                                        <input className="idInput" type="text" name="userId" placeholder="이메일" onChange={handleChange} />
                                        <input className="pwInput" type="password" name="password" placeholder="비밀번호" onChange={handleChange} />
                                        <input
                                            className="pwCheck"
                                            type="password"
                                            placeholder="비밀번호 확인"
                                            value={pwCheck}
                                            onChange={(e) => setPwCheck(e.target.value)}
                                        />
                                        <button
                                            className="nextStep"
                                            type="button"
                                            onClick={() => {
                                                if (form.password !== pwCheck) {
                                                    alert("비밀번호가 일치하지 않습니다.");
                                                    return;
                                                }
                                                setStep(2);
                                            }}
                                        >
                                            다음
                                        </button>
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <input
                                            className="addressInput"
                                            type="text"
                                            name="address"
                                            placeholder="거주지 입력"
                                            value={form.address}
                                            readOnly
                                            onClick={handleAddressSearch}
                                        />
                                        <button className="JoinRequest" type="button" onClick={handleRegister}>회원가입</button>
                                    </>
                                )}
                            </form>
                        </div>
                    )}
                    <div className="MainScreen-Image">
                        <img className="MainScreen-Image" src="/images/MainPoster.png" alt="메인포스터1" />
                    </div>
                </div>
                <div className="TourRecommend">
                    <div className="TourRecommend-Ad"></div>
                    <div className="TourRecommend-Ad"></div>
                    <div className="TourRecommend-Ad"></div>
                </div>
                <img className="cloud1" src="/images/cloud1.png" alt="cloud1" />
                <img className="cloud2" src="/images/cloud2.png" alt="cloud2" />
            </div>
            <About />
            <Footer />
        </div>
    );
}