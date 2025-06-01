"use client";

import { useRef } from "react";
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

export default function MobileMarkdownEditor({ travelData }: ToastEditorProps) {
    const router = useRouter();
    const editorRef = useRef<Editor>(null);

    const handleGetContent = async () => {
        if (editorRef.current) {
            const markdown = editorRef.current.getInstance().getMarkdown();

            try {
                const res = await AxiosClient.post("/travel-plans/user", {
                    content: markdown,
                    startDate: travelData.departureDate,
                    endDate: travelData.returnDate,
                    title: "예시글1",
                    isGenerated: false,
                });

                router.push("/MyPlan");
            } catch (error) {
                console.error("저장 오류");
            }
        }
    };

    return (
        <div id="MobileReport" className="Editor-Container mobile">
            <Editor
                ref={editorRef}
                initialValue="모바일에서 내용을 입력하세요."
                previewStyle="tab"
                height="65vh"
                initialEditType="wysiwyg"
                useCommandShortcut={false}
                hideModeSwitch={true}
                language="ko-KR"
                toolbarItems={[
                    ['heading', 'bold', 'italic', 'strike'],
                    ['hr', 'quote'],
                    ['ul', 'ol', 'task', 'indent', 'outdent'],
                    ['table', 'link']
                ]}
                hooks={{
                    addImageBlobHook: (blob: Blob, callback: (url: string, altText: string) => void) => {
                        const tempUrl = URL.createObjectURL(blob);
                        callback(tempUrl, '임시 이미지');
                        console.log('이미지 추가됨:', tempUrl);
                        return false;
                    }
                }}
            />
            <button className="SelfPlanSave" onClick={handleGetContent}>저장</button>
        </div>
    );
}
