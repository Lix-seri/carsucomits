import { ChalkCheck } from "@/components/ui/chalk";
import { Tisa } from "@/components/illustrations/tisa";

const POINTS = ["Only @carsu.edu.ph accounts", "CCIS-verified students take the work", "Ratings both ways, reports reviewed by admins"];

/** The board panel beside the sign-in and register forms (a slim strip on phones). */
export function AuthAside({ title }: { title: string }) {
  return (
    <aside className="board flex flex-col justify-center gap-6 rounded-3xl border-4 border-board-deep p-6 sm:p-10 lg:min-h-full">
      <div className="flex items-center gap-4 lg:block">
        <Tisa pose="wave" className="h-20 w-20 lg:h-40 lg:w-40" />
        <p className="display text-2xl text-board-chalk lg:mt-6 lg:text-4xl">{title}</p>
      </div>
      <ul className="hidden space-y-3 lg:block">
        {POINTS.map((p, i) => (
          <li key={p} className="flex items-start gap-3 text-board-chalk">
            <ChalkCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold-400" delay={200 + i * 160} />
            {p}
          </li>
        ))}
      </ul>
    </aside>
  );
}
