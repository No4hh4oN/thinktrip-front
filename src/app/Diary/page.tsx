import Header from "../Component/Header";
import '../style/Diary.css'
import "../style/Component.css";
import Footer from "../Component/Footer";

export default function Diary() {
    return (
        <div className="Diary">
            <Header />
            <div className="Diary-Container">
                <div className="Diary-Header">다이어리</div>
                <div className="Diary-Body-nowContents">
                    <div className="Diary-Body-nowContents-header">
                        <img src="/images/Marker.png" alt="Marker" width={18} />
                        <div></div>
                        <div></div>
                    </div>
                    <div className="Diary-Body-nowContents-Images">

                    </div>
                    <div className="Diary-Body-nowContents-Textarea">
                        <div className="Diary-Body-nowContents-Textarea-TitleArea">
                            <img id="QuoteLeft" src="/images/QuoteLeft.png" alt="QuoteLeft" />
                            <img id="QuoteRight" src="/images/QuoteRight.png" alt="QuoteRight" />
                            <div className="Diary-Body-nowContents-Textarea-Title">
                                가을을 맞이하러 설악산 2박 3일...
                            </div>
                        </div>
                        <div className="Diary-Body-nowContents-Textarea-Text">
                            <pre>
                                마지막 날 아침, 바닷가를 따라 가볍게 산책했다. 파도 소리에 맞춰 천천히 걸으며<br />
                                여행을 돌아보았다. 돌아가는 기차에 올라 다시 일상으로 향하지만,<br />
                                가을의 기억...👍👍👍
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <img className="cloud1" src="/images/cloud1.png" alt="cloud1" />
            <img className="cloud2" src="/images/cloud2.png" alt="cloud2" />
        </div>
    )
}