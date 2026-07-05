"use client";

import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { jsPDF } from "jspdf";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clipboard,
  ClipboardCheck,
  Download,
  Edit3,
  FileText,
  Gauge,
  Goal,
  Landmark,
  ListChecks,
  Paperclip,
  Palette,
  PieChart,
  RefreshCcw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

type ReportSection = {
  title: string;
  icon: LucideIcon;
  content: string;
};

type MarketReport = {
  executiveSummary: string;
  marketAnalysis: string;
  targetAudience: string;
  revenueModel: string;
  risks: string;
  roadmap90Days: string;
  successScore: string;
  sources: string;
};

type PlanReport = {
  executiveSummary: string;
  businessModel: string;
  targetCustomer: string;
  revenueModel: string;
  roadmap90Days: string;
  risks: string;
  firstCustomerStrategy: string;
  kpiMetrics: string;
  successScore: string;
};

type MarketReportField = keyof MarketReport;
type PlanReportField = keyof PlanReport;

type ReportStreamEvent = Partial<MarketReport & PlanReport> & {
  done?: boolean;
};

type ReportFieldDefinition = {
  field: keyof (MarketReport & PlanReport);
  title: string;
  icon: LucideIcon;
};

type ChatMode = "plan" | "market";

type ChatAttachment = {
  id: string;
  name: string;
  size: number;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: ChatMode;
  attachments?: ChatAttachment[];
};

const workflowSteps = [
  "Analyzing business model...",
  "Researching market...",
  "Analyzing competitors...",
  "Calculating financial estimates...",
  "Building strategy...",
  "Writing final report...",
];

let pdfFontPromise: Promise<string> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function loadPdfFont() {
  pdfFontPromise ??= fetch("/fonts/Geist-Regular.ttf")
    .then((response) => {
      if (!response.ok) {
        throw new Error("PDF font could not be loaded.");
      }

      return response.arrayBuffer();
    })
    .then(arrayBufferToBase64);

  return pdfFontPromise;
}

function normalizePdfText(value: string) {
  return value
    .normalize("NFC")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[ \u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const reportActions = [
  { label: "Competitor Analysis", icon: Search },
  { label: "Financial Plan", icon: PieChart },
  { label: "Brand Strategy", icon: Palette },
];

const reportFields: Array<{
  field: MarketReportField;
  title: string;
  icon: LucideIcon;
}> = [
  { field: "executiveSummary", title: "Executive Summary", icon: Sparkles },
  { field: "marketAnalysis", title: "Market Analysis", icon: BarChart3 },
  { field: "targetAudience", title: "Target Audience", icon: Users },
  { field: "revenueModel", title: "Revenue Model", icon: Landmark },
  { field: "risks", title: "Risks", icon: ShieldAlert },
  { field: "roadmap90Days", title: "90-Day Roadmap", icon: CalendarDays },
  { field: "successScore", title: "AI Success Score (0-100)", icon: Gauge },
];

const planReportFields: Array<{
  field: PlanReportField;
  title: string;
  icon: LucideIcon;
}> = [
  { field: "executiveSummary", title: "Executive Summary", icon: Sparkles },
  { field: "businessModel", title: "Business Model", icon: BriefcaseBusiness },
  { field: "targetCustomer", title: "Target Customer", icon: Users },
  { field: "revenueModel", title: "Revenue Model", icon: Landmark },
  { field: "roadmap90Days", title: "90-Day Roadmap", icon: CalendarDays },
  { field: "risks", title: "Risks", icon: ShieldAlert },
  { field: "firstCustomerStrategy", title: "First Customer Strategy", icon: Goal },
  { field: "kpiMetrics", title: "KPI Metrics", icon: ListChecks },
  { field: "successScore", title: "AI Success Score", icon: Gauge },
];

const emptyMarketReport: MarketReport = {
  executiveSummary: "",
  marketAnalysis: "",
  targetAudience: "",
  revenueModel: "",
  risks: "",
  roadmap90Days: "",
  successScore: "",
  sources: "",
};

const emptyPlanReport: PlanReport = {
  executiveSummary: "",
  businessModel: "",
  targetCustomer: "",
  revenueModel: "",
  roadmap90Days: "",
  risks: "",
  firstCustomerStrategy: "",
  kpiMetrics: "",
  successScore: "",
};

function sanitizeReportContent(content: string) {
  return content
    .replace(/\n\s*(?:sources|kaynaklar)\s*:[\s\S]*$/im, "")
    .replace(/\[([^\]]+)\]\((?:https?:\/\/|www\.)[^\s)]+\)/gi, "$1")
    .replace(/(?:https?:\/\/|www\.)[^\s),]+/gi, "")
    .replace(/\(\s*\)/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function serializeReportSections(
  reportData: Partial<MarketReport & PlanReport>,
  fields: ReportFieldDefinition[]
) {
  return fields.map(({ field, title }) => ({
    title,
    content: sanitizeReportContent(reportData[field] || ""),
  }));
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-white/10 bg-black/70">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
        <span className="text-xs font-medium text-zinc-500">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <ClipboardCheck className="h-3.5 w-3.5 text-teal-200" />
          ) : (
            <Clipboard className="h-3.5 w-3.5 text-teal-200" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-6 text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={`${part}-${index}`}
              className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[0.92em] text-teal-100"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={`${part}-${index}`} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function MarkdownTable({ lines }: { lines: string[] }) {
  const rows = lines
    .filter((line) => line.includes("|"))
    .map((line) =>
      line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim())
    );
  const [header, separator, ...body] = rows;
  const bodyRows = separator?.every((cell) => /^:?-{3,}:?$/.test(cell))
    ? body
    : rows.slice(1);

  if (!header) {
    return null;
  }

  return (
    <div className="my-4 overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.04] text-zinc-200">
          <tr>
            {header.map((cell) => (
              <th key={cell} className="border-b border-white/10 px-4 py-3 font-semibold">
                <InlineMarkdown text={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-zinc-300">
          {bodyRows.map((row, rowIndex) => (
            <tr key={row.join("-") || rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className="px-4 py-3 align-top">
                  <InlineMarkdown text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const blocks = content.split(/```/g);

  return (
    <div className="space-y-3 text-sm leading-7 text-zinc-300">
      {blocks.map((block, blockIndex) => {
        if (blockIndex % 2 === 1) {
          const [language = "", ...codeLines] = block.replace(/^\n/, "").split("\n");
          return (
            <CodeBlock
              key={`code-${blockIndex}`}
              language={language.trim()}
              code={codeLines.join("\n").trimEnd()}
            />
          );
        }

        const lines = block.split("\n");
        const elements: ReactNode[] = [];
        let paragraph: string[] = [];
        let table: string[] = [];
        let list: string[] = [];

        const flushParagraph = () => {
          if (paragraph.length === 0) {
            return;
          }

          elements.push(
            <p key={`p-${blockIndex}-${elements.length}`} className="whitespace-pre-wrap">
              <InlineMarkdown text={paragraph.join("\n")} />
            </p>
          );
          paragraph = [];
        };

        const flushTable = () => {
          if (table.length === 0) {
            return;
          }

          elements.push(
            <MarkdownTable key={`table-${blockIndex}-${elements.length}`} lines={table} />
          );
          table = [];
        };

        const flushList = () => {
          if (list.length === 0) {
            return;
          }

          elements.push(
            <ul
              key={`list-${blockIndex}-${elements.length}`}
              className="space-y-2 pl-5 text-zinc-300"
            >
              {list.map((item) => (
                <li key={item} className="list-disc">
                  <InlineMarkdown text={item.replace(/^[-*]\s+/, "")} />
                </li>
              ))}
            </ul>
          );
          list = [];
        };

        lines.forEach((line) => {
          if (!line.trim()) {
            flushParagraph();
            flushTable();
            flushList();
            return;
          }

          if (line.startsWith("### ")) {
            flushParagraph();
            flushTable();
            flushList();
            elements.push(
              <h4 key={`h4-${blockIndex}-${elements.length}`} className="pt-2 text-base font-semibold text-white">
                <InlineMarkdown text={line.slice(4)} />
              </h4>
            );
            return;
          }

          if (line.startsWith("## ")) {
            flushParagraph();
            flushTable();
            flushList();
            elements.push(
              <h3 key={`h3-${blockIndex}-${elements.length}`} className="pt-2 text-lg font-semibold text-white">
                <InlineMarkdown text={line.slice(3)} />
              </h3>
            );
            return;
          }

          if (/^[-*]\s+/.test(line)) {
            flushParagraph();
            flushTable();
            list.push(line);
            return;
          }

          if (line.includes("|") && line.trim().startsWith("|")) {
            flushParagraph();
            flushList();
            table.push(line);
            return;
          }

          flushTable();
          flushList();
          paragraph.push(line);
        });

        flushParagraph();
        flushTable();
        flushList();

        return elements;
      })}
    </div>
  );
}

function SourceCards() {
  const sources = [
    "Live market research",
    "Competitive signals",
    "Financial assumptions",
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {sources.map((source) => (
        <div
          key={source}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300"
        >
          <p className="font-medium text-white">{source}</p>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Used to ground this response.
          </p>
        </div>
      ))}
    </div>
  );
}

function WorkflowPanel({
  active,
  completedSteps,
}: {
  active: boolean;
  completedSteps: number;
}) {
  if (!active && completedSteps === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-teal-300/70">
            LIVE AI WORKFLOW
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            ZERINIX is building the answer step by step.
          </p>
        </div>
        <div className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-medium text-teal-100">
          {completedSteps >= workflowSteps.length ? "Complete" : "Working"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {workflowSteps.map((step, index) => {
          const done = index < completedSteps;
          const current = active && index === completedSteps;

          return (
            <div
              key={step}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                done
                  ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                  : current
                    ? "border-teal-300/30 bg-teal-300/10 text-teal-100"
                    : "border-white/10 bg-white/[0.03] text-zinc-500"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  done
                    ? "border-emerald-300/30 bg-emerald-300/20"
                    : "border-white/10 bg-black/40"
                }`}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5 text-emerald-200" />
                ) : (
                  <span className={current ? "h-2 w-2 animate-pulse rounded-full bg-teal-200" : "h-2 w-2 rounded-full bg-zinc-600"} />
                )}
              </span>
              {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConversationSidebar({ messages }: { messages: ChatMessage[] }) {
  const userMessages = messages.filter((message) => message.role === "user");

  return (
    <aside className="flex min-h-0 border-b border-white/10 bg-zinc-950/95 p-4 lg:h-screen lg:w-80 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="hidden lg:block">
        <p className="text-2xl font-bold tracking-[0.12em] text-white">ZERINIX</p>
        <p className="mt-2 text-sm text-zinc-500">AI business workspace</p>
      </div>

      <div className="flex flex-1 gap-3 overflow-x-auto lg:mt-8 lg:block lg:space-y-3 lg:overflow-y-auto">
        {userMessages.length === 0 ? (
          <div className="min-w-64 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-500">
            Conversation history will appear here.
          </div>
        ) : null}

        {userMessages.map((message, index) => (
          <button
            key={message.id}
            type="button"
            className="min-w-64 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm transition hover:border-teal-300/30 hover:bg-teal-300/10 lg:w-full"
          >
            <p className="font-medium text-white">Conversation {index + 1}</p>
            <p className="mt-2 line-clamp-2 text-zinc-500">{message.content}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}

function ChatMessageBubble({
  message,
  onEdit,
}: {
  message: ChatMessage;
  onEdit: (message: ChatMessage) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl rounded-3xl border p-5 shadow-xl shadow-black/20 transition ${
          isUser
            ? "border-teal-300/20 bg-teal-300/10"
            : "border-white/10 bg-zinc-950/80"
        }`}
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">
            {isUser ? "YOU" : "ZERINIX"}
          </p>
          {isUser ? (
            <button
              type="button"
              onClick={() => onEdit(message)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              <Edit3 className="h-3.5 w-3.5 text-teal-200" />
              Edit
            </button>
          ) : null}
        </div>

        <MarkdownRenderer content={message.content} />

        {message.attachments && message.attachments.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <span
                key={attachment.id}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300"
              >
                <Paperclip className="h-3.5 w-3.5 text-teal-200" />
                {attachment.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

const ReportPanel = memo(function ReportPanel({
  reportData,
  reportFields,
  reportTitle,
  result,
}: {
  reportData: Partial<MarketReport & PlanReport> | null;
  reportFields: Array<{
    field: keyof (MarketReport & PlanReport);
    title: string;
    icon: LucideIcon;
  }>;
  reportTitle: string;
  result: string;
}) {
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfFontBase64, setPdfFontBase64] = useState("");
  const sections = useMemo<ReportSection[]>(() => {
    if (reportData) {
      return reportFields.map(({ field, title, icon }) => ({
        title,
        icon,
        content:
          sanitizeReportContent(reportData[field] || "") ||
          "Bu bölüm için AI çıktısı bekleniyor.",
      }));
    }

    return result
      ? [
          {
            title: "Executive Summary",
            icon: Sparkles,
            content: sanitizeReportContent(result),
          },
        ]
      : [];
  }, [reportData, reportFields, result]);

  const hasReportContent = sections.some(
    (section) =>
      section.content && section.content !== "Bu bölüm için AI çıktısı bekleniyor."
  );

  useEffect(() => {
    let mounted = true;

    loadPdfFont()
      .then((fontBase64) => {
        if (mounted) {
          setPdfFontBase64(fontBase64);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  function downloadPdf() {
    if (!hasReportContent || exportingPdf) {
      return;
    }

    if (!pdfFontBase64) {
      setPdfError("PDF fontu yükleniyor. Lütfen birkaç saniye sonra tekrar deneyin.");
      return;
    }

    setExportingPdf(true);
    setPdfError("");
    const isSafari =
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
      navigator.vendor.includes("Apple");

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const bodyX = margin + 20;
      const bodyWidth = contentWidth - 28;
      const bodyLineHeight = 4.8;
      const cardHeaderHeight = 20;
      const cardBottomPadding = 7;
      let y = margin;

      pdf.addFileToVFS("Geist-Regular.ttf", pdfFontBase64);
      pdf.addFont("Geist-Regular.ttf", "Geist", "normal");
      pdf.setFont("Geist", "normal");
      pdf.setCharSpace(0);

      const paintPage = () => {
        pdf.setFillColor("#000000");
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
      };

      const ensureSpace = (height: number) => {
        if (y + height <= pageHeight - margin) {
          return;
        }

        pdf.addPage();
        paintPage();
        y = margin;
      };

      paintPage();

      pdf.setFont("Geist", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor("#5eead4");
      pdf.text("ZERINIX REPORT", margin, y);

      pdf.setFontSize(24);
      pdf.setTextColor("#ffffff");
      pdf.text(reportTitle, margin, y + 11);

      pdf.setFillColor("#042f2e");
      pdf.setDrawColor("#115e59");
      pdf.roundedRect(pageWidth - margin - 32, y + 1, 32, 10, 5, 5, "FD");
      pdf.setFont("Geist", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor("#ccfbf1");
      pdf.text("AI Ready", pageWidth - margin - 25, y + 7.3);

      y += 26;

      sections.forEach((section) => {
        const bodyLines = pdf.splitTextToSize(
          normalizePdfText(section.content),
          bodyWidth
        ) as string[];
        let lineIndex = 0;

        while (lineIndex < bodyLines.length) {
          ensureSpace(38);

          const availableHeight =
            pageHeight - margin - y - cardHeaderHeight - cardBottomPadding;
          const maxLines = Math.max(1, Math.floor(availableHeight / bodyLineHeight));
          const lines = bodyLines.slice(lineIndex, lineIndex + maxLines);
          const isContinued = lineIndex > 0;
          const cardHeight = Math.max(
            31,
            cardHeaderHeight + lines.length * bodyLineHeight + cardBottomPadding
          );

          pdf.setFillColor("#09090b");
          pdf.setDrawColor("#27272a");
          pdf.roundedRect(margin, y, contentWidth, cardHeight, 5, 5, "FD");

          pdf.setFillColor("#18181b");
          pdf.setDrawColor("#27272a");
          pdf.roundedRect(margin + 4, y + 5, 11, 11, 3, 3, "FD");

          pdf.setDrawColor("#99f6e4");
          pdf.circle(margin + 9.5, y + 10.5, 2.9, "S");
          pdf.line(margin + 9.5, y + 7.8, margin + 9.5, y + 13.2);
          pdf.line(margin + 6.8, y + 10.5, margin + 12.2, y + 10.5);

          pdf.setFont("Geist", "normal");
          pdf.setFontSize(13);
          pdf.setTextColor("#ffffff");
          pdf.text(`${section.title}${isContinued ? " devamı" : ""}`, bodyX, y + 11, {
            maxWidth: bodyWidth,
          });

          pdf.setFont("Geist", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor("#d4d4d8");
          pdf.text(lines, bodyX, y + 20, {
            lineHeightFactor: 1.22,
            maxWidth: bodyWidth,
          });

          lineIndex += lines.length;
          y += cardHeight + 5;
        }
      });

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const fileName = "zerinix-report.pdf";

      if (isSafari) {
        const openedWindow = window.open(url, "_blank");

        if (!openedWindow) {
          URL.revokeObjectURL(url);
          setPdfError(
            "Safari PDF sekmesini engelledi. Lütfen açılır pencerelere izin verip tekrar deneyin."
          );
          return;
        }

        window.setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 300000);
      } else {
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;
        link.rel = "noopener";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 120000);
      }
    } catch (error) {
      console.error(error);
      setPdfError("PDF oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setExportingPdf(false);
    }
  }

  if (!reportData && !result) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-zinc-950/70 p-8 text-center shadow-2xl shadow-black/40">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <FileText className="h-5 w-5 text-teal-200" />
          </div>
          <p className="mt-5 text-lg font-semibold text-white">
            AI raporu burada hazırlanacak.
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            İş fikrini yaz ve ZERINIX rapor panelini oluştur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-h-[80vh] overflow-y-auto pr-1">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.35em] text-teal-300/70">
            ZERINIX REPORT
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            {reportTitle}
          </h2>
        </div>
        <div className="rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-sm text-teal-100">
          AI Ready
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <article
              key={section.title}
              className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl shadow-black/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Icon className="h-5 w-5 text-teal-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {section.title}
                  </h3>
                  <div className="mt-3">
                    <MarkdownRenderer content={section.content} />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {reportActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-zinc-800"
            >
              <Icon className="h-4 w-4 text-teal-200" />
              {action.label}
            </button>
          );
        })}

        {hasReportContent ? (
          <>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={exportingPdf}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4 text-teal-200" />
              {exportingPdf ? "PDF hazırlanıyor..." : "Download PDF"}
            </button>
            {pdfError ? (
              <p className="sm:col-span-2 text-sm leading-6 text-red-300">
                {pdfError}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      {hasReportContent ? (
        <div className="mt-5">
          <SourceCards />
        </div>
      ) : null}
    </section>
  );
});

export default function Planner() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [marketReport, setMarketReport] = useState<MarketReport | null>(null);
  const [planReport, setPlanReport] = useState<PlanReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [activeMode, setActiveMode] = useState<ChatMode>("plan");
  const [workflowCompletedSteps, setWorkflowCompletedSteps] = useState(0);
  const [lastRequest, setLastRequest] = useState<{
    mode: ChatMode;
    prompt: string;
  } | null>(null);

  const isWorking = loading || analyzing;

  function createMessageId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const uploadedFiles = Array.from(files).map((file) => ({
      id: createMessageId(),
      name: file.name,
      size: file.size,
    }));

    setAttachments((current) => [...current, ...uploadedFiles]);
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  }

  function addUserMessage(mode: ChatMode, content: string) {
    const attachedFiles = attachments;

    setMessages((current) => [
      ...current,
      {
        id: createMessageId(),
        role: "user",
        mode,
        content,
        attachments: attachedFiles,
      },
    ]);
    setAttachments([]);
  }

  function addAssistantMessage(mode: ChatMode, title: string) {
    setMessages((current) => [
      ...current,
      {
        id: createMessageId(),
        role: "assistant",
        mode,
        content: `## ${title}\n\nThe final report is ready. Review the structured cards below for the complete strategy, roadmap, risks, score, source cards, and export actions.`,
      },
    ]);
  }

  function editMessage(message: ChatMessage) {
    setPrompt(message.content);
    setActiveMode(message.mode || "plan");
  }

  function regenerateResponse() {
    if (!lastRequest || isWorking) {
      return;
    }

    setPrompt(lastRequest.prompt);

    if (lastRequest.mode === "plan") {
      void generatePlan(lastRequest.prompt, false);
    } else {
      void analyzeMarket(lastRequest.prompt, false);
    }
  }

  async function getGeneralWorkspaceId(
    supabase: ReturnType<typeof createClient>,
    userId: string
  ) {
    const { data: existingWorkspace } = await supabase
      .from("report_workspaces")
      .select("id")
      .eq("user_id", userId)
      .eq("name", "General")
      .maybeSingle();

    if (existingWorkspace?.id) {
      return existingWorkspace.id as string;
    }

    const { data: createdWorkspace, error } = await supabase
      .from("report_workspaces")
      .insert({
        user_id: userId,
        name: "General",
      })
      .select("id")
      .single();

    if (error || !createdWorkspace?.id) {
      const { data: retryWorkspace } = await supabase
        .from("report_workspaces")
        .select("id")
        .eq("user_id", userId)
        .eq("name", "General")
        .maybeSingle();

      return (retryWorkspace?.id as string | undefined) || "";
    }

    return createdWorkspace.id as string;
  }

  async function saveGeneratedReport({
    title,
    promptText,
    reportType,
    sections,
  }: {
    title: string;
    promptText: string;
    reportType: string;
    sections: Array<{ title: string; content: string }>;
  }) {
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError || new Error("Authenticated user not found."));
        return;
      }

      const workspaceId = await getGeneralWorkspaceId(supabase, user.id);

      if (!workspaceId) {
        console.error(new Error("Default workspace not found."));
        return;
      }

      const { error } = await supabase.from("reports").insert({
        user_id: user.id,
        workspace_id: workspaceId,
        title,
        prompt: promptText,
        report_type: reportType,
        status: "completed",
        sections,
      });

      if (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function readStreamingResult(response: Response, fallbackMessage: string) {
    if (!response.ok || !response.body) {
      try {
        const data = await response.json();
        setResult(data.error || fallbackMessage);
      } catch {
        setResult(fallbackMessage);
      }

      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let output = "";
    let frame: number | null = null;

    const scheduleResultUpdate = () => {
      if (frame !== null) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = null;
        setResult(output);
      });
    };

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      output += decoder.decode(value, { stream: true });
      scheduleResultUpdate();
    }

    output += decoder.decode();
    if (frame !== null) {
      cancelAnimationFrame(frame);
    }

    setResult(output || fallbackMessage);
  }

  async function readStreamingSectionJson(
    response: Response,
    onEvent: (event: ReportStreamEvent) => void,
    fallbackMessage: string,
    onFirstChunk?: () => void,
    fallbackField: keyof (MarketReport & PlanReport) = "executiveSummary"
  ) {
    if (!response.ok || !response.body) {
      try {
        const data = await response.json();
        onEvent({ [fallbackField]: data.error || fallbackMessage });
      } catch {
        onEvent({ [fallbackField]: fallbackMessage });
      }

      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let hasChunk = false;
    let buffer = "";

    const emitBufferedEvents = () => {
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
          continue;
        }

        try {
          const event = JSON.parse(trimmed) as ReportStreamEvent;

          if (!hasChunk && Object.values(event).some(Boolean)) {
            hasChunk = true;
            onFirstChunk?.();
          }

          onEvent(event);
        } catch {
          onEvent({ [fallbackField]: fallbackMessage });
        }
      }
    };

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      emitBufferedEvents();
    }

    buffer += decoder.decode();
    emitBufferedEvents();

    if (buffer.trim()) {
      try {
        onEvent(JSON.parse(buffer.trim()) as ReportStreamEvent);
      } catch {
        onEvent({ [fallbackField]: fallbackMessage });
      }
    }
  }

  async function generatePlan(promptOverride = prompt, addToHistory = true) {
    const submittedPrompt = promptOverride.trim();

    if (!submittedPrompt || loading) {
      return;
    }

    setLoading(true);
    setActiveMode("plan");
    setWorkflowCompletedSteps(0);
    setLastRequest({ mode: "plan", prompt: submittedPrompt });
    if (addToHistory) {
      addUserMessage("plan", submittedPrompt);
    }
    setResult("");
    setMarketReport(null);
    setPlanReport(emptyPlanReport);

    const reportOutput: PlanReport = { ...emptyPlanReport };
    let frame: number | null = null;
    let remainingSectionsStarted = false;
    let remainingSectionsPromise: Promise<void[]> = Promise.resolve([]);

    const renderReport = () => {
      setPlanReport({ ...reportOutput });
    };

    const scheduleReportRender = () => {
      if (frame !== null) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = null;
        renderReport();
      });
    };

    const streamField = async (
      field: PlanReportField,
      onFirstChunk?: () => void
    ) => {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: submittedPrompt, field }),
      });

      const fieldIndex = planReportFields.findIndex((item) => item.field === field);
      setWorkflowCompletedSteps((current) =>
        Math.max(current, Math.min(workflowSteps.length - 1, fieldIndex + 1))
      );

      await readStreamingSectionJson(
        res,
        (event) => {
          const chunk = event[field];

          if (!chunk) {
            return;
          }

          reportOutput[field] += chunk;
          scheduleReportRender();
        },
        "Bu bölüm için AI çıktısı alınamadı.",
        onFirstChunk,
        field
      );
    };

    const startRemainingSections = () => {
      if (remainingSectionsStarted) {
        return;
      }

      remainingSectionsStarted = true;
      remainingSectionsPromise = Promise.all(
        planReportFields
          .slice(1)
          .map(({ field }) =>
            streamField(field).catch(() => {
              reportOutput[field] = "Bu bölüm için AI çıktısı alınamadı.";
              scheduleReportRender();
            })
          )
      );
    };

    try {
      await streamField("executiveSummary", startRemainingSections);
      startRemainingSections();
      await remainingSectionsPromise;

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }

      renderReport();
      setWorkflowCompletedSteps(workflowSteps.length);
      await saveGeneratedReport({
        title: "Business Plan Report",
        promptText: submittedPrompt,
        reportType: "business_plan",
        sections: serializeReportSections(reportOutput, planReportFields),
      });
      addAssistantMessage("plan", "Business Plan Report");
    } catch {
      setResult("Bir hata oluştu.");
      setPlanReport(null);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeMarket(promptOverride = prompt, addToHistory = true) {
    const submittedPrompt = promptOverride.trim();

    if (!submittedPrompt || analyzing) {
      return;
    }

    setAnalyzing(true);
    setActiveMode("market");
    setWorkflowCompletedSteps(0);
    setLastRequest({ mode: "market", prompt: submittedPrompt });
    if (addToHistory) {
      addUserMessage("market", submittedPrompt);
    }
    setResult("");
    setPlanReport(null);
    setMarketReport(emptyMarketReport);

    const reportOutput: MarketReport = { ...emptyMarketReport };
    let frame: number | null = null;
    let remainingSectionsStarted = false;
    let remainingSectionsPromise: Promise<void[]> = Promise.resolve([]);

    const renderReport = () => {
      setMarketReport({ ...reportOutput });
    };

    const scheduleReportRender = () => {
      if (frame !== null) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = null;
        renderReport();
      });
    };

    const streamField = async (
      field: MarketReportField,
      onFirstChunk?: () => void
    ) => {
      const res = await fetch("/api/market-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: submittedPrompt, field }),
      });

      const fieldIndex = reportFields.findIndex((item) => item.field === field);
      setWorkflowCompletedSteps((current) =>
        Math.max(current, Math.min(workflowSteps.length - 1, fieldIndex + 1))
      );

      await readStreamingSectionJson(
        res,
        (event) => {
          const chunk = event[field];

          if (!chunk) {
            return;
          }

          reportOutput[field] += chunk;
          scheduleReportRender();
        },
        "Bu bölüm için AI çıktısı alınamadı.",
        onFirstChunk,
        field
      );
    };

    const startRemainingSections = () => {
      if (remainingSectionsStarted) {
        return;
      }

      remainingSectionsStarted = true;
      remainingSectionsPromise = Promise.all(
        reportFields
          .slice(1)
          .map(({ field }) =>
            streamField(field).catch(() => {
              reportOutput[field] = "Bu bölüm için AI çıktısı alınamadı.";
              scheduleReportRender();
            })
          )
      );
    };

    try {
      await streamField("executiveSummary", startRemainingSections);
      startRemainingSections();
      await remainingSectionsPromise;

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }

      renderReport();
      setWorkflowCompletedSteps(workflowSteps.length);
      await saveGeneratedReport({
        title: "Business Intelligence Report",
        promptText: submittedPrompt,
        reportType: "market_analysis",
        sections: serializeReportSections(reportOutput, reportFields),
      });
      addAssistantMessage("market", "Business Intelligence Report");
    } catch {
      setResult("Pazar analizi sırasında bir hata oluştu.");
      setMarketReport(null);
    } finally {
      setAnalyzing(false);
    }
  }

  const activeReportFields = planReport
    ? planReportFields
    : (reportFields as Array<{
        field: keyof (MarketReport & PlanReport);
        title: string;
        icon: LucideIcon;
      }>);
  const currentReportTitle = planReport
    ? "Business Plan Report"
    : "Business Intelligence Report";

  return (
    <main className="flex h-screen overflow-hidden bg-black text-white">
      <ConversationSidebar messages={messages} />

      <section className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)]" />

        <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/70 px-5 py-4 backdrop-blur-xl lg:px-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] text-teal-300/70">
              ZERINIX AI
            </p>
            <h1 className="mt-1 text-xl font-semibold text-white md:text-2xl">
              Entrepreneur Operating Chat
            </h1>
          </div>
          <button
            type="button"
            onClick={regenerateResponse}
            disabled={!lastRequest || isWorking}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCcw className="h-4 w-4 text-teal-200" />
            Regenerate response
          </button>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto px-5 py-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-44">
            {messages.length === 0 ? (
              <div className="flex min-h-[45vh] items-center justify-center text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40">
                    <Sparkles className="h-6 w-6 text-teal-200" />
                  </div>
                  <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white">
                    What are we building today?
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    Upload context, describe your goal, and ZERINIX will stream a
                    premium business plan or market intelligence report.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  onEdit={editMessage}
                />
              ))
            )}

            <WorkflowPanel active={isWorking} completedSteps={workflowCompletedSteps} />

            {(planReport || marketReport || result) ? (
              <ReportPanel
                reportData={planReport || marketReport}
                reportFields={activeReportFields}
                reportTitle={currentReportTitle}
                result={result}
              />
            ) : null}
          </div>
        </div>

        <div className="relative z-20 border-t border-white/10 bg-black/80 px-5 py-4 backdrop-blur-2xl lg:px-8">
          <div className="mx-auto max-w-6xl">
            {attachments.length > 0 ? (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachments.map((attachment) => (
                  <span
                    key={attachment.id}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300"
                  >
                    <Paperclip className="h-3.5 w-3.5 text-teal-200" />
                    {attachment.name}
                    <span className="text-zinc-600">{formatFileSize(attachment.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="rounded-full p-0.5 transition hover:bg-white/10"
                      aria-label="Remove attachment"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-3 shadow-2xl shadow-black/50">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    if (activeMode === "plan") {
                      void generatePlan();
                    } else {
                      void analyzeMarket();
                    }
                  }
                }}
                className="min-h-28 w-full resize-none rounded-2xl bg-transparent p-3 text-base leading-7 text-white outline-none placeholder:text-zinc-600"
                placeholder="Describe your business idea, market, budget, constraints, or upload supporting files..."
              />

              <div className="flex flex-col gap-3 border-t border-white/10 pt-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10">
                    <Paperclip className="h-4 w-4 text-teal-200" />
                    Upload files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(event) => handleFiles(event.target.files)}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setActiveMode("plan")}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                      activeMode === "plan"
                        ? "bg-white text-black"
                        : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    AI Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode("market")}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                      activeMode === "market"
                        ? "bg-white text-black"
                        : "border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    Market Analysis
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!prompt.trim() || isWorking}
                  onClick={() => {
                    if (activeMode === "plan") {
                      void generatePlan();
                    } else {
                      void analyzeMarket();
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-300 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-teal-950/40 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isWorking ? "Streaming..." : "Send"}
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-zinc-600">
              Press Cmd/Ctrl + Enter to send. ZERINIX can make mistakes; verify critical decisions.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
