import Header from "../Component/Header";
import '../style/MyPlan.css'
import "../style/Component.css";

// 저장된 여행 계획 조회 페이지
export default function MyPlan() {
    return(
        <div className="MyPlan">
            <Header />
            <div className="MyPlan-Container">
                <div className="MyPlan-Header">저장한 여행 계획</div>
            </div>
        </div>
    )
}