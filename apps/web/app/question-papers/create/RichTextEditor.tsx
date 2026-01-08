import React, { useRef, useEffect, memo } from 'react';

export const RichTextEditor = memo(({ initialValue, onChange }: { initialValue: string, onChange: (val: string) => void }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isFirstRender = useRef(true);

    // Sync from props (external updates like loading saved paper)
    // We strictly avoid updating if the editor is focused to prevent cursor jumps during typing.
    useEffect(() => {
        if (editorRef.current) {
            if (isFirstRender.current) {
                editorRef.current.innerHTML = initialValue;
                isFirstRender.current = false;
            } else if (document.activeElement !== editorRef.current && editorRef.current.innerHTML !== initialValue) {
                editorRef.current.innerHTML = initialValue;
            }
        }
    }, [initialValue]);

    return (
        <div 
            ref={editorRef}
            className="editor-area" 
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={(e) => onChange(e.currentTarget.innerHTML)}
        >
        </div>
    );
});
RichTextEditor.displayName = 'RichTextEditor';
