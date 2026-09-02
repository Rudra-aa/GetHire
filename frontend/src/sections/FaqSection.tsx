import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Search } from "lucide-react";

const faqs = [
  {
    q: "How does GetHire adapt interview questions to my specific resume?",
    a: "Our NLP pipeline extracts projects, architectural choices, and tech stacks directly from your uploaded resume. These entities are matched against our curated knowledge base to synthesize realistic situational prompts and technical follow-ups tailored to your seniority.",
  },
  {
    q: "Is camera or microphone access mandatory to use GetHire?",
    a: "No. You can practice in pure text simulation mode, voice-only mode, or full multimodal mode with webcam analysis. All webcam landmark processing runs locally with zero persistent storage.",
  },
  {
    q: "How is the HireScore calculated?",
    a: "HireScore is a composite readiness index combining technical algorithmic accuracy, STAR framework completeness, trade-off depth, speech pacing, and delivery composure calibrated against L4/L5/L6 senior engineering standards.",
  },
  {
    q: "What engineering domains and topics are supported?",
    a: "GetHire covers 24 domains including System Design, Distributed Systems, Algorithms & Data Structures, Backend Architecture (Go, Python, Java, Node.js), Frontend Architecture (React, TypeScript), Databases & Caching (PostgreSQL, Redis, Kafka), and DevOps.",
  },
  {
    q: "Is my resume data stored permanently?",
    a: "No. You can enable Zero Data Retention mode where resume files, extracted entities, and mock voice transcripts are immediately purged from memory upon session conclusion.",
  },
];

export const FaqSection = memo(function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return faqs;
    const term = searchTerm.toLowerCase();
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  return (
    <section id="faq" className="section-padding bg-bg-secondary relative overflow-hidden">
      <div className="section-container">
        {/* Header */}
        <div className="max-w-[620px] mb-12">
          <div className="eyebrow-pill mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Frequently Asked Questions
          </div>
          <h2 className="text-display font-black tracking-tight text-white">
            Everything You Need <br />
            <span className="gradient-text-luxury">To Know About GetHire</span>
          </h2>
        </div>

        {/* Search Input */}
        <div className="max-w-md mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161D2C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl flex flex-col gap-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.q}
                className="glass-card-luxury rounded-2xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-bold text-white">{faq.q}</span>
                  <span className="h-7 w-7 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 text-neutral-400">
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-5 pb-5 text-xs text-neutral-400 leading-relaxed border-t border-white/5 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default FaqSection;
