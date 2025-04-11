"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import AxiosClient from "./AxiosClient";
import "./style/Mainpage.css";
import "./style/Component.css";
import About from './Component/About';
import Footer from './Component/Footer';
import AdSlide from "./Component/AdSlide";


declare global {
    interface Window {
        daum: any;
    }
}

// 로그인 회원가입 폼 변수
interface FormState {
    userId: string;
    password: string;
    userName?: string;
    nickname?: string;
    userEmail?: string;
    address?: string;
}

// 유저 프로필 개인데이터 변수
interface userState {
    nickname: string;
    userId: string;
    profileImg: string;
    is_premium: Boolean;
}

export default function Home() {

    // 로그인, 회원가입 post 함수
    const [form, setForm] = useState<FormState>({
        userId: "",
        password: "",
        userName: "",
        nickname: "",
        address: "",
    });

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [pwCheck, setPwCheck] = useState("");
    const [step, setStep] = useState<number>(1);
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [keepLogin, setKeepLogin] = useState(false);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeepLogin(e.target.checked);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await AxiosClient.post<{ token: string }>("/users/login", {
                email: form.userId,
                password: form.password,
            });

            const token = response.data.token;

            if (keepLogin) {
                localStorage.setItem("token", token); // 로그인 상태 유지 체크됐으면 로컬 스토리지 저장
            } else {
                sessionStorage.setItem("token", token); // 로그인 상태 유지 체크 안 됐으면 세션 스토리지 저장
            }

            setIsAuthenticated(true); // 로그인 상태로 변경
            alert("로그인 성공!");

        } catch (error) {
            alert("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
    };

    const handleRegister = async () => {
        try {
            const response = await AxiosClient.post<{ message: string }>("/users/signup", {
                email: form.userId,
                password: form.password,
                name: form.userName,
                nickname: "아무개",
                address: form.address,
                travelStyle: "배낭여행",
            });
            alert("회원가입 성공: " + response.data.message);
            setIsLogin(true);
        } catch (error) {
            alert("회원가입 실패");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    // 카카오 주소 api
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

    //유저 프로필 get 함수
    const [userInfo, setUserInfo] = useState<userState>({
        nickname: "",
        userId: "",
        profileImg: "",
        is_premium: false,
    });

    const handleUserProfile = async () => {
        try {
            const response = await AxiosClient.get<{
                nickname: string;
                email: string;
                profileImage: string;
                is_premium: Boolean;
            }>("/users/me");

            const userInfo = response.data;

            setUserInfo({
                nickname: userInfo.nickname,
                userId: userInfo.email,
                profileImg: userInfo.profileImage,
                is_premium: userInfo.is_premium,
            });
        } catch (error) {
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            handleUserProfile();
        }
    }, [isAuthenticated]);

    return (
        <div className="MainScreen">
            <div className="MainScreen-Container">
                <div className="MainScreen-Header">
                    <div className="MainScreen-Header-Logo"><span className="MainScreen-Header-Logo-1">T</span>h<span className="MainScreen-Header-Logo-2">!</span>nk<span className="MainScreen-Header-Logo-3">T</span>r<span className="MainScreen-Header-Logo-4">!</span>p</div>
                    <div className="MainScreen-Header-List">
                        <div className="MainScreen-Header-gpt">
                            여행추천
                            {/* <div className="dropdown-content">
                                <div>GPT에게 추천받는 나의 여행</div>
                                <div>직접 계획하는 나의 여행</div>
                                <div>TourAPI가 추천하는 여행</div>
                                <div>저장한 여행 계획</div>
                            </div> */}
                        </div>
                        <div className="MainScreen-Header-diary">다이어리</div>
                        <div className="MainScreen-Header-mypage">마이페이지</div>
                        {isAuthenticated && (
                            <div className="MainScreen-Header-logout" onClick={() => {
                                sessionStorage.removeItem("token");
                                localStorage.removeItem("token");
                                setIsAuthenticated(false);
                            }}>
                                로그아웃
                            </div>
                        )}
                    </div>
                </div>
                {isAuthenticated ? (
                    <div className="MainScreen-Box-after" onChange={handleUserProfile}>
                        <div className="MainScreen-UserInfo">
                            <div className="MainScreen-UserAuthInfo">
                                <div className="MainScreen-ProfileImg-Container">
                                    <img className="MainScreen-ProfileImg" src={userInfo.profileImg || "/images/profile.webp"} alt="프로필 이미지" />
                                </div>
                                <div className="MainScreen-ProfileAuth">
                                    <div className="MainScreen-UserName"><span>{userInfo.nickname}</span>님</div>
                                    <div className="MainScreen-UserId">{userInfo.userId}</div>
                                    <button className="ProfileEdit">내 정보 수정</button>
                                </div>
                                <img className="paperPlane2" src="/images/paperPlane2.png" alt="종이비행기" width={198} height={168} />
                            </div>
                            <div className="MainScreen-UserDetailInfo">
                                <div className="MainScreen-UserDetailInfo-Premium">
                                    <span className="MainScreen-UserDetailInfo-Premium-label">프리미엄</span>
                                    <span className="MainScreen-UserDetailInfo-Premium-data">{userInfo.is_premium ? "가입자" : "미가입자"}</span>
                                </div>
                                <div className="MainScreen-UserDetailInfo-AI">
                                    <span className="MainScreen-UserDetailInfo-AI-label">AI 사용가능 횟수</span>
                                    <span className="MainScreen-UserDetailInfo-AI-data"> 0 / 5</span>
                                </div>
                                <div></div>
                            </div>
                            <div className="MainScreen-toRecommand">
                                지금 떠날 준비를 해볼까요?
                            </div>
                        </div>
                        <div className="MainScreen-SubInfo">
                            <div className="MainScreen-Image2">
                                <img className="MainScreen-Image2" src="/images/MainPoster.png" alt="메인포스터1" />
                            </div>
                            <div className="MainScreen-D-DayPrompt">
                                <div className="MainScreen-D-DayPrompt-Text">
                                    여행까지<br />
                                    <span className="MainScreen-D-DayPrompt-Num">{16}일</span> 남았어요!
                                </div>
                                <div className="D-day-Marker">
                                    <div className="D-day-Bar">
                                        <div className="D-day-Progress" style={{ width: `${57}%` }}></div>
                                    </div>
                                    <div className="D-day-Text">
                                        <span>계획일</span>
                                        <span>여행 D-DAY</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="MainScreen-Box">
                        {isLogin ? (
                            <div className="MainScreen-LoginBox">
                                <img className="paperPlane" src="/images/paperPlane.png" alt="" width={171} height={181} />
                                <div className="MainScreen-Login">로그인</div>
                                <form className="MainScreen-Form" onSubmit={handleLogin}>
                                    <input className="idInput" type="text" name="userId" placeholder="이메일" onChange={handleChange} autoComplete="email" />
                                    <input className="pwInput" type="password" name="password" placeholder="비밀번호" onChange={handleChange} autoComplete="current-password" />
                                    <div className="keepLogin">
                                        <label>
                                            <input type="checkbox" name="keepLogin" checked={keepLogin} onChange={handleCheckboxChange} />
                                            로그인 상태 유지
                                        </label>
                                    </div>
                                    <button className="LoginButton" type="submit">로그인하고 여행 추천받기</button>
                                    <div className="JoinSuggestion">Th!nkTr!p이 처음이라면,  <span onClick={() => setIsLogin(false)}>회원가입</span>  하기</div>
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
                                            <input className="idInput" type="text" name="userId" placeholder="이메일" onChange={handleChange} autoComplete="email" />
                                            <input className="pwInput" type="password" name="password" placeholder="비밀번호" onChange={handleChange} autoComplete="new-password" />
                                            <input className="pwCheck" type="password" placeholder="비밀번호 확인" value={pwCheck} onChange={(e) => setPwCheck(e.target.value)} autoComplete="new-password" />
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

                )}
                <AdSlide />
            </div>
            <About />
            <Footer />
            <img className="cloud1" src="/images/cloud1.png" alt="cloud1" />
            <img className="cloud2" src="/images/cloud2.png" alt="cloud2" />
        </div>
    );
}