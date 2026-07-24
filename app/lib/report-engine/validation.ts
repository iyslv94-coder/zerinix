import {
  validateGeneratedReportSections,
  type ReportQualityValidationResult,
} from "@/app/lib/report-quality-validation";

export type { ReportQualityValidationResult };

export function validateReportSections(
  report: Record<string, string>
): ReportQualityValidationResult {
  return validateGeneratedReportSections(report);
}

