"use client";

import { useState } from "react";
import "../style/Component.css";

export default function AdSlide() {
    const slides = [
        { color: "#000000", text: "LIKELION 13기 모집중", target: "#" },
        { color: "#000000", text: "1팀 장준익 유광렬 정서우", target: "#" },
        { color: "#000000", text: "강승진 강사님 화이팅", target: "#" },
        { color: "#000000", text: "삼육대 컴공 4학년 화이팅", target: "#" },
        { color: "#000000", text: "개발자 커뮤니티 WAD!", target: "#" },
        { color: "#000000", text: "챌 서폿 잼띵이 구독!!", target: "#" },
        { color: "#000000", text: "PEETING은 최고야!", target: "#" },
    ];

    const [animate, setAnimate] = useState(true);
    const onStop = () => setAnimate(false);
    const onRun = () => setAnimate(true);

    return (
        <div className="AdSlide">
            <div className="slide_container">
                <ul
                    className="slide_wrapper"
                    onMouseEnter={onStop}
                    onMouseLeave={onRun}
                >
                    <div
                        className={"slide original".concat(
                            animate ? "" : " stop"
                        )}
                    >
                        {slides.map((s, i) => (
                            <li
                                key={i}
                                className={i % 2 === 0 ? "big" : "small"}
                            >
                                <div
                                    className="item"
                                    style={{ background: s.color }}
                                >
                                    <span className="slide-text">{s.text}</span>
                                </div>
                            </li>
                        ))}
                    </div>
                    <div
                        className={"slide clone".concat(animate ? "" : " stop")}
                    >
                        {slides.map((s, i) => (
                            <li
                                key={i}
                                className={i % 2 === 0 ? "big" : "small"}
                            >
                                <div
                                    className="item"
                                    style={{ background: s.color }}
                                >
                                    <span className="slide-text">{s.text}</span>
                                </div>
                            </li>
                        ))}
                    </div>
                </ul>
            </div>
        </div>
    );
}