"use client";

import { useEffect, useState } from "react";

export function useReportExport({
  canExport,
  failureMessage,
  loadFont,
}: {
  canExport: boolean;
  failureMessage: string;
  loadFont: () => Promise<string>;
}) {
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfFontBase64, setPdfFontBase64] = useState("");

  useEffect(() => {
    let mounted = true;

    loadFont()
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
  }, [loadFont]);

  async function runPdfExport(exporter: (fontBase64: string) => Promise<void>) {
    if (failureMessage) {
      setPdfError("Report generation failed. PDF export is available only after a report completes successfully.");
      return;
    }

    if (!canExport || exportingPdf) {
      return;
    }

    if (!pdfFontBase64) {
      setPdfError("PDF font is still loading. Please try again in a few seconds.");
      return;
    }

    setExportingPdf(true);
    setPdfError("");

    try {
      await exporter(pdfFontBase64);
    } finally {
      setExportingPdf(false);
    }
  }

  return {
    exportingPdf,
    pdfError,
    setPdfError,
    runPdfExport,
  };
}
