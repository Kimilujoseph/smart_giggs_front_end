import React, { useState } from 'react';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RotateCcw,
  BadgeDollarSign,
  ExternalLink,
} from 'lucide-react';

interface Sale {
  _id: { sellerId: number };
  productname: string;
  category: string;
  productmodel: string;
  soldprice: number;
  productcost: number;
  netprofit: number;
  commission: number;
  commissionpaid: number;
  storage: string;
  sellername: string;
  shopname: string;
  status: string;
  paymentstatus: string;
  paymentDetails: {
    id: number;
    amount: string;
    paymentMethod: string;
    status: string;
    transactionId: string;
  };
  financeDetails: {
    financer: string;
    financeStatus: string;
    financeAmount?: number;
  };
  IMEI: string;
  batchNumber: string;
  createdAt: string;
  saleId: number;
  totalsoldunits: number;
  customerId?: number;
}

interface SalesTableProps {
  sales: Sale[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSort?: (field: keyof Sale) => void;
  onPayCommission?: (sale: Sale) => void;
  onReverseSale?: (sale: Sale) => void;
  userRole?: string;
  showActions?: boolean;
  showCostAndProfit?: boolean;
}

const ksh = (n: number) =>
  `KES ${Number(n || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = (status || '').toLowerCase();

  const map: Record<string, { cls: string; icon: React.ReactNode }> = {
    active: { cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60', icon: <CheckCircle2 className="w-3 h-3" /> },
    completed: { cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60', icon: <CheckCircle2 className="w-3 h-3" /> },
    paid: { cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60', icon: <CheckCircle2 className="w-3 h-3" /> },
    returned: { cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/60', icon: <XCircle className="w-3 h-3" /> },
    reversed: { cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/60', icon: <XCircle className="w-3 h-3" /> },
    pending: { cls: 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border-violet-200 dark:border-violet-900/60', icon: <Clock className="w-3 h-3" /> },
    unpaid: { cls: 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/60', icon: <AlertCircle className="w-3 h-3" /> },
  };

  const cfg = map[s] || { cls: 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800', icon: null };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.cls}`}>
      {cfg.icon}
      {status || '—'}
    </span>
  );
};

const ExportButtons: React.FC<{ data: Sale[] }> = ({ data }) => {
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
    XLSX.writeFile(workbook, 'sales_data.xlsx');
  };

  return (
    <div className="flex items-center gap-2">
      <CSVLink
        data={data}
        filename="sales_data.csv"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        <Download className="w-3.5 h-3.5" /> CSV
      </CSVLink>
      <button
        onClick={handleExportExcel}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
      </button>
    </div>
  );
};

/* ─── Row Card ─────────────────────────────────────────────────────────────── */
const SaleRow: React.FC<{
  sale: Sale;
  showActions: boolean;
  showCostAndProfit: boolean;
  onPayCommission?: (sale: Sale) => void;
  onReverseSale?: (sale: Sale) => void;
  userRole?: string;
}> = ({ sale, showActions, showCostAndProfit, onPayCommission, onReverseSale, userRole }) => {
  const [expanded, setExpanded] = useState(false);

  const isPending = sale.financeDetails?.financeStatus?.toLowerCase() === 'pending';
  const isReturned = sale.status?.toLowerCase() === 'returned';
  const commissionDue = sale.commission > 0 && (sale.commissionpaid || 0) < sale.commission && !isReturned;

  return (
    <div
      className={`rounded-xl border transition-all ${
        isPending
          ? 'border-violet-200 dark:border-violet-800/50 bg-gradient-to-br from-violet-50/20 to-indigo-50/20 dark:from-violet-950/5 dark:to-indigo-950/5'
          : isReturned
          ? 'border-rose-200 dark:border-rose-800/60 bg-rose-50/30 dark:bg-rose-900/10'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark hover:border-slate-300 dark:hover:border-slate-600'
      } overflow-hidden shadow-sm`}
    >
      {/* ── Primary Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
        {/* Left: main info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
              {sale.productname}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {sale.productmodel} {sale.storage ? `· ${sale.storage}` : ''}
            </span>
            {isPending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 text-[10px] font-bold uppercase tracking-wider">
                <Clock className="w-2.5 h-2.5" /> Finance Pending
              </span>
            )}
            {isReturned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                <XCircle className="w-2.5 h-2.5" /> Returned
              </span>
            )}
          </div>

          {/* Key metrics row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Price: <span className="font-semibold text-slate-800 dark:text-slate-200">{ksh(sale.soldprice)}</span>
            </span>
            {showCostAndProfit && (
              <span>
                Profit: <span className={`font-semibold ${sale.netprofit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>{ksh(sale.netprofit)}</span>
              </span>
            )}
            <span>
              Commission: <span className={`font-semibold ${commissionDue ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>{ksh(sale.commission)}</span>
              {sale.commissionpaid > 0 && <span className="text-emerald-500 font-bold ml-0.5">✓</span>}
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              {new Date(sale.createdAt).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: '2-digit' })}
            </span>
          </div>

          {/* Seller / Shop */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
            <Link to={`/user/sales?name=${sale.sellername}`} className="hover:text-primary flex items-center gap-0.5 text-slate-500 dark:text-slate-400 font-medium">
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" /> {sale.sellername}
            </Link>
            <span>·</span>
            <Link to={`/shop/sales?name=${sale.shopname}`} className="hover:text-primary text-slate-400">
              {sale.shopname}
            </Link>
          </div>
        </div>

        {/* Right: Status badge & Action buttons ALWAYS visible in row */}
        <div className="flex flex-wrap items-center gap-3 justify-between sm:justify-end flex-none border-t sm:border-t-0 pt-2 sm:pt-0">
          <div className="flex items-center gap-2">
            <StatusBadge status={sale.status} />
          </div>

          <div className="flex items-center gap-2">
            {showActions && (
              <>
                <button
                  onClick={() => onPayCommission && onPayCommission(sale)}
                  disabled={sale.commission === 0 || (sale.commissionpaid || 0) >= sale.commission || isReturned}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Pay Commission"
                >
                  <BadgeDollarSign className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Pay</span>
                </button>
                {userRole !== 'seller' && onReverseSale && (
                  <button
                    onClick={() => onReverseSale(sale)}
                    disabled={isReturned}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    title="Reverse Sale"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Reverse</span>
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Toggle Details"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Expanded Details ── */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-3.5 bg-slate-50/60 dark:bg-slate-800/20">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3.5 text-xs">
            {showCostAndProfit && (
              <DetailItem label="Cost" value={ksh(sale.productcost)} />
            )}
            <DetailItem label="Sold Price" value={ksh(sale.soldprice)} />
            {showCostAndProfit && (
              <>
                <DetailItem label="Gross Profit" value={ksh(sale.netprofit)} highlight={sale.netprofit > 0 ? 'green' : 'red'} />
                <DetailItem label="Net Profit" value={ksh(sale.netprofit - sale.commission)} />
              </>
            )}
            <DetailItem label="Commission" value={ksh(sale.commission)} />
            <DetailItem
              label="Commission Paid"
              value={sale.commissionpaid > 0 ? ksh(sale.commissionpaid) : 'Not paid'}
              highlight={sale.commissionpaid > 0 ? 'green' : undefined}
            />
            <DetailItem label="Category" value={sale.category} />
            <DetailItem label="IMEI / Batch" value={sale.IMEI || sale.batchNumber || '—'} mono />
            <DetailItem label="Payment Status" value={<StatusBadge status={sale.paymentstatus} />} />
            <DetailItem
              label="Finance Status"
              value={
                sale.financeDetails?.financeStatus ? (
                  <StatusBadge status={sale.financeDetails.financeStatus} />
                ) : '—'
              }
            />
            {sale.financeDetails?.financer && (
              <DetailItem label="Financer" value={sale.financeDetails.financer} />
            )}
            {sale.financeDetails?.financeAmount != null && sale.financeDetails.financeAmount > 0 && (
              <DetailItem label="Finance Amt" value={ksh(sale.financeDetails.financeAmount)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem: React.FC<{
  label: string;
  value: React.ReactNode;
  highlight?: 'green' | 'red';
  mono?: boolean;
}> = ({ label, value, highlight, mono }) => (
  <div>
    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
    <p
      className={`text-xs font-semibold ${
        highlight === 'green'
          ? 'text-emerald-600 dark:text-emerald-400'
          : highlight === 'red'
          ? 'text-rose-500'
          : 'text-slate-700 dark:text-slate-200'
      } ${mono ? 'font-mono' : ''}`}
    >
      {value}
    </p>
  </div>
);

/* ─── Pending Finance Summary Banner ─────────────────────────────────────── */
const PendingFinanceBanner: React.FC<{ pendingSales: Sale[] }> = ({
  pendingSales,
}) => {
  const [open, setOpen] = useState(false);
  if (pendingSales.length === 0) return null;

  const totalPending = pendingSales.reduce(
    (sum, s) => sum + (s.financeDetails?.financeAmount || 0),
    0,
  );

  return (
    <div className="rounded-xl border border-violet-200 dark:border-violet-850/50 bg-gradient-to-r from-violet-50/60 to-indigo-50/60 dark:from-violet-950/10 dark:to-indigo-950/10 overflow-hidden mb-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-none" />
          <div>
            <p className="text-sm font-semibold text-violet-800 dark:text-violet-300">
              {pendingSales.length} Pending Finance Sale{pendingSales.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-violet-600 dark:text-violet-400">
              Total: KES {totalPending.toLocaleString()} awaiting settlement
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-violet-500 flex-none" />
        ) : (
          <ChevronDown className="w-4 h-4 text-violet-500 flex-none" />
        )}
      </button>

      {open && (
        <div className="border-t border-violet-200 dark:border-violet-800/60 divide-y divide-violet-100 dark:divide-violet-900/40">
          {pendingSales.map((sale, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{sale.productname}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {sale.sellername} · {sale.shopname} · {new Date(sale.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-none">
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300">
                  KES {(sale.financeDetails?.financeAmount || 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{sale.financeDetails?.financer || '—'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  totalPages,
  currentPage,
  onPageChange,
  onPayCommission,
  onReverseSale,
  userRole,
  showActions = true,
  showCostAndProfit = true,
}) => {
  const [search, setSearch] = useState('');

  const filtered = sales.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.productname?.toLowerCase().includes(q) ||
      s.productmodel?.toLowerCase().includes(q) ||
      s.sellername?.toLowerCase().includes(q) ||
      s.shopname?.toLowerCase().includes(q) ||
      s.IMEI?.toLowerCase().includes(q) ||
      s.batchNumber?.toLowerCase().includes(q)
    );
  });

  const pendingSales = filtered.filter(
    (s) => s.financeDetails?.financeStatus?.toLowerCase() === 'pending',
  );

  // Page range buttons
  const pageNumbers: number[] = [];
  const delta = 2;
  for (
    let i = Math.max(1, currentPage - delta);
    i <= Math.min(totalPages, currentPage + delta);
    i++
  ) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">Sales Records</h4>
          <p className="text-xs text-slate-400 dark:text-slate-500">{filtered.length} record{filtered.length !== 1 ? 's' : ''} on this page</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search product, seller, IMEI…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 sm:w-56 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30 transition"
          />
          <ExportButtons data={sales} />
        </div>
      </div>

      {/* Pending Finance Banner */}
      <PendingFinanceBanner pendingSales={pendingSales} />

      {/* Sale Cards */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No matching records found.
          </div>
        ) : (
          filtered.map((sale, i) => (
            <SaleRow
              key={`${sale.saleId}-${i}`}
              sale={sale}
              showActions={showActions}
              showCostAndProfit={showCostAndProfit}
              onPayCommission={onPayCommission}
              onReverseSale={onReverseSale}
              userRole={userRole}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Page <span className="font-semibold text-slate-700 dark:text-slate-300">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>
            {pageNumbers[0] > 1 && (
              <>
                <button onClick={() => onPageChange(1)} className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">1</button>
                {pageNumbers[0] > 2 && <span className="text-slate-400 text-xs px-1">…</span>}
              </>
            )}
            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => onPageChange(n)}
                className={`px-2.5 py-1.5 text-xs rounded-lg border transition ${
                  n === currentPage
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {n}
              </button>
            ))}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <span className="text-slate-400 text-xs px-1">…</span>
                )}
                <button onClick={() => onPageChange(totalPages)} className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">{totalPages}</button>
              </>
            )}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTable;