import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="glass p-12 rounded-3xl border border-gray-700 shadow-2xl animate-in">
        <div className="bg-gray-800 p-6 rounded-2xl w-fit mx-auto mb-8">
          <FileQuestion size={64} className="text-blue-500" />
        </div>
        <h1 className="text-6xl font-extrabold text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-300 mb-6">عذراً، الصفحة غير موجودة</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          يبدو أنك حاولت الوصول إلى صفحة غير موجودة أو تم نقلها. يمكنك العودة للصفحة الرئيسية.
        </p>
        <Link href="/">
          <Button variant="primary" size="lg" icon={<Home size={20} />}>
            العودة للرئيسية
          </Button>
        </Link>
      </div>
    </div>
  );
}
