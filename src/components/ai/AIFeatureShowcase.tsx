'use client';

import { motion } from 'framer-motion';
import { Cpu, Sparkles, ShieldCheck, Waves, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const cards = [
  {
    title: 'فهم الطلب الذكي',
    description: 'تحليل فوري للأسئلة والنوايا أمامك للحصول على نتائج دقيقة وسريعة.',
    accent: 'ميتا داتا تفاعلية',
  },
  {
    title: 'أوامر كتابية',
    description: 'أحدّث أسئلتك بشكل طبيعي، وخلّي الذكاء الاصطناعي يرد بوضوح واحترافية.',
    accent: 'تجربة محادثة سلسة',
  },
  {
    title: 'اقتراحات تقارير',
    description: 'تحويل بياناتك لملاحظات عمل ذكية وتقارير مُلخّصة تلقائياً.',
    accent: 'تحليلات جاهزة للقرار',
  }
];

export default function AIFeatureShowcase() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [angle, setAngle] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -18;
      setAngle({ x, y });
    };

    const handleLeave = () => setAngle({ x: 0, y: 0 });

    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseleave', handleLeave);

    return () => {
      container.removeEventListener('mousemove', handleMove);
      container.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_30%)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 text-right" dir="rtl">
        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-200 font-medium">
              <Sparkles className="w-4 h-4" />
              ميزة AI جديدة بالكامل
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              دردش مع الذكاء الاصطناعي بلمسة احترافية، وحول بياناتك لإجابات مباشرة.
            </h2>
            <p className="max-w-xl text-gray-400 text-lg leading-8">
              واجهة AI متطورة تقدم لك حواراً ذكياً، أدوات تحليل عميق، وإمكانيات جديدة داخل النظام بدون أي تعقيد.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureBlock icon={<Cpu className="w-5 h-5" />} title="تحليل أسرع" description="استفادة من الذكاء الاصطناعي لتفسير البيانات والردود بسرعة مبهرة." />
              <FeatureBlock icon={<Waves className="w-5 h-5" />} title="عناصر تفاعلية" description="إيحاءات مرئية وتقارير ذكية تساعدك على أخذ القرار بثقة." />
              <FeatureBlock icon={<ShieldCheck className="w-5 h-5" />} title="آمن ومستقر" description="التكامل مع نظام الاشتراكات يحافظ على حدود الاستخدام ويوفر حماية البيانات." />
              <FeatureBlock icon={<Star className="w-5 h-5" />} title="تصميم متميز" description="تجربة مستخدم فخمة مع واجهة AI مبتكرة ومفعمة بالحركة." />
            </div>
          </div>

          <div ref={containerRef} className="relative mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-black/60 p-6 shadow-2xl shadow-blue-500/10">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.18),_transparent_30%)]" />
            <div className="relative overflow-hidden rounded-[2rem] bg-[#050816]/90 p-6 backdrop-blur-xl">
              <div className="absolute -left-16 top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute -right-16 bottom-8 h-36 w-36 rounded-full bg-purple-500/10 blur-3xl" />

              <motion.div
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateX: angle.y, rotateY: angle.x }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="relative z-10"
              >
                <div className="grid gap-5">
                  {cards.map((card, index) => (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 32 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.45 }}
                      className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-950/95 to-slate-900/95 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.45)]"
                      style={{ transform: `translateZ(${(index + 1) * 10}px)` }}
                    >
                      <div className="absolute inset-x-6 top-0 h-1 bg-gradient-to-r from-blue-400/70 via-purple-400/40 to-cyan-300/0 blur-md" />
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">AI</span>
                      <h3 className="mt-4 text-xl font-bold text-white">{card.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-gray-400">{card.description}</p>
                      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-200">
                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                        {card.accent}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.96))]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureBlock({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-3 rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-sm shadow-black/10">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">{icon}</div>
      <div>
        <h4 className="text-base font-semibold text-white">{title}</h4>
        <p className="mt-1 text-sm leading-6 text-gray-400">{description}</p>
      </div>
    </div>
  );
}
