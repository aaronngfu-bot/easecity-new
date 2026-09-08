'use client'

/**
 * Server-generated PDF download button — hits the tokened PDF API route and
 * opens the result in a new tab (browser native PDF viewer / save).
 */
export function PdfButton({ quoteId, token, label }: { quoteId: string; token: string; label: string }) {
  return (
    <a
      href={`/api/quote/${quoteId}/pdf?token=${encodeURIComponent(token)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-auto block w-full rounded-lg border border-signal/40 bg-signal/10 px-5 py-2.5 text-center text-sm font-medium text-signal transition-colors hover:bg-signal/20"
    >
      {label}
    </a>
  )
}

export function ReceiptPdfButton({ receiptId, token, label }: { receiptId: string; token: string; label: string }) {
  return (
    <a
      href={`/api/receipt/${receiptId}/pdf?token=${encodeURIComponent(token)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="receipt-noprint mx-auto block w-full rounded-lg border border-signal/40 bg-signal/10 px-5 py-2.5 text-center text-sm font-medium text-signal transition-colors hover:bg-signal/20"
    >
      {label}
    </a>
  )
}
