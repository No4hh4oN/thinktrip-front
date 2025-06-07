"use client";

import { useRef, useState } from "react";
import { Editor } from "@toast-ui/react-editor";
import { useRouter } from "next/navigation";
import AxiosClient from "../AxiosClient";
import "@toast-ui/editor/dist/toastui-editor.css";
import "../style/Component.css";

interface ToastEditorProps {
    travelData: {
        departureDate: Date | null;
        returnDate: Date | null;
    };
}

export default function MarkdownEditor({ travelData }: ToastEditorProps) {
    const router = useRouter();
    const editorRef = useRef<Editor>(null);
    const [images, setImages] = useState<Blob[]>([]); // 업로드 이미지 임시 저장

    const handleGetContent = async () => {
        if (!editorRef.current) return;

        const markdown = editorRef.current.getInstance().getMarkdown();
        const formData = new FormData();

        const diaryInfo = {
            title: "예시 다이어리",
            content: markdown,
            startDate: travelData.departureDate,
            endDate: travelData.returnDate,
        };

        formData.append("request", JSON.stringify(diaryInfo));
        images.forEach((image) => formData.append("images", image));

        try {
            await AxiosClient.post("/diaries", formData);
            router.push("/MyDiary");
        } catch (err) {
            console.error("❌ 다이어리 저장 실패:", err);
        }
    };

    return (
        <div id="Report" className="Editor-Container">
            <Editor
                toolbarItems={[
                    ['heading', 'bold', 'italic', 'strike'],
                    ['hr', 'quote'],
                    ['ul', 'ol', 'task', 'indent', 'outdent'],
                    ['table', 'link', 'image']
                ]}
                ref={editorRef}
                initialValue="여행을 기록해보세요..."
                previewStyle="tab"
                height="800px"
                initialEditType="wysiwyg"
                useCommandShortcut={true}
                hideModeSwitch={true}
                language="ko-KR"
                hooks={{
                    addImageBlobHook: (blob: Blob, callback: (url: string, altText: string) => void) => {
                        // 임시로 보여주고 실제 업로드는 handleGetContent에서 처리
                        const tempUrl = URL.createObjectURL(blob);
                        setImages((prev) => [...prev, blob]);
                        callback(tempUrl, "임시 이미지");
                        return false;
                    }
                }}
            />
            <button className="SelfPlanSave" onClick={handleGetContent}>저장</button>
        </div>
    );
}
