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
    <footer className="border-t border-[#96C3DF] bg-[#B0E0E6] py-6 sm:py-8">
      <div className="section-container flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-2 max-w-sm">
            <GetHireLogo to="/" size="md" />
            <p className="text-xs text-[#1E3A5F] font-medium leading-relaxed">
              AI Interview Intelligence Platform. Skill-aware practice, live simulation, and calibrated STAR evaluation for serious candidates.
            </p>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#142642]">Product</h4>
            <ul className="flex flex-col gap-1.5">
              {footerLinks.Product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-xs text-[#1E3A5F] hover:text-[#0C1B33] font-medium transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#142642]">Platform</h4>
            <ul className="flex flex-col gap-1.5">
              {footerLinks.Platform.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-xs text-[#1E3A5F] hover:text-[#0C1B33] font-medium transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-3 border-t border-[#1E3A5F]/20 flex items-center justify-between text-xs text-[#1E3A5F] font-medium">
          <p>© {new Date().getFullYear()} GetHire, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
