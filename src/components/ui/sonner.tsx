'use client';

// Minimal toast wrapper used as a drop-in for sonner-style API.
// Replace with the real `sonner` library and a global Toaster if you prefer.
export const toast = {
  success: (message: string) => {
    console.log('Toast success:', message);
  },
  error: (message: string) => {
    console.error('Toast error:', message);
  }
};

export function Toaster() {
  // Placeholder for a global toast container. If you install `sonner`, render its Toaster here.
  return null;
}

export default toast;
