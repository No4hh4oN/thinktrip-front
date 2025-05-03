'use client';

import { useState } from 'react';
import '../style/Calendar.css';

const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

type CalendarProps = {
    departureDate: Date | null;
    returnDate: Date | null;
    setDepartureDate: (date: Date | null) => void;
    setReturnDate: (date: Date | null) => void;
  };

export default function Calendar({ departureDate, returnDate, setDepartureDate, setReturnDate }: CalendarProps) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(currentYear, currentMonth, day);

        if (!departureDate || (departureDate && returnDate)) {
            setDepartureDate(clickedDate);
            setReturnDate(null);
        } else if (clickedDate >= departureDate) {
            setReturnDate(clickedDate);
        } else {
            setDepartureDate(clickedDate);
            setReturnDate(null);
        }
    };

    //캘린더 월 이전 다음 버튼
    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    //캘린더 렌더링
    const renderDays = () => {
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

        const calendarCells = [];

        for (let i = 0; i < firstDay; i++) {
            calendarCells.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const thisDate = new Date(currentYear, currentMonth, day);
            const isSelected =
                departureDate &&
                returnDate &&
                thisDate >= departureDate &&
                thisDate <= returnDate;

            const isStart = departureDate && thisDate.toDateString() === departureDate.toDateString();
            const isEnd = returnDate && thisDate.toDateString() === returnDate.toDateString();

            calendarCells.push(
                <div
                    key={day}
                    className={`day-cell ${isSelected ? 'selected' : ''} ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''}`}
                    onClick={() => handleDateClick(day)}
                >
                    {day}
                </div>
            );
        }

        return calendarCells;
    };

    return (
        <div className="PlanByAI-Calendar-Box">
            <div className="PlanByAI-Calendar">
                <div className="calendar-header">
                    <button id='month-next' className="calendar-changeMonth" onClick={handlePrevMonth}>&lt;</button>
                    <span>{currentYear}년 {currentMonth + 1}월</span>
                    <button id='month-prev' className="calendar-changeMonth" onClick={handleNextMonth}>&gt;</button>
                </div>
                <div className="calendar-weekdays">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                        <div key={idx} className="weekday-cell">{day}</div>
                    ))}
                </div>
                <div className="calendar-grid">
                    {renderDays()}
                </div>
            </div>
            <div className="PlanByAI-DateBox">
                <div className="PlanByAI-Date">
                    출발일: <span id='Departure'>{departureDate ? departureDate.toDateString() : '-'}</span>
                </div>

                <div className="PlanByAI-Date">
                    복귀일: <span id='Return'>{returnDate ? returnDate.toDateString() : '-'}</span>
                </div>
            </div>
        </div>
    );
}
