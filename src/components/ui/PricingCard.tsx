import React from 'react';
import { Check, Crown, Zap, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * @interface PricingPlan
 * @description تعريف هيكل بيانات خطة الأسعار
 */
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  features: string[];
  color: 'blue' | 'amber' | 'emerald';
  popular?: boolean;
}

/**
 * @interface PricingCardProps
 * @description الخصائص المطلوبة لمكون كارت خطة الأسعار
 */
interface PricingCardProps {
  plan: PricingPlan;
  currentPlanId?: string;
  isLoggedIn: boolean;
  onSubscribe?: (plan: PricingPlan) => void;
}

/**
 * @component PricingCard
 * @description مكون عرض كارت خطة الأسعار بتصميم احترافي
 */
const PricingCard: React.FC<PricingCardProps> = ({ plan, currentPlanId, isLoggedIn, onSubscribe }) => {
  const isCurrentPlan = currentPlanId === plan.id;

  const colorClasses = {
    blue: 'border-blue-500/50 bg-blue-500/5 text-blue-400',
    amber: 'border-amber-500/50 bg-amber-500/5 text-amber-400',
    emerald: 'border-emerald-500/50 bg-emerald-500/5 text-emerald-400',
  };

  const iconColors = {
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
  };

  return (
    <div
      className={`relative glass-card p-8 rounded-[2.5rem] border flex flex-col transition-all duration-300 hover:scale-[1.02] h-full ${plan.popular ? colorClasses[plan.color] : 'border-gray-700/50 bg-gray-800/20'
        }`}
    >
      {plan.popular && (
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider ${plan.color === 'amber' ? 'bg-amber-500' : plan.color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'
          }`}>
          الأكثر طلباً
        </div>
      )}

      <div className="mb-8 text-right">
        <div className={`mb-4 flex justify-end ${iconColors[plan.color]}`}>{plan.icon}</div>
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-end gap-1">
          <span className="text-4xl font-bold text-white">{plan.price}</span>
          <span className="text-gray-400 text-sm">جنيه / شهر</span>
        </div>
      </div>

      <div className="space-y-4 mb-10 flex-grow text-right">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-center justify-end gap-3 text-gray-300">
            <span>{feature}</span>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-white/10' : 'bg-gray-700/50'
              }`}>
              <Check className={`w-3 h-3 ${iconColors[plan.color]}`} />
            </div>
          </div>
        ))}
      </div>

      {!isLoggedIn ? (
        <Link href="/register" className="w-full">
          <Button variant="primary" className="w-full py-4 rounded-2xl text-lg font-bold">
            {plan.price === 0 ? 'ابدأ الآن مجاناً' : 'اشترك الآن'}
          </Button>
        </Link>
      ) : isCurrentPlan ? (
        <Button variant="outline" className="w-full py-4 rounded-2xl text-lg font-bold border-green-500/50 text-green-400 cursor-default">
          خطتك الحالية
        </Button>
      ) : (
        <Button
          variant={plan.popular ? 'primary' : 'outline'}
          className="w-full py-4 rounded-2xl text-lg font-bold"
          onClick={() => onSubscribe?.(plan)}
        >
          {plan.price === 0 ? 'تجربة مجانية' : 'ترقية الخطة'}
        </Button>
      )}
    </div>
  );
};

export default PricingCard;
