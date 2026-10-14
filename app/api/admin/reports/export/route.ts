import { NextResponse } from "next/server";
import { getReportRows } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";
import ExcelJS from "exceljs";
import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

function filters(url: URL) {
  return { programId: url.searchParams.get("programId") || undefined, from: url.searchParams.get("from") || undefined, to: url.searchParams.get("to") || undefined };
}

async function createExcel(report: Awaited<ReturnType<typeof getReportRows>>) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Bookings");
  sheet.addRows([["KNF 2026 Booking Report"], ["Total", report.summary.total, "Valid", report.summary.valid, "Cancelled", report.summary.cancelled], []]);
  sheet.addRow(["Name", "Contact", "Program", "Seat", "Status", "Source", "Created", "Cancelled reason"]);
  report.rows.forEach((row) => sheet.addRow([row.fullName, row.contact, row.programTitle, row.seatLabel ?? "", row.status, row.source, row.createdAt, row.cancelledReason ?? ""]));
  sheet.getRow(1).font = { bold: true, size: 16 }; sheet.getRow(4).font = { bold: true }; sheet.columns.forEach((column) => { column.width = 22; });
  return new Uint8Array(await workbook.xlsx.writeBuffer());
}

const pdfStyles = StyleSheet.create({ page: { padding: 28, fontSize: 9 }, title: { fontSize: 16, marginBottom: 10 }, summary: { marginBottom: 12 }, row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#d5dce5", paddingVertical: 4 }, cell: { width: "14%" }, wide: { width: "18%" } });
async function createPdf(report: Awaited<ReturnType<typeof getReportRows>>) {
  const children = [React.createElement(Text, { key: "title", style: pdfStyles.title }, "KNF 2026 Booking Report"), React.createElement(Text, { key: "summary", style: pdfStyles.summary }, `Total: ${report.summary.total}   Valid: ${report.summary.valid}   Cancelled: ${report.summary.cancelled}`), React.createElement(View, { key: "rows" }, report.rows.map((row) => React.createElement(View, { key: row.bookingId, style: pdfStyles.row }, React.createElement(Text, { style: pdfStyles.wide }, row.fullName), React.createElement(Text, { style: pdfStyles.cell }, row.seatLabel ?? "—"), React.createElement(Text, { style: pdfStyles.wide }, row.status), React.createElement(Text, { style: pdfStyles.wide }, row.programTitle), React.createElement(Text, { style: pdfStyles.cell }, new Date(row.createdAt).toLocaleDateString("id-ID")))) )];
  const document = React.createElement(Document, null, React.createElement(Page, { size: "A4", style: pdfStyles.page }, children));
  return new Uint8Array(await renderToBuffer(document));
}

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const url = new URL(request.url);
  const report = await getReportRows(filters(url));
  const format = url.searchParams.get("format") === "pdf" ? "pdf" : "xlsx";
  if (format === "pdf") return new NextResponse(await createPdf(report), { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="knf-booking-report.pdf"' } });
  return new NextResponse(await createExcel(report), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": 'attachment; filename="knf-booking-report.xlsx"' } });
}
