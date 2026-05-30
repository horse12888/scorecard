import React from "react";
import { pdf } from "@react-pdf/renderer";
import { ImpulsePdfDocument } from "./pdf/ImpulsePdfDocument";

function safeFileName(value: string) {
  return String(value || "impulse-report")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "impulse-report";
}

export async function generateIMPULSEReport(result: any, label?: string) {
  if (!result) {
    throw new Error("Missing result for IMPULSE PDF generation.");
  }

  const doc = React.createElement(ImpulsePdfDocument, { result });
  const blob = await pdf(doc).toBlob();

  const namePart = safeFileName(result.name || result.company || label || "impulse-report");
  const fileName = `IMPULSE_Report_${namePart}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
