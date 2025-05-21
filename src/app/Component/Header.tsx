import "../style/Component.css";
import Link from 'next/link';

export default function Header() {
    return (
        <div className="Header">
            <div className="Header-Logo">
                <Link href="/">
                    <span className="Header-Logo-1">T</span>h<span className="Header-Logo-2">!</span>nk<span className="Header-Logo-3">T</span>r<span className="Header-Logo-4">!</span>p
                </Link>
            </div>
            <div className="Header-List">
                <div className="Header-gpt">
                    여행추천
                    <div className="Header-dropdown-content">
                        <Link href="/PlanByAI">
                            <span>GPT에게 추천받는 나의 여행</span>
                        </Link>
                        <Link href="/SelfPlan">
                            <span>직접 계획하는 나의 여행</span>
                        </Link>
                        <span>TourAPI가 추천하는 여행</span>
                        <Link href="/MyPlan">
                            <span>저장한 여행 계획</span>
                        </Link>
                    </div>
                </div>
                <div className="Header-diary">
                    다이어리
                    <div className="Header-dropdown-content">
                        <Link href="/Report">
                            <span>여행일기 작성하기</span>
                        </Link>
                        <Link href="/Diary">
                            <span>내 여행일기 보기</span>
                        </Link>
                    </div>
                </div>
                <div className="Header-mypage">마이페이지</div>
            </div>
        </div>
    );
}