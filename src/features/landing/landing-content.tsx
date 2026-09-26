import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageSquareOff, ShieldCheck, Star, UserX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_LABEL } from "@/lib/labels";
import { categoryStyle } from "@/components/ui/category";
import { ChalkCheck, ChalkUnderline } from "@/components/ui/chalk";
import { Tisa } from "@/components/illustrations/tisa";
import { CATEGORY_ART, DeliverArt, HireArt, PostArt, RateArt } from "@/components/illustrations/scenes";
import { HeroBoard, type BoardSlip, type BoardStats } from "./hero-board";

const CATEGORIES = [
  { value: "ACADEMIC", blurb: "Tutoring and study help: explaining, never doing someone's graded work." },
  { value: "TECHNICAL", blurb: "Code, design, websites, fixing laptops and phones." },
  { value: "GENERAL_ERRANDS", blurb: "Pick-ups, printing, deliveries and campus runs." },
  { value: "ADMINISTRATIVE", blurb: "Encoding, documents, forms and event help." },
];

const STEPS = [
  { art: PostArt, title: "Post what you need", text: "A title, a fare in pesos and a deadline. Classmates see it on the board right away." },
  { art: HireArt, title: "Hire, then agree", text: "Compare applicants' ratings and work, pick one, and both accept a short agreement." },
  { art: DeliverArt, title: "Get the delivery", text: "They upload the work. Approve it, or ask for a revision, all in one place." },
  { art: RateArt, title: "Complete and rate", text: "You both rate each other, so good reputations are earned and kept." },
];

const THEM = [
  { icon: UserX, text: "Anyone can comment, including people who aren't students." },
  { icon: MessageSquareOff, text: "Deals get buried in comments and DMs, with no record." },
  { icon: X, text: "Ghosting costs nothing, and scammers just make a new account." },
];
const US = [
  "Only @carsu.edu.ph accounts, and only CCIS-verified students can take work.",
  "A written agreement on scope, fare and deadline before work starts.",
  "Two-way ratings that stay with each person, and reports that admins review.",
];

/** The landing page below the header. Every number and commission on it is real data. */
export function LandingContent({ slips, stats, openByCategory }: { slips: BoardSlip[]; stats: BoardStats; openByCategory: Record<string, number> }) {
  return (
    <>
      <section className="paper-dots border-b border-line">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-hero lg:gap-14 lg:pb-20 lg:pt-16">
          <div>
            <h1 className="display text-4xl sm:text-5xl lg:text-6xl">
              Get it done by a{" "}
              <span className="relative inline-block text-brand-600">
                fellow
                <ChalkUnderline className="absolute -bottom-2 left-0 h-3.5 w-full text-gold-500" delay={300} />
              </span>{" "}
              CSU Main student.
            </h1>
            <p className="mt-6 max-w-prose text-lg text-muted">
              Post a task, hire a classmate who&apos;s good at it, and pay what you both agreed. Tutoring, tech work, errands and paperwork, all inside campus.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/hiring/post" className="btn-primary px-6 py-3 text-base">Post a commission</Link>
              <Link href="/browse" className="btn-secondary px-6 py-3 text-base">
                Browse the board <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted">
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand-600" /> @carsu.edu.ph accounts only</li>
              <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-brand-600" /> CCIS-verified sellers</li>
              <li className="flex items-center gap-1.5"><Star className="h-4 w-4 text-gold-600" /> Ratings both ways</li>
            </ul>
          </div>
          <HeroBoard slips={slips} stats={stats} />
        </div>
      </section>

      <section id="how-it-works" aria-labelledby="how" className="reveal mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
        <h2 id="how" className="display max-w-xl text-3xl sm:text-4xl">From a slip on the board to a job well done</h2>
        <ol className="relative mt-10 grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-6">
          {/* The dashed path that connects the steps: across on desktop, down on phones. */}
          <span aria-hidden className="absolute left-12 top-4 hidden h-0 w-3/4 border-t-4 border-dashed border-line-strong lg:block" />
          <span aria-hidden className="absolute bottom-10 left-12 top-10 w-0 border-l-4 border-dashed border-line-strong lg:hidden" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative flex gap-5 lg:flex-col lg:gap-4">
              <span className="relative z-10 grid h-24 w-24 shrink-0 place-items-center rounded-3xl border-2 border-line bg-surface shadow-card lg:h-28 lg:w-28">
                <s.art className="h-16 w-20 lg:h-20 lg:w-24" />
                <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-gold-400 font-display text-sm font-extrabold text-on-gold shadow-soft">{i + 1}</span>
              </span>
              <div>
                <h3 className="font-display text-xl font-bold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="categories" className="reveal border-y border-line bg-sunken/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="categories" className="display text-3xl sm:text-4xl">What classmates are posting</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map(({ value, blurb }) => {
              const Art = CATEGORY_ART[value];
              const s = categoryStyle(value);
              const open = openByCategory[value] ?? 0;
              return (
                <Link key={value} href={`/browse?category=${value}`} className="lift group flex flex-col overflow-hidden rounded-3xl border-2 border-line bg-surface">
                  <span className={cn("flex h-36 items-center justify-center", s.tile)}>
                    <Art className="h-28 w-36 transition-transform duration-300 ease-out group-hover:-rotate-2 group-hover:scale-105" />
                  </span>
                  <span className="flex flex-1 flex-col p-5">
                    <span className={cn("font-display text-xl font-bold", s.text)}>{CATEGORY_LABEL[value]}</span>
                    <span className="mt-1 flex-1 text-sm text-muted">{blurb}</span>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                      {open > 0 ? `${open} open now` : "Be the first to post"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="facebook" className="reveal mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 id="facebook" className="display max-w-2xl text-3xl sm:text-4xl">Why not just post in a Facebook group?</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border-2 border-dashed border-line-strong bg-surface p-6 sm:p-8">
            <p className="font-display text-lg font-bold text-muted">A post in a group chat or page</p>
            <ul className="mt-4 space-y-3">
              {THEM.map((t) => (
                <li key={t.text} className="flex gap-3 text-muted">
                  <t.icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-coral-500" />
                  {t.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="board rounded-3xl border-4 border-board-deep p-6 sm:p-8">
            <p className="font-display text-lg font-bold text-board-chalk">A slip on CarSUComits</p>
            <ul className="mt-4 space-y-3">
              {US.map((t, i) => (
                <li key={t} className="flex gap-3 text-board-chalk">
                  <ChalkCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold-400" delay={200 + i * 180} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="integrity" className="reveal mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="relative flex flex-col items-center gap-6 rounded-3xl border-2 border-gold-300 bg-gold-50 p-6 text-center shadow-card sm:flex-row sm:p-10 sm:text-left">
          <Tisa pose="hold" className="h-32 w-32" />
          <div>
            <h2 id="integrity" className="display text-2xl text-ink sm:text-3xl">Tutoring, yes. Doing someone&apos;s graded work, no.</h2>
            <p className="mt-2 max-w-prose text-ink">
              Explaining a lesson or reviewing your own draft is welcome. Writing a thesis, capstone, research paper or taking an exam for someone isn&apos;t,
              and posts that ask for it go to admins for review.
            </p>
            <Link href="/terms#academic-work" className="mt-3 inline-flex items-center gap-1 font-semibold text-brand-700 underline">
              Read the academic work rule <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="start" className="board border-y-4 border-board-deep">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Tisa pose="wave" className="h-24 w-24" />
            <h2 id="start" className="display text-3xl text-board-chalk sm:text-4xl">Got a task? Put it on the board.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/hiring/post" className="btn bg-gold-400 px-6 py-3 text-base text-on-gold shadow-soft hover:bg-gold-300 focus-visible:ring-gold-400 focus-visible:ring-offset-board">
              Post a commission
            </Link>
            <Link href="/browse" className="btn-chalk px-6 py-3 text-base">Find work</Link>
          </div>
        </div>
      </section>
    </>
  );
}
