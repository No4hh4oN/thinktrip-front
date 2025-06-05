"use client";
import { useState, useEffect } from "react";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import '../style/Report.css';
import dynamic from "next/dynamic";
import Calendar from "../Component/Calendar";

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

const DiaryEditor = dynamic(() => import('../Component/DiaryEditor'), {
    ssr: false,
});

export default function Report() {

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


    return (
        <div className="Report">
            <Header />
            <div className="Report-Container">
                <div className="Report-Container-header">
                    여행일기 작성하기
                </div>
                <div className="Report-Container-Body">
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
                    <DiaryEditor travelData={travelData} />
                </div>
            </div>
            <Footer />
        </div>
    )


}