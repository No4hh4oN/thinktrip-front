"use client";
import { useState, useEffect, ChangeEvent } from "react";
import Link from 'next/link';
import AxiosClient from "./AxiosClient";
import "./style/Mainpage.css";
import "./style/Component.css";
import About from './Component/About';
import Footer from './Component/Footer';
import AdSlide from './Component/AdSlide';


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
    //D-day 표시 변수
    const [progress, setProgress] = useState(0);
    const [targetProgress, setTargetProgress] = useState(0);
    const [triggerAnimation, setTriggerAnimation] = useState(false);
    // //스크롤
    // const ReactScroll = require('react-scroll');
    // const Link = ReactScroll.Link;

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeepLogin(e.target.checked);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // 로그인(post)
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
            fetchProfileImage();
            alert("로그인 성공!");
        } catch (error) {
            alert("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
    };

    // 회원가입(post)
    const handleRegister = async () => {
        try {
            const response = await AxiosClient.post<{ message: string }>("/users/signup", {
                email: form.userId,
                password: form.password,
                name: form.userName,
                nickname: form.nickname,
                address: form.address,
                travelStyle: "배낭여행",
            });
            alert("회원가입 성공: " + response.data.message);
            setIsLogin(true);
        } catch (error) {
            alert("회원가입 실패");
        }
    };

    // 로그인 됐는지 체크하는 기능
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

    // 프로필 get 함수 (이미지 제외)
    const [userInfo, setUserInfo] = useState<userState>({
        nickname: "",
        userId: "",
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

            if (isAuthenticated) {
                fetchProfileImage();
            }

            setUserInfo({
                nickname: userInfo.nickname,
                userId: userInfo.email,
                is_premium: userInfo.is_premium,
            });
        } catch (error) {
        }
    };

    // 프로필 사진 post
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

    //프로필 사진 get
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

    // 로그인 됐을 때, 여행 계획 D-Day 프로그레스바 이벤트 진행시키는 기능
    useEffect(() => {
        if (isAuthenticated) {
            handleUserProfile();
            setTriggerAnimation(true);

            checkGptUsage().then((remaining) => {
                setGptUsage(remaining);
            });
        }
    }, [isAuthenticated]);

    // 대표 여행 계획 D-day 표시 기능

    const startDate = new Date('2025-04-01');
    const dDay = new Date('2025-04-20');
    const today = new Date();

    // 목표 진행률 계산
    useEffect(() => {
        const total = dDay.getTime() - startDate.getTime();
        const passed = today.getTime() - startDate.getTime();
        const percent = Math.min(Math.max((passed / total) * 100, 0), 100);
        setTargetProgress(percent);
    }, []);

    // 부드럽게 진행도 증가
    useEffect(() => {
        if (!triggerAnimation) return;

        let current = 0;
        const interval = setInterval(() => {
            current += 1;
            if (current >= targetProgress) {
                clearInterval(interval);
                current = targetProgress;
            }
            setProgress(current);
        }, 10);

        return () => clearInterval(interval);
    }, [triggerAnimation, targetProgress]);

    const remainingDays = Math.max(0, Math.ceil((dDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

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

    // 모바일 / 리스트 토글 다운
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="MainScreen">
            <div className="MainScreen-Container">
                <div className="MainScreen-Header">
                    <div className="MainScreen-Header-Logo"><span className="MainScreen-Header-Logo-1">T</span>h<span className="MainScreen-Header-Logo-2">!</span>nk<span className="MainScreen-Header-Logo-3">T</span>r<span className="MainScreen-Header-Logo-4">!</span>p</div>
                    <div className="MainScreen-Header-List">
                        <div className="MainScreen-Header-gpt">
                            여행추천<div className="dropdown-content">
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
                        <div className="MainScreen-Header-diary">
                            다이어리
                            <div className="dropdown-content">
                                <Link href="/Report">
                                    <span>여행일기 작성하기</span>
                                </Link>
                                <Link href="/Diary">
                                    <span>내 여행일기 보기</span>
                                </Link>
                            </div>
                        </div>
                        <div className="MainScreen-Header-mypage">마이페이지</div>
                        {isAuthenticated && (
                            <div className="MainScreen-Header-logout" onClick={() => {
                                sessionStorage.removeItem("token");
                                localStorage.removeItem("token");
                                setIsAuthenticated(false);
                                setTriggerAnimation(false);
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
                                    <label htmlFor="profile-upload" style={{ cursor: 'pointer' }}>
                                        <img
                                            className="MainScreen-ProfileImg"
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
                                    <span className="MainScreen-UserDetailInfo-AI-data"><span>{GptUsage}</span> / 5</span>
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
                                    <span className="MainScreen-D-DayPrompt-Num">{remainingDays}일</span> 남았어요!
                                </div>
                                <div className="D-day-Marker">
                                    <div className="D-day-Bar">
                                        <div className="D-day-Progress" style={{ width: `${progress}%` }}></div>
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
                                        nickname: "",
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
                                            <input className="idInput" type="text" name="userName" placeholder="이름" onChange={handleChange} autoComplete="username" />
                                            <input className="idInput" type="text" name="nickname" placeholder="닉네임" onChange={handleChange} autoComplete="name" />
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
                {/* <Link
                    to="about-section"
                    smooth={true}
                    duration={1000}
                    offset={-80} // 고정된 헤더 높이 조절
                    className="AboutButton"
                >
                    ?
                </Link> */}
            </div>
            <About />
            <Footer />


            {/* 모바일 */}


            <div className="MainScreen-Container-Mobile">
                {isAuthenticated ? (
                    <div className="MainScreen-Mobile">
                        <div className="Header-Logo-Mobile">
                            <div className={`MainScreen-Header-List-Mobile-menu-icon ${showMenu ? 'active' : ''}`}
                                onClick={() => setShowMenu(!showMenu)}>
                                ☰
                                {showMenu && (
                                    <div className="MainScreen-Header-List-Mobile">
                                        <div className="MainScreen-Header-gpt-Mobile">
                                            여행추천
                                            <div className="dropdown-content-Mobile">
                                                <Link href="/PlanByAI">
                                                    <span>- GPT에게 추천받는 나의 여행</span>
                                                </Link>
                                                <Link href="/SelfPlan">
                                                    <span>- 직접 계획하는 나의 여행</span>
                                                </Link>

                                                <Link href="/Tour">
                                                    <span>- TourAPI가 추천하는 여행</span>
                                                </Link>
                                                <Link href="/MyPlan">
                                                    <span>- 저장한 여행 계획</span>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="MainScreen-Header-diary-Mobile">
                                            다이어리
                                            <div className="dropdown-content-Mobile">
                                                <Link href="/Report">
                                                    <span>- 여행일기 작성하기</span>
                                                </Link>
                                                <Link href="/Diary">
                                                    <span>- 내 여행일기 보기</span>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="MainScreen-Header-mypage-Mobile">마이페이지</div>
                                        {isAuthenticated && (
                                            <div className="MainScreen-Header-logout-Mobile" onClick={() => {
                                                sessionStorage.removeItem("token");
                                                localStorage.removeItem("token");
                                                setIsAuthenticated(false);
                                                setTriggerAnimation(false);
                                            }}>
                                                로그아웃
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <span className="Header-Logo-1">T</span>h<span className="Header-Logo-2">!</span>nk<span className="Header-Logo-3">T</span>r<span className="Header-Logo-4">!</span>p

                        </div>
                        <div>
                            <img className="MainScreen-Image2" src="/images/MainPoster.png" alt="메인포스터1" />

                        </div>
                    </div>
                ) : (
                    <div className="MainScreen-AuthBox-Mobile">
                         <div className="Header-Logo-Mobile">
                            <div className={`MainScreen-Header-List-Mobile-menu-icon ${showMenu ? 'active' : ''}`}
                                onClick={() => setShowMenu(!showMenu)}>
                                ☰
                                {showMenu && (
                                    <div className="MainScreen-Header-List-Mobile">
                                        <div className="MainScreen-Header-gpt-Mobile">
                                            여행추천
                                            <div className="dropdown-content-Mobile">
                                                <Link href="/PlanByAI">
                                                    <span>- GPT에게 추천받는 나의 여행</span>
                                                </Link>
                                                <Link href="/SelfPlan">
                                                    <span>- 직접 계획하는 나의 여행</span>
                                                </Link>

                                                <Link href="/Tour">
                                                    <span>- TourAPI가 추천하는 여행</span>
                                                </Link>
                                                <Link href="/MyPlan">
                                                    <span>- 저장한 여행 계획</span>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="MainScreen-Header-diary-Mobile">
                                            다이어리
                                            <div className="dropdown-content-Mobile">
                                                <Link href="/Report">
                                                    <span>- 여행일기 작성하기</span>
                                                </Link>
                                                <Link href="/Diary">
                                                    <span>- 내 여행일기 보기</span>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="MainScreen-Header-mypage-Mobile">마이페이지</div>
                                        {isAuthenticated && (
                                            <div className="MainScreen-Header-logout-Mobile" onClick={() => {
                                                sessionStorage.removeItem("token");
                                                localStorage.removeItem("token");
                                                setIsAuthenticated(false);
                                                setTriggerAnimation(false);
                                            }}>
                                                로그아웃
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <span className="Header-Logo-1">T</span>h<span className="Header-Logo-2">!</span>nk<span className="Header-Logo-3">T</span>r<span className="Header-Logo-4">!</span>p

                        </div>
                        {isLogin ?

                            <div className="MainScreen-LoginBox-Mobile">
                                <div className="MainScreen-Login-Mobile">로그인</div>
                                <form className="MainScreen-Form-Mobile" onSubmit={handleLogin}>
                                    <input className="idInput-Mobile" type="text" name="userId" placeholder="이메일" onChange={handleChange} autoComplete="email" />
                                    <input className="pwInput-Mobile" type="password" name="password" placeholder="비밀번호" onChange={handleChange} autoComplete="current-password" />
                                    <div className="keepLogin-Mobile">
                                        <label>
                                            <input type="checkbox" name="keepLogin" checked={keepLogin} onChange={handleCheckboxChange} />
                                            로그인 상태 유지
                                        </label>
                                    </div>
                                    <button className="LoginButton-Mobile" type="submit">로그인</button>
                                    <div className="JoinSuggestion-Mobile">Th!nkTr!p이 처음이라면,  <span onClick={() => setIsLogin(false)}>회원가입</span>  하기</div>
                                </form>
                            </div>
                            :
                            <div className="MainScreen-JoinBox-Mobile">
                                <div className="MainScreen-Join-Mobile">회원가입<span className="MainScreen-JoinCancel-Mobile" onClick={() => {
                                    setForm({
                                        userId: "",
                                        password: "",
                                        userName: "",
                                        nickname: "",
                                        address: "",
                                    });
                                    setPwCheck("");
                                    setStep(1);
                                    setIsLogin(true);
                                }}>X</span></div>

                                <form className="MainScreen-Form-Mobile" onSubmit={(e) => e.preventDefault()}>
                                    {step === 1 && (
                                        <>
                                            <input className="idInput-Mobile" type="text" name="userId" placeholder="이메일" onChange={handleChange} autoComplete="email" />
                                            <input className="pwInput-Mobile" type="password" name="password" placeholder="비밀번호" onChange={handleChange} autoComplete="new-password" />
                                            <input className="pwInput-Mobile" type="password" placeholder="비밀번호 확인" value={pwCheck} onChange={(e) => setPwCheck(e.target.value)} autoComplete="new-password" />
                                            <button
                                                className="nextStep-Mobile"
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
                                            <input className="idInput-Mobile" type="text" name="userName" placeholder="이름" onChange={handleChange} autoComplete="username" />
                                            <input className="idInput-Mobile" type="text" name="nickname" placeholder="닉네임" onChange={handleChange} autoComplete="name" />
                                            <input
                                                className="addressInput-Mobile"
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
                        }

                    </div>
                )}
            </div>
        </div>
    );
}