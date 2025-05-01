import "../style/Component.css";

export default function About() {
    return (
        <div className="About">
            <div className="About-Box" id="about-section">
                <div className="About-OpenAI">
                    <img className="About-OpenAI" src="../images/OpenAI.png" alt="" />
                </div>
                <div className="About-Intro">
                    <div className="About-Q"><span><span className="About-Q-1">T</span>h<span className="About-Q-2">!</span>nk<span className="About-Q-3">T</span>r<span className="About-Q-4">!</span>p</span>은 어떤 서비스인가요?</div>
                    <div className="About-A">
                        Th!nkTrip은 Open AI를 사용하여 서비스 이용자분들의 여행 취향, 성격 등을 고려하여 딱 맞는 여행 일정을 추천해드립니다.<br /><br />
                        더불어, 다이어리 기능으로 여행의 추억을 남길 수 있으며 커뮤니티 서비스를  통해 다른 사용자와의 커뮤니케이션으로 여행의 재미를
                        나누고 그 이상으로 가져갈 수 있도록 돕고 있습니다.
                    </div>
                </div>
            </div>
        </div>

    );
}