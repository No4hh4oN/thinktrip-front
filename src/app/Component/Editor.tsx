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
        <div className="Editor-Container">
            <Editor
                toolbarItems={[
                    // 툴바 옵션 설정
                    ['heading', 'bold', 'italic', 'strike'],
                    ['hr', 'quote'],
                    ['ul', 'ol', 'task', 'indent', 'outdent'],
                    ['table', 'link']
                ]}
                ref={editorRef}
                initialValue="직접 여행 계획을 작성해보세요!"
                previewStyle="tab"
                height="800px"
                initialEditType="markdown"
                useCommandShortcut={true}
                hideModeSwitch="true"
                language="ko-KR"
            />
            {/* <button onClick={handleGetContent}>내용 가져오기</button> */}
        </div>
    );
}
