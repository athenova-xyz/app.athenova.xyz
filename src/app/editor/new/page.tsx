'use client';
import MyEditor from '@/components/MyEditor';

export default function Page() {
  return (
    <main className='max-w-4xl mx-auto px-4 py-10 space-y-4'>
      <h1 className='text-xl font-semibold'>Editor</h1>

      <MyEditor />
    </main>
  );
}
