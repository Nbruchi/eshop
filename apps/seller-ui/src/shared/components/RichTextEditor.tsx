'use client';

import 'react-quill-new/dist/quill.snow.css';
import ReactQuill from 'react-quill-new';
import { useEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor = ({ value, onChange }: Props) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const quillRef = useRef(false);

  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = true;

      setTimeout(() => {
        document.querySelectorAll('.ql-toolbar').forEach((toolbar, index) => {
          if (index > 0) {
            toolbar.remove();
          }
        });
      }, 100);
    }
  }, []);

  return (
    <div className="relative">
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={{
          toolbar: [
            [{ font: [] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ align: [] }],
            ['clean'],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
          ],
        }}
        placeholder="Write a detailed product description here..."
        className="bg-transparent border border-gray-700 text-white rounded-md"
        style={{ minHeight: '250px' }}
      />
      <style>
        {`
        .ql-toolbar{
        background:transparent;
        border-color:#444;
        }

        .ql-container{
        background:transparent !important;
        border-color:#444;
        color:#fff;
        }

        .ql-picker{
        color:#fff !important;
        }

        .ql-editor{
        min-height:200px;
        }

        .ql-snow{
        border-color:#444 !important;
        }

        .ql-editor.ql-blank::before{
        color:#aaa !important;
        }

        .ql-picker-options{
        background: #333 !important;
        color:#fff !important;
        }

        .ql-picker-item{
        color:#fff !important;
        }

        .ql-picker-label{
        color:#fff !important;
        }

        .ql-stroke{
        stroke:#fff !important;
        }

        .ql-fill{
        fill:#fff !important;
        }
        `}
      </style>
    </div>
  );
};

export default RichTextEditor;
