import '../style/Mypage.css';
import Header from "../Component/Header";
import Footer from '../Component/Footer';

export default function Mypage() {
    return (
        <div className="Mypage">
            <Header />
            <div className="Mypage-Container">
                <div className="Mypage-Header">
                    마이페이지
                </div>
            </div>
            <Footer />
        </div>
    )
}