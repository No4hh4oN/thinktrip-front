"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import '../style/PlanByAI.css'
import "../style/Component.css";
import Calendar from "../Component/Calendar";
import Map from '../Component/map';
import Header from '../Component/Header';
import Footer from '../Component/Footer';

type TravelFormData = {
    member: string;
    transport: string;
    mood: string;
    themes: string[];
    region: string | null;
    destination: string | null;
    departureDate: Date | null;
    returnDate: Date | null;
    otherRequests: string | null;
};

export default function PlanByAI() {
    const [travelData, setTravelData] = useState<TravelFormData>({
        member: '',
        transport: '',
        mood: '',
        themes: [],
        region: '',
        destination: '',
        departureDate: null,
        returnDate: null,
        otherRequests: null,
    });

    const [gptResult, setGptResult] = useState<string>("");

    const buildPrompt = (data: TravelFormData): string => {
        const {
            member,
            transport,
            mood,
            themes,
            region,
            destination,
            departureDate,
            returnDate,
            otherRequests,
        } = data;

        return `
                    당신은 여행 플래너입니다. 다음 조건에 맞는 여행 일정을 추천해주세요. 추천할 때는 교통도 포함해서 작성해야합니다.
                     만약 도착지와 지역 정보가 없다면 직접 대한민국 지역 한 곳을 골라주세요!

                    - 여행 구성원: ${member || "알 수 없음"}
                    - 교통수단: ${transport || "알 수 없음"}
                    - 현재 기분: ${mood || "알 수 없음"}
                    - 여행 테마: ${themes.length ? themes.join(", ") : "기본"}
                    - 지역: ${region || "미지정"}
                    - 도착지: ${destination || "미지정"}
                    - 여행 날짜: ${departureDate?.toDateString() || "?"} ~ ${returnDate?.toDateString() || "?"}
                    - 그 외 사용자 요청: ${otherRequests || "없음"}

                    형식은 아래 예시처럼 구체적으로 모든 날짜에 맞추어 적어주세요:

                    당신의 현재 기분이 어떻고 누구와 함께 이런 이런 여행을 원하시는군요? 제가 아래와 같이 여행 스케쥴을 잡아봤어요!

                    추천 여행 코스: 경주 + 포항 (3월 23일~25일)
                    서울(또는 출발지) → 경주 → 포항 → 서울(또는 출발지)

                    1일 차 (3월 23일) - 경주 (역사 & 감성 여행)
                    이동: KTX 또는 버스로 경주 도착 (서울 기준 KTX 약 2시간 10분)
                    주요 일정:
                    대릉원 & 첨성대: 고즈넉한 분위기 속 산책 (한적한 아침 추천!)
                    황리단길: 감성 카페와 전통 한옥 거리 구경
                    교촌마을 & 경주향교: 전통 한옥에서 여유로운 시간
                    월정교 야경: 아름다운 조명과 함께하는 고즈넉한 분위기
                    숙박: 경주 황리단길 근처 게스트하우스 or 저렴한 한옥스테이


                    2일 차 (3월 24일) - 포항 (바다 감성 & 힐링 여행)
                    ...
                    `;
    };

    const handleGeneratePlan = async () => {
        const prompt = buildPrompt(travelData);
        // console.log("GPT에게 보낼 프롬프트:", prompt);

        try {
            const res = await fetch("/api/gpt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();
            // console.log("GPT 응답:", data.result);
            setGptResult(data.result);
        } catch (err) {
            console.error("GPT 요청 실패:", err);
        }
    };

    return (
        <div className="PlanByAI">
            <Header />
            <div className="PlanByAI-Container">
                <div className="PlanByAI-Header">GPT에게 추천받는 나의 여행</div>
                <div className="PlanByAI-InputBox">
                    <Calendar
                        departureDate={travelData.departureDate}
                        returnDate={travelData.returnDate}
                        setDepartureDate={(date) =>
                            setTravelData((prev: TravelFormData) => ({
                                ...prev,
                                departureDate: date
                            }))
                        }
                        setReturnDate={(date) =>
                            setTravelData((prev: TravelFormData) => ({
                                ...prev,
                                returnDate: date
                            }))
                        }
                    />

                    <Map
                        selectedRegion={travelData.region}
                        selectedPlace={travelData.destination}
                        setSelectedRegion={(place) =>
                            setTravelData((prev: TravelFormData) => ({
                                ...prev,
                                region: place
                            }))
                        }

                        setSelectedPlace={(place) =>
                            setTravelData((prev: TravelFormData) => ({
                                ...prev,
                                destination: place
                            }))
                        }
                    />

                    <div className="PlanByAI-InputOthers">
                        <div className="PlanByAI-InputOthers-Header">당신만의 여행을 만들기 위해 몇 가지를 알려주세요!</div>
                        <div className="PlanByAI-InputOthers-Body">
                            <div className="PlanByAI-InputOthers-box">
                                <div>여행 구성원: {travelData.member || '선택하세요'}</div>
                                <div className="option-buttons">
                                    {['👤 혼자', '👬 친구', '👨‍👩‍👧 가족', '❤️ 연인'].map(member => (
                                        <button
                                            key={member}
                                            className={travelData.member === member ? 'selected' : ''}
                                            onClick={() =>
                                                setTravelData((prev: TravelFormData) => ({
                                                    ...prev,
                                                    member,
                                                }))
                                            }
                                        >
                                            {member}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="PlanByAI-InputOthers-box">
                                <div>교통수단: {travelData.transport || '선택하세요'}</div>
                                <div className="option-buttons">
                                    {['🚗 차량', '🚶 도보', '🚲 자전거', '🚌 대중교통'].map(transport => (
                                        <button
                                            key={transport}
                                            className={travelData.transport === transport ? 'selected' : ''}
                                            onClick={() =>
                                                setTravelData((prev: TravelFormData) => ({
                                                    ...prev,
                                                    transport,
                                                }))
                                            }
                                        >
                                            {transport}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="PlanByAI-InputOthers-box">
                                <div>요즘 기분: {travelData.mood || '입력 또는 선택하세요'}</div>
                                <div className="option-Container">
                                <div className="option-buttons">
                                    {['😊', '😌', '😐', '😩'].map(mood => (
                                        <button
                                            key={mood}
                                            className={travelData.mood === mood ? 'selected' : ''}
                                            onClick={() =>
                                                setTravelData((prev: TravelFormData) => ({
                                                    ...prev,
                                                    mood,
                                                }))
                                            }
                                        >
                                            {mood}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    placeholder="직접 기분 입력"
                                    value={travelData.mood}
                                    onChange={e =>
                                        setTravelData((prev: TravelFormData) => ({
                                            ...prev,
                                            mood: e.target.value,
                                        }))
                                    }
                                />
                                </div>
                            </div>

                            <div className="PlanByAI-InputOthers-box">
                                <div>
                                    여행 컨셉:{" "}
                                    {travelData.themes.length > 0
                                        ? travelData.themes.join(', ')
                                        : '하나 이상 선택하세요'}
                                </div>
                                <div className="option-buttons">
                                    {['#힐링', '#자연', '#도시탐험', '#맛집탐방'].map(tag => {
                                        const selected = travelData.themes.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                className={selected ? 'selected' : ''}
                                                onClick={() =>
                                                    setTravelData((prev: TravelFormData) => ({
                                                        ...prev,
                                                        themes: selected
                                                            ? prev.themes.filter(t => t !== tag)
                                                            : [...prev.themes, tag],
                                                    }))
                                                }
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div id="requestothersbox" className="PlanByAI-InputOthers-box">
                                <div>사용자 추가 요청</div>
                                <textarea
                                    className="PlanByAI-InputOthers-box-RequestOthers"
                                    placeholder="예: 바닷가 근처였으면 좋겠어요, 유명한 맛집 중심으로 짜주세요 등"
                                    value={travelData.otherRequests || ''}
                                    onChange={(e) =>
                                        setTravelData((prev: TravelFormData) => ({
                                            ...prev,
                                            otherRequests: e.target.value || null,
                                        }))
                                    }
                                />
                            </div>

                            <button
                                className="GeneratePlanButton"

                                onClick={handleGeneratePlan}
                            >
                                여행 계획 생성 요청하기
                            </button>
                        </div>

                    </div>

                </div>
                <div className="PlanByAI-OutputBox">
                    <div className="PlanByAI-OutputBox-Header">🗺 추천 여행 일정</div>
                    {gptResult && (
                        <div className="PlanByAI-OutputBox-GPTResult">
                            <pre style={{ whiteSpace: "pre-wrap" }}>{gptResult}</pre>
                        </div>
                    )}
                    {!gptResult && (
                        <div className="PlanByAI-OutputBox-NoGPTResult">
                            여행 계획을 Gpt가 생성해드립니다.<br />
                            위의 입력란에 입력후 이용해보세요!
                        </div>
                    )}
                </div>
            </div>
            <Footer />
            <img className="cloud1" src="/images/cloud1.png" alt="cloud1" />
            <img className="cloud2" src="/images/cloud2.png" alt="cloud2" />
        </div>
    );
}