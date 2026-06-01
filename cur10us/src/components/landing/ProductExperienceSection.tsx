"use client"

import { motion } from "framer-motion"
import {
  BarChart3,
  Route,
  Swords,
  Users,
  ShoppingBag,
  Compass,
} from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Academic Dashboard",
    description:
      "Real-time visibility into grades, attendance, skill mastery and growth trends — for students, teachers and parents.",
    color: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  {
    icon: Route,
    title: "Personalized Journey",
    description:
      "Each student gets a tailored learning path based on their strengths, weaknesses and aspirations — updated dynamically.",
    color: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    icon: Swords,
    title: "Challenges & Competitions",
    description:
      "Academic challenges, quizzes and tournaments that make learning engaging, social and rewarding.",
    color: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  {
    icon: Users,
    title: "Educational Communities",
    description:
      "Connect students with peers, mentors and alumni who share the same academic interests and career goals.",
    color: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
  {
    icon: ShoppingBag,
    title: "Academic Marketplace",
    description:
      "Access learning resources, tutoring services, study materials and tools — all within the ecosystem.",
    color: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
  },
  {
    icon: Compass,
    title: "Career Guidance",
    description:
      "Personality assessments, skill mapping, internship matching and career path visualization for every student.",
    color: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
}

export default function ProductExperienceSection() {
  return (
    <section id="product" className="py-24 sm:py-32 bg-warm-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-2xl mb-16"
        >
          <span className="text-xs font-semibold text-amber-brand uppercase tracking-widest mb-4 block">
            Product Experience
          </span>
          <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight text-charcoal leading-[1.1]">
            Everything a student needs
            <br />
            <span className="text-warm-gray">to grow, compete and thrive.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                variants={item}
                className={`group p-7 rounded-2xl bg-cream border ${f.border} hover:shadow-lg hover:shadow-amber-brand/5 transition-all duration-300`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-5.5 h-5.5 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-charcoal mb-3">{f.title}</h3>
                <p className="text-sm text-warm-gray leading-relaxed">{f.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
