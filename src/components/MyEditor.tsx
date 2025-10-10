'use client';
import dynamic from 'next/dynamic';
import React from 'react';

const BlockNoteEditor = dynamic(
  async () => {
    const [{ useCreateBlockNote }, { BlockNoteView }] = await Promise.all([
      import('@blocknote/react'),
      import('@blocknote/mantine')
    ]);
    const EditorInner = (props: any) => {
      const editor = useCreateBlockNote();
      return <BlockNoteView editor={editor} {...props} />;
    };
    return EditorInner;
  },
  {
    ssr: false,
    loading: () => (
      <textarea
        className='min-h-[400px] w-full p-4 text-sm text-muted-foreground border rounded-md bg-gray-100 resize-none'
        placeholder='Loading editor...'
        disabled
      />
    ),
  }
);

export default function MyEditor(props: any) {
  return (
    <div className='min-h-[400px]'>
      <BlockNoteEditor {...props} />
    </div>
  );
}
