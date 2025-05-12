"use client";
import { useState, useEffect } from "react";
import Header from "../Component/Header";
import '../style/SelfPlan.css'
import "../style/Component.css";
import Calendar from "../Component/Calendar";
import Footer from "../Component/Footer";

import dynamic from "next/dynamic";

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

export default function SelfPlan() {
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

    const ToastEditor = dynamic(() => import('../Component/Editor'), {
        ssr: false,
    });

    return (
        <div className="SelfPlan">
            <Header />
            <div className="SelfPlan-Container">
                <div className="SelfPlan-Header">내가 계획하는 여행</div>
                <div className="SelfPlan-Body">
                    <div className="SelfPlan-Body-Left">
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
                        <div className="GPT-Prompt-Box">

                        </div>
                    </div>
                    <div className="SelfPlan-Body-Right">
                        <ToastEditor />
                    </div>
                </div>
            </div>
            <Footer />
            <img className="cloud1" src="/images/cloud1.png" alt="cloud1" />
            <img className="cloud2" src="/images/cloud2.png" alt="cloud2" />
        </div>
    )
}