"use client";

import { useEffect, useRef } from 'react';
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';

interface EditorProps {
    value: string;
    onChange: (content: string) => void;
}

const Editor = ({ value, onChange }: EditorProps) => {
    const editorRef = useRef<any>(null);

    return (
        <TinyMCEEditor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            onInit={(evt, editor) => editorRef.current = editor}
            value={value}
            init={{
                height: 460,
                menubar: false,
                placeholder: 'Write the article here. Use headings to give the story a clear structure.',
                plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | bold italic | bullist numlist | blockquote | link | removeformat',
                content_style: 'body { max-width: 760px; margin: 28px auto; padding: 0 28px; color: #343531; background: #f7f6f2; font-family: Georgia, serif; font-size: 17px; line-height: 1.9 } h2,h3,h4 { color: #20211f; font-weight: 400; line-height: 1.2 } p { margin: 0 0 1.4em }',
                skin: 'oxide',
                content_css: 'default',
            }}
            onEditorChange={(content) => {
                onChange(content);
            }}
        />
    );
};

export default Editor;
