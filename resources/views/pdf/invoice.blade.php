<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>{{ $documentType }} {{ $order->order_id }} - Happy Bags</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --accent: #7c3aed;
            --accent-light: #4f46e5;
            --accent-teal: #0891b2;
            --text-primary: #0f172a;
            --text-secondary: #64748b;
            --text-muted: #94a3b8;
            --border-light: #e2e8f0;
            --bg-light: #f8fafc;
            --bg-zebra: #fafbfc;
            --dark-bg: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
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

        /* Hero Header with Diagonal */
        .hero-header {
            background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%);
            padding: 20px 25px;
            position: relative;
            margin-bottom: 20px;
            clip-path: polygon(0 0, 100% 0, 100% 92%, 0% 100%);
        }

        .hero-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 50%);
            pointer-events: none;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
            z-index: 1;
        }

        .header-left {
            color: #ffffff;
        }

        .doc-type-display {
            font-family: Arial Black, sans-serif;
            font-size: 38px;
            font-weight: 900;
            letter-spacing: 0.05em;
            line-height: 1;
            margin-bottom: 6px;
        }

        .doc-subtitle {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            opacity: 0.6;
        }

        .header-right {
            text-align: right;
            color: #ffffff;
        }

        .company-name {
            font-family: Arial Black, sans-serif;
            font-size: 28px;
            font-weight: 900;
            font-style: italic;
            margin-bottom: 8px;
        }

        .company-info {
            font-size: 11px;
            line-height: 1.6;
            opacity: 0.75;
        }

        /* Main Content Layout */
        .content-grid {
            display: flex;
            gap: 25px;
            margin-bottom: 15px;
        }

        .client-section {
            flex: 1;
        }

        .meta-section {
            width: 290px;
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
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.5;
        }

        /* Meta Box */
        .meta-box {
            background: var(--bg-light);
            padding: 15px;
            border-radius: 8px;
        }

        .meta-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid var(--border-light);
        }

        .meta-row:last-child {
            border-bottom: none;
        }

        .meta-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-secondary);
        }

        .meta-value {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-primary);
        }

        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        .items-table thead {
            background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
        }

        .items-table th {
            padding: 10px 12px;
            text-align: left;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #ffffff;
            white-space: nowrap;
        }

        .items-table th:first-child {
            border-radius: 6px 0 0 0;
        }

        .items-table th:last-child {
            border-radius: 0 6px 0 0;
        }

        .items-table th:nth-child(3),
        .items-table th:nth-child(4),
        .items-table th:nth-child(5) {
            text-align: center;
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
        }

        .item-qty {
            text-align: center;
            font-weight: 600;
            color: var(--text-primary);
        }

        .item-price {
            text-align: right;
            font-variant-numeric: tabular-nums;
            font-size: 13px;
            color: var(--text-primary);
        }

        .item-total {
            text-align: right;
            font-weight: 800;
            font-size: 14px;
            color: var(--text-primary);
        }

        /* Summary Section */
        .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 15px;
        }

        .summary-box {
            width: 280px;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
            border-bottom: 1px solid var(--border-light);
        }

        .summary-label {
            color: var(--text-secondary);
        }

        .summary-value {
            font-weight: 600;
            color: var(--text-primary);
        }

        .grand-total-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--dark-bg);
            color: #ffffff;
            padding: 12px 15px;
            border-radius: 8px;
            margin-top: 10px;
        }

        .grand-total-label {
            font-weight: 700;
            font-size: 18px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .grand-total-value {
            font-family: Arial Black, sans-serif;
            font-size: 18px;
            font-weight: 900;
        }

        /* Payment Methods Section */
        .payment-section {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
            padding-top: 12px;
            border-top: 1px solid var(--border-light);
        }

        .payment-methods {
            flex: 1;
        }

        .payment-cards {
            display: flex;
            gap: 10px;
            margin-top: 8px;
        }

        .payment-card {
            background: var(--bg-light);
            padding: 10px;
            border-radius: 6px;
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .payment-icon {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 14px;
            font-weight: bold;
        }

        .payment-card:first-child .payment-icon {
            background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
        }

        .payment-card:last-child .payment-icon {
            background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
        }

        .payment-card-title {
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--text-secondary);
            font-weight: 700;
        }

        .payment-card-value {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-primary);
        }

        .signature-section {
            width: 200px;
            text-align: center;
        }

        .signature-line {
            width: 120px;
            border-bottom: 1px solid var(--text-primary);
            margin: 0 auto 8px auto;
            height: 40px;
        }

        .signature-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--accent);
            margin-bottom: 4px;
        }

        .signature-name {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary);
        }

        .signature-role {
            font-size: 10px;
            color: var(--text-secondary);
            text-transform: capitalize;
        }

        /* Notes Section */
        .notes-section {
            margin-bottom: 15px;
            padding-top: 10px;
            border-top: 1px solid var(--border-light);
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
            max-width: 400px;
        }

        /* Page Footer */
        .page-footer {
            position: absolute;
            bottom: 8mm;
            left: 12mm;
            right: 12mm;
            padding-top: 10px;
            border-top: 1px solid var(--border-light);
        }

        .footer-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            font-size: 9px;
            color: var(--text-secondary);
        }

        .footer-info span {
            display: flex;
            align-items: center;
            gap: 5px;
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
            margin-top: 8px;
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

            .hero-header {
                -webkit-print-color-adjust: exact;
            }

            .items-table thead {
                -webkit-print-color-adjust: exact;
            }

            .grand-total-box {
                -webkit-print-color-adjust: exact;
            }
        }

        @media screen {
            body {
                padding: 20px;
            }
        }
    </style>
    <script>
        window.addEventListener('beforeprint', function () {
            document.title = '{{ $documentType }}-{{ $order->order_id }}';
        });
    </script>
</head>

<body>

    <div class="page">

        <!-- Hero Header -->
        <div class="hero-header">
            <div class="header-content">
                <div class="header-left">
                    <div class="doc-type-display">{{ strtoupper($documentType) }}</div>
                    <div class="doc-subtitle">Transaction Record</div>
                </div>
                <div class="header-right">
                    <img src="{{ asset('images/HAPPY BAGS 4X4IN.jpeg') }}" alt="Happy Bags"
                        style="height: 55px; margin-bottom: 8px;">
                    <div class="company-info">
                        Kokomlemle, Accra<br />
                        Newtown Road<br />
                        hello@happybags.com
                    </div>
                </div>
            </div>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">
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
                    @if($order->client->email)
                        <br />{{ $order->client->email }}
                    @endif
                </div>
            </div>

            <div class="meta-section">
                <div class="meta-box">
                    <div class="meta-row">
                        <span class="meta-label">{{ $documentType }} Number</span>
                        <span class="meta-value">INV-{{ $order->order_id }}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Issue Date</span>
                        <span class="meta-value">{{ $issueDate }}</span>
                    </div>
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
                    <th>Amount</th>
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

        <!-- Summary Section -->
        <div class="summary-section">
            <div class="summary-box">
                <div class="summary-row">
                    <span class="summary-label">Subtotal</span>
                    <span class="summary-value">GHC {{ number_format($order->subtotal, 2) }}</span>
                </div>
                @if($order->is_vat)
                    <div class="summary-row">
                        <span class="summary-label">VAT ({{ $vatPercentage }}%)</span>
                        <span class="summary-value">GHC {{ number_format($vatAmount, 2) }}</span>
                    </div>
                @endif
                <div class="grand-total-box">
                    <span class="grand-total-label">Total Amount: </span>
                    <span class="grand-total-value">GHC {{ number_format($order->total, 2) }}</span>
                </div>
            </div>
        </div>

        <!-- Payment Methods & Signature -->
        <div class="payment-section">
            <div class="payment-methods">
                <div class="section-label">Payment Methods</div>
                <div class="payment-cards">
                    <div class="payment-card">
                        <div class="payment-icon">₵</div>
                        <div>
                            <div class="payment-card-title">Bank Transfer</div>
                            <div class="payment-card-value">GH-HB-00-221-44</div>
                        </div>
                    </div>
                    <div class="payment-card">
                        <div class="payment-icon">◈</div>
                        <div>
                            <div class="payment-card-title">Secure Portal</div>
                            <div class="payment-card-value">pay.happybags.gh/INV-{{ $order->order_id }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="signature-section">
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Signature</div>
                <div class="signature-name">{{ $order->user?->name ?? 'N/A' }}</div>
                <div class="signature-role">{{ $order->user?->role ?? '' }}</div>
            </div>
        </div>

        <!-- Notes Section -->
        <div class="notes-section">
            <div class="notes-label">Notes & Terms</div>
            <div class="notes-content">
                Payment is due within 30 days of invoice date. Please include invoice number on your payment reference.
                For questions, contact hello@happybags.com
            </div>
        </div>

        <!-- Page Footer -->
        <div class="page-footer">
            <div class="footer-info">
                <span><strong>Reg:</strong> GH-123456789</span>
                <span><strong>VAT:</strong> 0123456789</span>
                <span><strong>Tel:</strong> +233 20 123 4567</span>
                <span><strong>Web:</strong> www.happybags.com</span>
            </div>
            <div class="footer-legal">
                This document was generated electronically and is valid without signature. © 2024 Happy Bags. All rights
                reserved.
            </div>
        </div>

    </div>

</body>

</html>