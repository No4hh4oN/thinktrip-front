"use client";

import { useRef } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "../style/Component.css";

export default function MarkdownEditor() {
    const editorRef = useRef<Editor>(null);

    const handleGetContent = () => {
        if (editorRef.current) {
            const markdown = editorRef.current.getInstance().getMarkdown();
            console.log("마크다운 내용:", markdown);
        }
    };

    return (
        <div id="Report" className="Editor-Container">
            <Editor
                // 툴바 옵션 설정
                toolbarItems={[
                    ['heading', 'bold', 'italic', 'strike'],
                    ['hr', 'quote'],
                    ['ul', 'ol', 'task', 'indent', 'outdent'],
                    ['table', 'link']
                ]}
                ref={editorRef}
                initialValue="글을 입력하세요."
                previewStyle="tab"
                height="800px"
                initialEditType="wysiwyg"
                useCommandShortcut={true}
                hideModeSwitch="true"
                language="ko-KR"
                hooks={{
                    addImageBlobHook: (blob: Blob, callback: (url: string, altText: string) => void) => {
                        const tempUrl = URL.createObjectURL(blob);
                        callback(tempUrl, '임시 이미지');
                        console.log('이미지 추가됨:', tempUrl);
                        return false; // 기본 업로드 막음
                    }
                }}
            />
            <button className="SelfPlanSave" onClick={handleGetContent}>저장</button>
        </div>
    );
}
