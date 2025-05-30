import '../style/MyPlan.css';
import Header from "../Component/Header";
import Footer from '../Component/Footer';

export default function MyPlan() {
    return (
        <div className="MyPlan">
            <Header />
            <div className="MyPlan-Container">
                <div className="MyPlan-Header">
                    마이플랜 페이지 입니다.
                </div>
            </div>
            <Footer />
        </div>
    )
}