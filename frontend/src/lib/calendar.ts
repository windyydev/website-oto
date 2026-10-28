/**
 * Calendar helpers for Test Drive Appointments
 */

export interface TestDriveEventDetails {
  bookingCode: string;
  carName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "09:00 - 11:00"
  locationType: "showroom" | "home";
  address?: string;
  customerName: string;
}

function parseDateTimeRange(dateStr: string, timeSlotStr: string): { start: Date; end: Date } {
  // Extract start and end time from timeSlot e.g. "09:00 - 11:00"
  const parts = timeSlotStr.split("-").map((s) => s.trim());
  const startTime = parts[0] || "09:00";
  const endTime = parts[1] || "11:00";

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const start = new Date(dateStr);
  start.setHours(startHour || 9, startMin || 0, 0, 0);

  const end = new Date(dateStr);
  end.setHours(endHour || 11, endMin || 0, 0, 0);

  return { start, end };
}

function formatToIcsDate(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, "");
}

/**
 * Generate Google Calendar Web URL
 */
export function getGoogleCalendarUrl(details: TestDriveEventDetails): string {
  const { start, end } = parseDateTimeRange(details.date, details.timeSlot);
  const startIso = formatToIcsDate(start);
  const endIso = formatToIcsDate(end);

  const title = encodeURIComponent(`[Atelier] Lịch Lái Thử: ${details.carName} (Mã: ${details.bookingCode})`);
  const location = encodeURIComponent(
    details.locationType === "showroom"
      ? "Atelier Curated Automotive – KĐT Sala, Mai Chí Thọ, P. An Lợi Đông, TP. Thủ Đức, TP.HCM"
      : `Lái thử tận nhà: ${details.address || "Địa chỉ khách hàng"}`
  );
  const description = encodeURIComponent(
    `Kính chào Quý khách ${details.customerName},\n\n` +
      `Lịch hẹn lái thử mẫu xe ${details.carName} đã được xác nhận.\n` +
      `Mã đặt lịch: ${details.bookingCode}\n` +
      `Thời gian: ${details.timeSlot}, ngày ${details.date}\n` +
      `Hotline hỗ trợ VIP: 0908 123 456\n\n` +
      `Atelier Curated Automotive trân trọng đón tiếp!`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${description}&location=${location}`;
}

/**
 * Download .ics File for Outlook / Apple Calendar
 */
export function downloadIcsFile(details: TestDriveEventDetails): void {
  const { start, end } = parseDateTimeRange(details.date, details.timeSlot);
  const now = new Date();

  const location =
    details.locationType === "showroom"
      ? "Atelier Curated Automotive – KĐT Sala, TP. Thủ Đức, TP.HCM"
      : details.address || "Địa chỉ khách hàng";

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Atelier Curated Automotive//VN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${details.bookingCode}-${Date.now()}@atelier-automotive.vn`,
    `DTSTAMP:${formatToIcsDate(now)}`,
    `DTSTART:${formatToIcsDate(start)}`,
    `DTEND:${formatToIcsDate(end)}`,
    `SUMMARY:[Atelier] Lịch Lái Thử: ${details.carName}`,
    `DESCRIPTION:Mã đặt lịch: ${details.bookingCode}\\nKhách hàng: ${details.customerName}\\nHotline: 0908 123 456`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Atelier_LaiThu_${details.bookingCode}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
