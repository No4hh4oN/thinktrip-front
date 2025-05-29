"use client";

import { useRef } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import "../style/Component.css";

export default function MobileMarkdownEditor() {
    const editorRef = useRef<Editor>(null);

    const handleGetContent = () => {
        if (editorRef.current) {
            const markdown = editorRef.current.getInstance().getMarkdown();
            console.log("모바일 마크다운 내용:", markdown);
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
