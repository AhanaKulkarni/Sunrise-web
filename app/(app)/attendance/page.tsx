'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Download, Calendar, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type AttRow = {
  employee_id: string;
  employee_name?: string;
  event_type: 'check_in' | 'check_out' | string;
  ts: string;
  is_late?: boolean;
  device?: string;
};

function startOf(period: Period, ref: Date): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  switch (period) {
    case 'daily':
      return d;
    case 'weekly': {
      const day = d.getDay(); // 0 = Sun
      const diff = (day + 6) % 7; // Monday start
      d.setDate(d.getDate() - diff);
      return d;
    }
    case 'monthly':
      d.setDate(1);
      return d;
    case 'quarterly': {
      const q = Math.floor(d.getMonth() / 3);
      d.setMonth(q * 3);
      d.setDate(1);
      return d;
    }
    case 'yearly':
      d.setMonth(0);
      d.setDate(1);
      return d;
  }
}
function endOf(period: Period, ref: Date): Date {
  const s = startOf(period, ref);
  const e = new Date(s);
  switch (period) {
    case 'daily':
      e.setDate(e.getDate() + 1);
      break;
    case 'weekly':
      e.setDate(e.getDate() + 7);
      break;
    case 'monthly':
      e.setMonth(e.getMonth() + 1);
      break;
    case 'quarterly':
      e.setMonth(e.getMonth() + 3);
      break;
    case 'yearly':
      e.setFullYear(e.getFullYear() + 1);
      break;
  }
  e.setMilliseconds(e.getMilliseconds() - 1);
  return e;
}
function fmt(d: Date): string {
  return d.toISOString().split('T')[0];
}
function fmtTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export default function AttendanceReports() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [refDate, setRefDate] = useState<string>(fmt(new Date()));
  const [rows, setRows] = useState<AttRow[]>([]);
  const [employees, setEmployees] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const range = useMemo(() => {
    const ref = new Date(refDate + 'T00:00:00');
    return { from: startOf(period, ref), to: endOf(period, ref) };
  }, [period, refDate]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      // Employees for name lookup
      const emps = await api.get<any[]>('/employees').catch(() => []);
      const empMap: Record<string, any> = {};
      (emps || []).forEach((e: any) => (empMap[e.id] = e));
      setEmployees(empMap);

      // Try dedicated report endpoint; fall back to /attendance with client-side filter
      let data: AttRow[] = [];
      try {
        const p = new URLSearchParams({
          from: range.from.toISOString(),
          to: range.to.toISOString(),
        });
        data = await api.get<AttRow[]>(`/attendance?${p.toString()}`);
      } catch {
        try {
          data = await api.get<AttRow[]>('/attendance');
        } catch {
          data = [];
        }
      }
      const filtered = (Array.isArray(data) ? data : []).filter((r) => {
        const t = new Date(r.ts);
        return t >= range.from && t <= range.to;
      });
      filtered.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
      setRows(filtered);
    } catch (e: any) {
      setError(e?.message || 'Failed to load attendance');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, refDate]);

  // ---- Aggregate stats ----
  const stats = useMemo(() => {
    const unique = new Set(rows.map((r) => r.employee_id));
    const checkIns = rows.filter((r) => r.event_type === 'check_in').length;
    const checkOuts = rows.filter((r) => r.event_type === 'check_out').length;
    const late = rows.filter((r) => r.is_late).length;
    return { unique: unique.size, checkIns, checkOuts, late, total: rows.length };
  }, [rows]);

  function periodLabel(): string {
    const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return `${range.from.toLocaleDateString('en-IN', opts)} — ${range.to.toLocaleDateString('en-IN', opts)}`;
  }

  function downloadPDF() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    // Header band
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, pageW, 60, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Sunrise OS', 40, 38);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Attendance Report', pageW - 40, 38, { align: 'right' });

    // Meta
    doc.setTextColor(23, 23, 23);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${period.charAt(0).toUpperCase() + period.slice(1)} Report`,
      40,
      95
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(115, 115, 115);
    doc.text(periodLabel(), 40, 112);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 40, 126);

    // Summary boxes
    const summary = [
      ['Total Events', String(stats.total)],
      ['Unique Employees', String(stats.unique)],
      ['Check-ins', String(stats.checkIns)],
      ['Check-outs', String(stats.checkOuts)],
      ['Late Arrivals', String(stats.late)],
    ];
    autoTable(doc, {
      startY: 150,
      body: summary,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [23, 23, 23], cellWidth: 140 },
        1: { textColor: [217, 119, 6] },
      },
    });

    // Detail table
    const body = rows.map((r) => [
      employees[r.employee_id]?.name || r.employee_id?.slice(0, 8) || '—',
      employees[r.employee_id]?.department || '—',
      r.event_type === 'check_in' ? 'Check In' : r.event_type === 'check_out' ? 'Check Out' : r.event_type,
      fmtTime(r.ts),
      r.is_late ? 'Yes' : 'No',
      r.device || '—',
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Employee', 'Department', 'Event', 'Timestamp', 'Late', 'Device']],
      body,
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [253, 248, 237] },
      margin: { left: 40, right: 40 },
    });

    // Footer on each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(163, 163, 163);
      doc.text(
        `Sunrise OS  ·  Page ${i} of ${pageCount}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 20,
        { align: 'center' }
      );
    }

    const filename = `sunrise-attendance-${period}-${fmt(range.from)}.pdf`;
    doc.save(filename);
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">Attendance Reports</h1>
          <p className="text-textSecondary">
            Generate &amp; download PDF reports across any time range.
          </p>
        </div>
        <button
          onClick={downloadPDF}
          disabled={loading || rows.length === 0}
          className="clay-btn px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Controls */}
      <div className="clay p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-2 uppercase tracking-wide">
              Period
            </label>
            <div className="flex flex-wrap gap-2">
              {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    period === p
                      ? 'clay-btn'
                      : 'clay-sm text-textSecondary hover:text-text'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-textSecondary mb-2 uppercase tracking-wide">
              Reference Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-textMuted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={refDate}
                onChange={(e) => setRefDate(e.target.value)}
                className="clay-input w-full pl-11 text-text"
              />
            </div>
          </div>
        </div>
        <div className="clay-inset mt-6 p-4 flex items-center gap-3">
          <FileText className="w-4 h-4 text-primary" />
          <div className="text-sm text-text">
            <span className="font-semibold">Range:</span>{' '}
            <span className="text-textSecondary">{periodLabel()}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Events', v: stats.total, c: 'text-text' },
          { label: 'Employees', v: stats.unique, c: 'text-info' },
          { label: 'Check-ins', v: stats.checkIns, c: 'text-success' },
          { label: 'Check-outs', v: stats.checkOuts, c: 'text-primary' },
          { label: 'Late Arrivals', v: stats.late, c: 'text-danger' },
        ].map((s) => (
          <div key={s.label} className="clay-sm p-4">
            <div className="text-xs uppercase tracking-wide text-textMuted font-semibold">
              {s.label}
            </div>
            <div className={`text-2xl font-bold mt-1 ${s.c}`}>
              {loading ? '—' : s.v}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="clay p-6">
        <h3 className="font-bold text-text mb-4">
          Attendance Records{' '}
          <span className="text-sm text-textMuted font-normal">
            ({rows.length})
          </span>
        </h3>

        {error && (
          <div className="clay-sm p-4 mb-4 text-sm text-danger bg-dangerSoft/40">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-textMuted">Loading records…</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12 text-textMuted">
            No attendance records in this range.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-textSecondary border-b border-divider">
                  <th className="text-left py-3 px-2 font-semibold">Employee</th>
                  <th className="text-left py-3 px-2 font-semibold">Department</th>
                  <th className="text-left py-3 px-2 font-semibold">Event</th>
                  <th className="text-left py-3 px-2 font-semibold">Timestamp</th>
                  <th className="text-left py-3 px-2 font-semibold">Late</th>
                  <th className="text-left py-3 px-2 font-semibold">Device</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 200).map((r, i) => {
                  const emp = employees[r.employee_id] || {};
                  return (
                    <tr key={i} className="border-b border-divider/50 hover:bg-surface">
                      <td className="py-3 px-2 font-medium text-text">
                        {emp.name || r.employee_id?.slice(0, 8) || '—'}
                      </td>
                      <td className="py-3 px-2 text-textSecondary">
                        {emp.department || '—'}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                            r.event_type === 'check_in'
                              ? 'bg-successSoft text-success'
                              : 'bg-warningSoft text-warning'
                          }`}
                        >
                          {r.event_type === 'check_in' ? 'Check In' : 'Check Out'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-textSecondary">
                        {fmtTime(r.ts)}
                      </td>
                      <td className="py-3 px-2">
                        {r.is_late ? (
                          <span className="text-danger text-xs font-semibold">Yes</span>
                        ) : (
                          <span className="text-textMuted text-xs">No</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-textMuted text-xs">
                        {r.device || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length > 200 && (
              <p className="text-xs text-textMuted mt-4 text-center">
                Showing first 200 records. Full data is included in the PDF export.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
