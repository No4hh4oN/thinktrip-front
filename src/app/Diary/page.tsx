import Header from "../Component/Header";
import '../style/Diary.css'
import "../style/Component.css";

export default function Diary() {
    return(
        <div className="Diary">
            <Header />
            <div className="Diary-Container">
                <div className="Diary-Header">다이어리</div>
            </div>
        </div>
    )
}