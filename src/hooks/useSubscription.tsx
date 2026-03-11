import { useState, useEffect } from 'react';
import { subscriptionService } from '@/services/api';
import { Crown, Zap } from 'lucide-react';
import { PricingPlan } from '@/components/ui/PricingCard';

export function useSubscription(fetchOnMount: boolean = true) {
  const [status, setStatus] = useState<any>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(fetchOnMount);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch plans first (usually public or doesn't throw 401 if done right, 
      // but we still catch errors individually just in case)
      try {
        const plansRes = await subscriptionService.getPlans();
        if (plansRes.status) {
          const fetchedPlans = plansRes.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            icon: p.price > 200 ? <Crown className="w-8 h-8" /> : <Zap className="w-8 h-8" />,
            features: p.features && p.features.length > 0 ? p.features : [
              `حد أقصى ${p.limits.maxItems} منتج`,
              `${p.limits.maxSales} عملية بيع/شراء شهرياً`,
              `${p.limits.maxExpenses} عملية تسجيل مصروفات`
            ],
            color: p.price > 200 ? 'amber' : 'blue',
            popular: p.price > 200
          }));
          setPlans(fetchedPlans);
        }
      } catch (planError: any) {
        if (planError.response?.status !== 401 && planError.response?.status !== 403) {
          console.warn('Failed to fetch plans', planError?.message || planError);
        }
      }

      // Fetch status only if fetchOnMount is explicitly true (i.e. we are authenticated)
      if (fetchOnMount && typeof fetchOnMount === 'boolean') {
        try {
          const statusRes = await subscriptionService.getStatus();
          if (statusRes.status) setStatus(statusRes.data);
        } catch (statusError: any) {
          // Ignore 401/403 errors for status as it just means the user isn't subscribed/logged in
          if (statusError.response?.status !== 401 && statusError.response?.status !== 403) {
            console.warn('Failed to fetch subscription status', statusError?.message || statusError);
          }
        }
      }

    } catch (error: any) {
      console.warn('General subscription fetch error', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnMount]);

  return { status, plans, loading, refetch: fetchData };
}
