import React, { useState } from "react";
import {
  Code2,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  FileText,
  Calendar,
  Building2,
  ExternalLink,
} from "lucide-react";
import type { ParsedResumeData } from "@/services/resumeApi";

interface ParsedDataViewerProps {
  parsedData: ParsedResumeData;
  rawText?: string;
}

type TabType = "skills" | "experience" | "projects" | "education" | "raw";

export const ParsedDataViewer: React.FC<ParsedDataViewerProps> = ({
  parsedData,
  rawText,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("skills");

  const tabs = [
    { id: "skills", label: "Skills & Tech", icon: Code2, count: parsedData.skills.length },
    { id: "experience", label: "Work History", icon: Briefcase, count: parsedData.experience.length },
    { id: "projects", label: "Projects", icon: FolderGit2, count: parsedData.projects.length },
    { id: "education", label: "Education & Certs", icon: GraduationCap, count: parsedData.education.length + parsedData.certifications.length },
    { id: "raw", label: "Extracted Text", icon: FileText },
  ];

  return (
    <div
      className="w-full rounded-2xl flex flex-col overflow-hidden"
      style={{
        background: "rgba(17, 17, 21, 0.75)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 p-2 overflow-x-auto border-b border-white/[0.06] bg-black/20">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-gold-400/15 text-gold-300 border border-gold-400/30 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-gold-400" : "text-neutral-400"}`} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-gold-400/30 text-gold-200" : "bg-white/10 text-neutral-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="p-6">
        {/* 1. Skills Tab */}
        {activeTab === "skills" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Identified Technical Skills ({parsedData.skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {parsedData.skills.length > 0 ? (
                  parsedData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500">No primary skills extracted.</p>
                )}
              </div>
            </div>

            {parsedData.technologies.length > 0 && (
              <div className="flex flex-col gap-2 pt-4 border-t border-white/[0.06]">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Tools & Technologies Stack ({parsedData.technologies.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {parsedData.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/10 text-neutral-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Experience Tab */}
        {activeTab === "experience" && (
          <div className="flex flex-col gap-4">
            {parsedData.experience.length > 0 ? (
              parsedData.experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gold-400" />
                      <h4 className="text-sm font-bold text-neutral-100">{exp.role}</h4>
                      <span className="text-xs text-neutral-400">• {exp.company}</span>
                    </div>
                    {exp.duration && (
                      <div className="inline-flex items-center gap-1 text-[11px] text-neutral-400 bg-white/[0.04] px-2.5 py-0.5 rounded-full w-fit">
                        <Calendar className="h-3 w-3" />
                        <span>{exp.duration}</span>
                      </div>
                    )}
                  </div>
                  {exp.bullets.length > 0 && (
                    <ul className="flex flex-col gap-1.5 pl-4 list-disc text-xs text-neutral-300">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 py-4 text-center">No explicit work experience entries extracted.</p>
            )}
          </div>
        )}

        {/* 3. Projects Tab */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedData.projects.length > 0 ? (
              parsedData.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-gold-400/20 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                        <FolderGit2 className="h-4 w-4 text-emerald-400" />
                        {proj.title}
                      </h4>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-400 hover:text-gold-400 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    {proj.description && <p className="text-xs text-neutral-300 leading-relaxed">{proj.description}</p>}
                    {proj.bullets.length > 0 && (
                      <ul className="flex flex-col gap-1 pl-4 list-disc text-xs text-neutral-400">
                        {proj.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                      {proj.technologies.map((t, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 text-neutral-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="col-span-2 text-xs text-neutral-500 py-4 text-center">No projects detected in this resume.</p>
            )}
          </div>
        )}

        {/* 4. Education & Certs Tab */}
        {activeTab === "education" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Education</h4>
              {parsedData.education.length > 0 ? (
                parsedData.education.map((edu, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-neutral-100">{edu.degree}</h5>
                      <p className="text-xs text-neutral-400">{edu.institution}</p>
                    </div>
                    <div className="text-right">
                      {edu.graduation_year && <span className="text-xs text-gold-300 font-semibold">{edu.graduation_year}</span>}
                      {edu.gpa && <p className="text-[11px] text-neutral-400">GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500">No education entries found.</p>
              )}
            </div>

            {parsedData.certifications.length > 0 && (
              <div className="flex flex-col gap-3 pt-4 border-t border-white/[0.06]">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Certifications & Licenses</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parsedData.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gold-400" />
                        <span className="text-xs font-semibold text-neutral-200">{cert.name}</span>
                      </div>
                      {cert.year && <span className="text-[10px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded">{cert.year}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. Raw Text Tab */}
        {activeTab === "raw" && (
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 max-h-96 overflow-y-auto font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
            {rawText || "No raw text available."}
          </div>
        )}
      </div>
    </div>
  );
};
