

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/redux/store";
import { useNavigate } from "react-router-dom";

export default function Landing(): JSX.Element {
  const user = useAppSelector(state => state.user.user);
  const navigate = useNavigate();

  if(user){
    navigate('/home');
  }
  
  return (
    <>
      <div className="flex flex-col font-Work-Sans bg-[#050816] text-white">
        <section className="w-full px-6 md:px-14 pt-12 md:pt-16 pb-10">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-indigo-300">
                AI Interview Prep Platform
              </div>
              <h1 className="mt-6 text-5xl md:text-7xl font-semibold leading-tight bg-gradient-to-r from-pink-500 via-violet-400 to-indigo-300 text-transparent bg-clip-text">
                Interview Smarter.
                <br />
                Excel Faster with AI.
              </h1>
              <p className="mt-6 max-w-2xl text-base md:text-lg text-slate-300 leading-8">
                Practice realistic mock interviews, review performance feedback,
                and track your progress over time. Interview.me helps you build
                confidence before the real conversation happens.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  className="shadow-2xl shadow-indigo-500/40"
                  variant="outline"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
                <a href="#features">
                  <Button className="shadow-2xl shadow-indigo-500/30" variant="outline">
                    Learn more
                  </Button>
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Modes</p>
                  <p className="mt-2 text-lg font-semibold text-white">Mock + Review</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Feedback</p>
                  <p className="mt-2 text-lg font-semibold text-white">Instant</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400">Tracking</p>
                  <p className="mt-2 text-lg font-semibold text-white">Progress</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-500/25 via-purple-500/15 to-pink-500/20 blur-3xl" />
              <div className="rounded-[2rem] border border-white/10 bg-[#0b1220] p-4 shadow-2xl shadow-indigo-500/20">
                <div className="flex items-center justify-between rounded-2xl bg-[#111827] px-4 py-3 border border-white/5">
                  <div>
                    <p className="text-sm text-slate-400">Today&apos;s focus</p>
                    <p className="text-lg font-semibold text-white">Behavioral Interview Practice</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Live AI
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-12 gap-4">
                  <div className="col-span-4 rounded-2xl bg-[#0f172a] border border-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Dashboard</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-300">
                      <div className="rounded-xl bg-white/5 px-3 py-2">Recent Interviews</div>
                      <div className="rounded-xl bg-white/5 px-3 py-2">Feedback</div>
                      <div className="rounded-xl bg-white/5 px-3 py-2">Performance</div>
                    </div>
                  </div>

                  <div className="col-span-8 rounded-2xl bg-[#0f172a] border border-white/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Preview</p>
                    <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-semibold">Mock Interview</p>
                        <p className="text-indigo-300 text-sm">Score 8.7/10</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        Receive structured follow-up questions, score breakdowns,
                        and concise recommendations to improve communication,
                        depth, and STAR responses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full px-6 md:px-14 py-10 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-semibold text-white">
                Built for interview prep that feels practical
              </h2>
              <p className="mt-4 text-slate-300 leading-8">
                Every section is designed to keep the experience clear, useful,
                and focused on the parts that actually help you improve.
              </p>
            </div>

            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-3xl border border-white/10 bg-[#0b1220] p-6">
                <h3 className="text-xl font-semibold text-white">Mock Interview</h3>
                <p className="mt-3 text-sm text-slate-300 leading-7">
                  Practice with AI-led conversations that simulate a real
                  interview and keep the pacing natural.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0b1220] p-6">
                <h3 className="text-xl font-semibold text-white">Essay Grader</h3>
                <p className="mt-3 text-sm text-slate-300 leading-7">
                  Review written responses with clear feedback that highlights
                  what works and what needs more detail.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0b1220] p-6">
                <h3 className="text-xl font-semibold text-white">Admission Boost</h3>
                <p className="mt-3 text-sm text-slate-300 leading-7">
                  Build confidence through structured practice that supports
                  better answers, stronger delivery, and more consistency.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0b1220] p-6">
                <h3 className="text-xl font-semibold text-white">Tailored Review</h3>
                <p className="mt-3 text-sm text-slate-300 leading-7">
                  Track performance across sessions so the dashboard shows
                  progress, trends, and actionable feedback over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full px-6 md:px-14 py-10 md:py-16">
          <div className="max-w-7xl mx-auto rounded-[2rem] border border-white/10 bg-[#0b1220] px-6 py-10 md:px-10 md:py-14 shadow-2xl shadow-indigo-500/10">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-semibold text-white">
                  Success is at your fingertips.
                </h2>
                <p className="mt-4 text-slate-300 leading-8">
                  Join the waitlist to stay updated on new features and future
                  improvements to Interview.me.
                </p>
              </div>

              <div className="flex w-full flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="bg-[#050816] border-white/10 text-white placeholder:text-slate-500"
                />
                <Button type="submit" className="text-white shadow-lg bg-[#050816] hover:bg-[#050816]/50">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col md:flex-row gap-4 w-full justify-between px-6 md:px-14 py-8 items-center border-t border-white/10 font-Work-Sans text-sm text-slate-400">
          <h1 className="bg-gradient-to-r from-pink-700 via-violet-500 to-indigo-600 text-transparent bg-clip-text text-xl font-bold">
            Interview.me
          </h1>
          <p className="text-center md:text-right">
            Copyright © 2024 Interview.me Industries, LLC. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
