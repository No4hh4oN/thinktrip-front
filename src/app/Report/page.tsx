"use client";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import '../style/Report.css';
import dynamic from "next/dynamic";

export default function Report() {
    const ToastEditor = dynamic(() => import('../Component/Editor'), {
        ssr: false,
    });

    return (
        <div className="Report">
            <Header />
            <div className="Report-Container">
                <div className="Report-Container-header">
                    내가 계획하는 여행
                </div>
                <ToastEditor />
            </div>
            <Footer />
        </div>
    )


}