"use client";
import { useState, useEffect } from "react";
import Link from 'next/link';
import '../style/PlanByAI.css'
import "../style/Component.css";
import Calendar from "../Component/Calendar";
import Map from '../Component/map';
import Header from '../Component/Header';
import Footer from '../Component/Footer';

export default function AdSlide() {
    return (
        <div className="PlanByAI">
            <Header />
            <div className="PlanByAI-Container">
                <div className="PlanByAI-Header">GPT에게 추천받는 나의 여행</div>
                <div className="PlanByAI-InputBox">
                    <Calendar />
                    <Map />
                    <div className="PlanByAI-InputOthers">
                        <div>여행 구성원</div>
                        <div>교통수단(ex.차량/도보)</div>
                        <div>요즘 기분이 어떤가요?</div>
                        
                        <div>여행 컨셉</div>
                    </div>
                </div>
                <div className="PlanByAI-OutputBox">
                    
                </div>
            </div>
            <Footer />
            <img className="cloud1" src="/images/cloud1.png" alt="cloud1" />
            <img className="cloud2" src="/images/cloud2.png" alt="cloud2" />
        </div>
    );
}