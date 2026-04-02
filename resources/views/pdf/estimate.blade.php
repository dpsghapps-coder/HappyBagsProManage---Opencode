<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>{{ $documentType }} {{ $order->order_id }} - Happy Bags</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            --accent: #1e40af;
            --accent-light: #3b82f6;
            --text-primary: #0f172a;
            --text-secondary: #64748b;
            --text-muted: #94a3b8;
            --border-light: #e2e8f0;
            --bg-light: #f8fafc;
            --bg-zebra: #fafbfc;
        }
        
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 13px;
            line-height: 1.4;
            color: var(--text-primary);
            background: #f8f9fa;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        @page {
            size: A4;
            margin: 0;
        }
        
        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 8mm 12mm 18mm 12mm;
            margin: 0 auto;
            background: #ffffff;
            position: relative;
        }
        
        /* Header Layout */
        .header {
            display: flex;
            flex-direction: row;
            gap: 25px;
            margin-bottom: 15px;
        }
        
        .header-main {
            flex: 1;
        }
        
        /* Brand Section */
        .brand {
            font-family: Arial Black, sans-serif;
            font-size: 42px;
            font-weight: 900;
            font-style: italic;
            color: #000000;
            line-height: 1;
            margin-bottom: 8px;
        }
        
        .brand-info {
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.4;
        }
        
        .brand-info strong {
            color: var(--text-primary);
            font-weight: 700;
        }
        
        /* Client Section */
        .client-section {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--border-light);
        }
        
        .section-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: var(--accent);
            margin-bottom: 6px;
        }
        
        .client-name {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 4px;
        }
        
        .client-details {
            font-size: 14px;
            color: var(--text-secondary);
            line-height: 1.5;
        }
        
        /* Enhanced Dark Panel */
        .dark-panel {
            background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
            width: 240px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            color: #ffffff;
            min-height: 180px;
            position: relative;
            border-left: 4px solid var(--accent-light);
        }
        
        .brand-image {
            height: 35px;
            margin-bottom: 8px;
        }
        
        .doc-label {
            font-size: 9px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: rgba(255, 255, 255, 0.4);
            margin-bottom: 4px;
        }
        
        .doc-type {
            font-family: Arial Black, sans-serif;
            font-size: 28px;
            font-weight: 900;
            line-height: 1;
            margin-bottom: 15px;
        }
        
        .doc-number {
            margin-bottom: 12px;
        }
        
        .doc-number-value {
            font-size: 13px;
            font-weight: 700;
            color: #ffffff;
        }
        
        .doc-date {
            margin-top: 10px;
        }
        
        .doc-date-value {
            font-size: 13px;
            font-weight: 700;
            color: #ffffff;
        }
        
        .panel-total {
            margin-top: auto;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, 0.15);
        }
        
        .panel-total-label {
            font-size: 9px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: rgba(255, 255, 255, 0.4);
            margin-bottom: 2px;
        }
        
        .panel-total-value {
            font-family: Arial Black, sans-serif;
            font-size: 20px;
            font-weight: 900;
        }
        
        /* Items Table with Zebra Striping */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            table-layout: auto;
        }
        
        .items-table thead {
            background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .items-table th {
            padding: 8px 12px;
            text-align: left;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-secondary);
            border-bottom: 2px solid var(--accent);
            white-space: nowrap;
        }
        
        .items-table th:first-child {
            border-radius: 6px 0 0 0;
        }
        
        .items-table th:last-child {
            border-radius: 0 6px 0 0;
        }
        
        .items-table th:nth-child(4),
        .items-table th:nth-child(5) {
            text-align: right;
        }
        
        .items-table tbody tr {
            border-bottom: 1px solid #f1f5f9;
        }
        
        .items-table tbody tr:nth-child(even) {
            background: var(--bg-zebra);
        }
        
        .items-table tbody tr:hover {
            background: #f1f5f9;
        }
        
        .items-table td {
            padding: 10px 12px;
            vertical-align: middle;
        }
        
        .item-num {
            color: var(--text-muted);
            font-family: Courier New, monospace;
            font-size: 12px;
        }
        
        .item-name {
            font-weight: 700;
            font-size: 14px;
            color: var(--text-primary);
            white-space: normal;
            min-width: 200px;
        }
        
        .item-qty {
            text-align: center;
            font-weight: 700;
            color: var(--text-primary);
            white-space: nowrap;
        }
        
        .item-price {
            text-align: right;
            font-variant-numeric: tabular-nums;
            font-size: 13px;
            color: var(--text-primary);
            white-space: nowrap;
        }
        
        .item-total {
            text-align: right;
            font-weight: 800;
            font-size: 14px;
            color: var(--text-primary);
            white-space: nowrap;
        }
        
        /* Footer Section */
        .footer {
            display: flex;
            flex-direction: row;
            gap: 25px;
            padding-top: 15px;
            margin-top: 30px;
            border-top: 1px solid var(--border-light);
        }
        
        .notes-section {
            flex: 1;
        }
        
        .notes-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: var(--accent);
            margin-bottom: 6px;
        }
        
        .notes-content {
            font-size: 11px;
            color: var(--text-secondary);
            line-height: 1.4;
            max-width: 300px;
        }
        
        .footer-right {
            width: 240px;
        }
        
        .totals-section {
            width: 100%;
        }
        
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
        }
        
        .totals-row-label {
            color: var(--text-secondary);
        }
        
        .totals-row-value {
            font-weight: 600;
            color: var(--text-primary);
        }
        
        .grand-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%);
            color: #ffffff;
            padding: 12px 15px;
            border-radius: 6px;
            margin-top: 10px;
        }
        
        .grand-total-label {
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        .grand-total-value {
            font-family: Arial Black, sans-serif;
            font-size: 18px;
            font-weight: 900;
        }
        
        /* Signature Section */
        .signature-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 25px;
            padding-top: 12px;
        }
        
        .signature-block {
            text-align: center;
            min-width: 160px;
        }
        
        .signature-line {
            width: 120px;
            border-bottom: 1px solid var(--text-primary);
            margin: 0 auto 6px auto;
            height: 30px;
        }
        
        .signature-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--accent);
            margin-bottom: 2px;
        }
        
        .signature-name {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-primary);
        }
        
        .signature-role {
            font-size: 9px;
            color: var(--text-secondary);
            text-transform: capitalize;
        }
        
        /* Page Footer with Company Info */
        .page-footer {
            position: absolute;
            bottom: 8mm;
            left: 12mm;
            right: 12mm;
            padding-top: 10px;
            border-top: 1px solid var(--border-light);
        }
        
        .footer-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        
        .footer-info {
            display: flex;
            gap: 20px;
            font-size: 9px;
            color: var(--text-secondary);
        }
        
        .footer-info span {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .footer-info strong {
            color: var(--text-primary);
            font-weight: 600;
        }
        
        .footer-legal {
            font-size: 8px;
            color: var(--text-muted);
            text-align: center;
            font-style: italic;
        }
        
        @media print {
            body {
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .page {
                width: 100%;
                padding: 10mm 15mm 20mm 15mm;
                box-shadow: none;
            }
            
            .page-footer {
                position: absolute;
                bottom: 10mm;
            }
        }
        
        @media screen {
            body {
                padding: 20px;
            }
        }
    </style>
    <script>
        window.addEventListener('beforeprint', function() {
            document.title = '{{ $documentType }}_EST-{{ $order->order_id }}';
        });
    </script>
</head>

<body>

    <div class="page">
        
        <!-- Header -->
        <div class="header">
            <div class="header-main">
                <img src="{{ asset('images/HAPPY BAGS 4X4IN.jpeg') }}" alt="Happy Bags" class="brand-image">
                <div class="brand-info">
                    2443 Editorial Way, Suite 100<br />
                    Creative District, NY 10012<br />
                    <strong>hello@happybags.com</strong>
                </div>
                
                <div class="client-section">
                    <div class="section-label">{{ $documentType }} To</div>
                    <div class="client-name">{{ $order->client->client_name ?? 'N/A' }}</div>
                    <div class="client-details">
                        @if($order->client->delivery_address)
                            {{ $order->client->delivery_address }}<br />
                        @endif
                        @if($order->client->mobile_no1)
                            {{ $order->client->mobile_no1 }}
                        @endif
                    </div>
                </div>
            </div>
            
            <div class="dark-panel">
                <div>
                    <div class="doc-label">Document</div>
                    <div class="doc-type">{{ strtoupper($documentType) }}</div>
                </div>
                
                <div class="doc-number">
                    <div class="section-label" style="color: rgba(255,255,255,0.5);">Number</div>
                    <div class="doc-number-value">EST-{{ $order->order_id }}</div>
                </div>
                
                <div class="doc-date">
                    <div class="section-label" style="color: rgba(255,255,255,0.5);">Date Issued</div>
                    <div class="doc-date-value">{{ $issueDate }}</div>
                </div>
                
                <div class="panel-total">
                    <div class="panel-total-label">Total Estimated</div>
                    <div class="panel-total-value">GHC {{ number_format($order->subtotal, 2) }}</div>
                </div>
            </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>No.</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $index => $item)
                <tr>
                    <td><span class="item-num">{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</span></td>
                    <td><span class="item-name">{{ $item['product_name'] ?? 'Product' }}</span></td>
                    <td class="item-qty">{{ $item['qty'] ?? 0 }}</td>
                    <td class="item-price">GHC {{ number_format($item['unit_price'] ?? 0, 2) }}</td>
                    <td class="item-total">GHC {{ number_format($item['line_total'] ?? 0, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        
        <!-- Footer -->
        <div class="footer">
            <div class="notes-section">
                <div class="notes-label">Notes & Terms</div>
                <div class="notes-content">
                    This {{ strtolower($documentType) }} is valid for 30 days from the date of issue. A 50% deposit is required to commence production. Timeline for completion is approximately 4-6 weeks post-approval.
                </div>
            </div>
            <div class="footer-right">
                <div class="totals-section">
                    <div class="totals-row">
                        <span class="totals-row-label">Subtotal</span>
                        <span class="totals-row-value">GHC {{ number_format($order->subtotal, 2) }}</span>
                    </div>
                    @if($order->is_vat)
                    <div class="totals-row">
                        <span class="totals-row-label">Tax ({{ $vatPercentage }}%)</span>
                        <span class="totals-row-value">GHC {{ number_format($vatAmount, 2) }}</span>
                    </div>
                    @endif
                    <div class="grand-total">
                        <span class="grand-total-label">Total</span>
                        <span class="grand-total-value">GHC {{ number_format($order->total, 2) }}</span>
                    </div>
                </div>
                
                <!-- Signature Section -->
                <div class="signature-section">
                    <div class="signature-block">
                        <div class="signature-line"></div>
                        <div class="signature-label">Prepared By</div>
                        <div class="signature-name">{{ $order->user?->name ?? 'N/A' }}</div>
                        <div class="signature-role">{{ $order->user?->role ?? '' }}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Page Footer with Company Info -->
        <div class="page-footer">
            <div class="footer-top">
                <div class="footer-info">
                    <span><strong>Reg:</strong> GH-123456789</span>
                    <span><strong>VAT:</strong> 0123456789</span>
                    <span><strong>Tel:</strong> +233 20 123 4567</span>
                    <span><strong>Web:</strong> www.happybags.com</span>
                </div>
            </div>
            <div class="footer-legal">
                This document was generated electronically and is valid without signature. © 2024 Happy Bags. All rights reserved.
            </div>
        </div>
        
    </div>

</body>

</html>
