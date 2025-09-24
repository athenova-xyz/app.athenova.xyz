'use client';
import React, { useEffect, useState } from 'react';

export default function MyEditor() {
  const [EditorComp, setEditorComp] = useState<React.ReactNode>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ useCreateBlockNote }, { BlockNoteView }] = await Promise.all([
        import('@blocknote/react'),
        import('@blocknote/mantine')
      ]);
      if (!active) return;
      const EditorInner = () => {
        const editor = useCreateBlockNote();
        return <BlockNoteView editor={editor} />;
      };
      setEditorComp(<EditorInner />);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className='min-h-[400px]'>
      {EditorComp || <div className='p-4 text-sm text-muted-foreground animate-pulse'>Loading editor…</div>}
    </div>
  );
}
