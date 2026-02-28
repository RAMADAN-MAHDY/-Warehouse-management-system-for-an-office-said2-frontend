'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="glass p-12 rounded-3xl border border-red-900/50 shadow-2xl animate-in">
        <div className="bg-red-900/20 p-6 rounded-2xl w-fit mx-auto mb-8">
          <AlertCircle size={64} className="text-red-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4">حدث خطأ غير متوقع</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
          عذراً، حدثت مشكلة تقنية أثناء معالجة طلبك. لقد تم تسجيل الخطأ وسنعمل على حله.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="danger" 
            size="lg" 
            icon={<RefreshCcw size={20} />}
            onClick={() => reset()}
          >
            حاول مرة أخرى
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" icon={<Home size={20} />}>
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
