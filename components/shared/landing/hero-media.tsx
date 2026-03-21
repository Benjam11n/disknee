import { Activity, Camera, CheckCircle2 } from 'lucide-react';

export function HeroMedia() {
  return (
    <div className="relative mx-auto max-w-lg lg:max-w-none">
      {/* Abstract sleek application window */}
      <div className="relative rounded-xl border border-border/40 bg-zinc-50 dark:bg-zinc-900/50 shadow-2xl p-2 backdrop-blur-xs">
        <div className="rounded-lg border border-border/40 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
          {/* Faux browser/app header */}
          <div className="flex items-center gap-2 border-b border-border/40 bg-zinc-50 dark:bg-zinc-900/30 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>
          </div>

          {/* Faux app content */}
          <div className="p-6 grid gap-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-sm text-zinc-500">Session Status</h3>
                <p className="text-xl font-semibold mt-1">Active Monitoring</p>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </div>
            </div>

            <div className="relative aspect-video rounded-lg border border-border/40 bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[12px_12px]" />
              <Camera className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />

              {/* Overlay tracking elements */}
              <div className="absolute top-1/2 left-1/3 w-3 h-3 border-2 border-primary rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-1/2 right-1/3 w-3 h-3 border-2 border-primary rounded-full transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/3 right-1/3 h-[2px] bg-primary/30 transform -translate-y-1/2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border/40 p-4 bg-zinc-50/50 dark:bg-zinc-900/30">
                <Activity className="h-5 w-5 text-blue-500 mb-2" />
                <p className="text-xs text-zinc-500">Form Accuracy</p>
                <p className="text-lg font-semibold">94%</p>
              </div>
              <div className="rounded-lg border border-border/40 p-4 bg-zinc-50/50 dark:bg-zinc-900/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-2" />
                <p className="text-xs text-zinc-500">Reps Completed</p>
                <p className="text-lg font-semibold">12 / 15</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
