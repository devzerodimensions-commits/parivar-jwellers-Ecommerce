import { formatPrice, formatDate } from './format.js';

/**
 * Open a printable invoice for an order in a new window and trigger the
 * browser's print dialog (the user can "Save as PDF"). No extra dependencies.
 */
export const downloadInvoice = (order, settings = {}) => {
  const symbol = settings.currency?.symbol || '₹';
  const site = settings.siteName || 'Jewelly';
  const addr = order.shippingAddress || {};

  const rows = order.items
    .map(
      (it) => `
      <tr>
        <td>${escapeHtml(it.name)}${it.variant ? `<br><small>${escapeHtml(it.variant)}</small>` : ''}</td>
        <td style="text-align:center">${it.quantity}</td>
        <td style="text-align:right">${formatPrice(it.price, symbol)}</td>
        <td style="text-align:right">${formatPrice(it.price * it.quantity, symbol)}</td>
      </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Invoice ${order.orderNumber}</title>
<style>
  * { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; }
  body { margin: 40px; }
  .head { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #C8A04B; padding-bottom:16px; }
  .brand { font-size:28px; font-weight:bold; color:#C8A04B; }
  h1 { font-size:20px; margin:0; }
  table { width:100%; border-collapse:collapse; margin-top:24px; }
  th, td { padding:8px 10px; border-bottom:1px solid #eee; font-size:13px; }
  th { text-align:left; background:#faf6ec; }
  .totals { margin-top:16px; width:280px; margin-left:auto; font-size:13px; }
  .totals div { display:flex; justify-content:space-between; padding:4px 0; }
  .totals .grand { border-top:2px solid #C8A04B; font-weight:bold; font-size:15px; padding-top:8px; }
  .muted { color:#777; font-size:12px; }
</style></head>
<body>
  <div class="head">
    <div>
      <div class="brand">${escapeHtml(site)}</div>
      <p class="muted">${escapeHtml(settings.contact?.address || '')}</p>
    </div>
    <div style="text-align:right">
      <h1>TAX INVOICE</h1>
      <p class="muted">${order.orderNumber}<br>${formatDate(order.createdAt)}</p>
    </div>
  </div>

  <div style="margin-top:20px">
    <strong>Bill To:</strong><br>
    <span class="muted">
      ${escapeHtml(addr.fullName || '')}<br>
      ${escapeHtml(addr.line1 || '')} ${escapeHtml(addr.line2 || '')}<br>
      ${escapeHtml(addr.city || '')}, ${escapeHtml(addr.state || '')} ${escapeHtml(addr.postalCode || '')}<br>
      ${escapeHtml(addr.phone || '')}
    </span>
  </div>

  <table>
    <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>${formatPrice(order.itemsPrice, symbol)}</span></div>
    ${order.discount ? `<div><span>Discount</span><span>- ${formatPrice(order.discount, symbol)}</span></div>` : ''}
    <div><span>Tax</span><span>${formatPrice(order.taxPrice, symbol)}</span></div>
    <div><span>Shipping</span><span>${order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice, symbol)}</span></div>
    <div class="grand"><span>Total</span><span>${formatPrice(order.totalPrice, symbol)}</span></div>
  </div>

  <p class="muted" style="margin-top:40px;text-align:center">
    Payment: ${order.paymentMethod} · ${order.isPaid ? 'Paid' : 'Pending'}<br>
    Thank you for shopping with ${escapeHtml(site)}.
  </p>

  <script>window.onload = () => { window.print(); }</script>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
};

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
