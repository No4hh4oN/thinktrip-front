"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import AxiosClient from "../AxiosClient";
import "./style/Mainpage.css";

interface FormState {
  userId: string;
  password: string;
  userName?: string;
  userEmail?: string;
  telNo?: string;
}

export default function Login() {
  const [form, setForm] = useState<FormState>({
    userId: "",
    password: "",
    userName: "",
    userEmail: "",
    telNo: "",
  });

  const [isLogin, setIsLogin] = useState<boolean>(true);
  const router = useRouter(); // 라우터 사용

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    try {
      const response = await AxiosClient.post<{ message: string }>("/login", {
        userId: form.userId,
        password: form.password,
      });
      alert("로그인 성공: " + response.data.message);
    } catch (error) {
      console.error("로그인 실패", error);
      alert("로그인 실패");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await AxiosClient.post<{ message: string }>("/register", {
        userId: form.userId,
        password: form.password,
        userName: form.userName,
        userEmail: form.userEmail,
        telNo: form.telNo,
      });
      alert("회원가입 성공: " + response.data.message);
      setIsLogin(true);
    } catch (error) {
      console.error("회원가입 실패", error);
      alert("회원가입 실패");
    }
  };

  return (
    <div className="MainContainer">
      {isLogin ? (
        <div className="Login-Container">
          <h2>로그인</h2>
          <input type="text" name="userId" placeholder="아이디" onChange={handleChange} />
          <input type="password" name="password" placeholder="비밀번호" onChange={handleChange} />
          <button onClick={handleLogin}>로그인</button>
          <p onClick={() => setIsLogin(false)}>회원가입</p>
        </div>
      ) : (
        <div className="Join-Container">
          <h2>회원가입</h2>
          <input type="text" name="userId" placeholder="아이디" onChange={handleChange} />
          <input type="password" name="password" placeholder="비밀번호" onChange={handleChange} />
          <input type="text" name="userName" placeholder="이름" onChange={handleChange} />
          <input type="email" name="userEmail" placeholder="이메일" onChange={handleChange} />
          <input type="text" name="telNo" placeholder="전화번호" onChange={handleChange} />
          <button onClick={handleRegister}>회원가입</button>
          <p onClick={() => setIsLogin(true)}>로그인</p>
        </div>
      )}

      {/* ✅ 클릭하면 /map 페이지로 이동하는 버튼 추가 ✅ */}
      <button onClick={() => router.push("/Map")} style={{ marginTop: "20px" }}>
        지도 페이지로 이동
      </button>
    </div>
  );
}
