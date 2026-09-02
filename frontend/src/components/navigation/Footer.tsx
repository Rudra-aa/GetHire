import { GetHireLogo } from "@/components/common/GetHireLogo";

const footerLinks = {
  Product: [
    { label: "Features",     href: "#overview"     },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Architecture", href: "#architecture" },
    { label: "AI Engine",    href: "#ai-engine"    },
    { label: "Live Demo",    href: "#demo"         },
  ],
  Platform: [
    { label: "ResumeIQ",       href: "#resume-intelligence" },
    { label: "Multi-Signal",   href: "#evaluation"          },
    { label: "Candidate Hub",  href: "#dashboard"           },
    { label: "Security",       href: "#technology"          },
    { label: "FAQ",            href: "#faq"                 },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-black/40 backdrop-blur-md py-16">
      <div className="section-container flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-4 max-w-sm">
            <GetHireLogo to="/" size="md" />
            <p className="text-xs text-neutral-400 leading-relaxed">
              AI Interview Intelligence Platform. Skill-aware practice, live simulation, and calibrated STAR evaluation for serious candidates.
            </p>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Product</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.Product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-xs text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Platform</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.Platform.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-xs text-neutral-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} GetHire, Inc. All rights reserved.</p>
          <p className="font-mono text-[11px]">v3.0.0 · React 18 · TypeScript · Tailwind CSS · Framer Motion</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
