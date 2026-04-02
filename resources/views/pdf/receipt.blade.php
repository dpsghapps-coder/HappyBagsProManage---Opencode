<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <title>Official Receipt - Happy Bags</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #1a1c1e;
            --secondary: #5a5f66;
            --accent: #7c3aed;
            --surface: #faf9fc;
            --surface-container: #eeedf0;
            --surface-container-low: #f4f3f6;
            --surface-container-lowest: #ffffff;
            --outline: #777777;
            --outline-variant: #c6c6c6;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            color: var(--primary);
            background: var(--surface);
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        @page {
            size: A5 landscape;
            margin: 0;
        }

        .page {
            width: 210mm;
            height: 148mm;
            padding: 10mm 12mm;
            margin: 0 auto;
            background: var(--surface-container-lowest);
            position: relative;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--outline-variant);
        }

        .header-left {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .brand-row {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .brand-logo {
            height: 35px;
            width: auto;
        }

        .brand-name {
            font-weight: 900;
            font-size: 24px;
            color: var(--primary);
            letter-spacing: -0.5px;
        }

        .brand-tagline {
            font-size: 10px;
            color: var(--secondary);
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-left: 45px;
        }

        .header-right {
            text-align: right;
        }

        .receipt-title {
            font-weight: 900;
            font-size: 28px;
            color: var(--primary);
            letter-spacing: -0.5px;
            margin-bottom: 8px;
        }

        .receipt-meta {
            display: flex;
            flex-direction: column;
            gap: 4px;
            align-items: flex-end;
        }

        .meta-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .meta-label {
            font-size: 9px;
            color: var(--secondary);
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .meta-value {
            font-size: 13px;
            font-weight: 700;
            color: var(--primary);
        }

        .content {
            display: flex;
            gap: 20px;
            flex: 1;
        }

        .left-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .info-box {
            background: var(--surface-container);
            border-radius: 6px;
            padding: 12px;
        }

        .info-box-low {
            background: var(--surface-container-low);
            border-radius: 6px;
            padding: 12px;
        }

        .info-label {
            font-size: 9px;
            color: var(--secondary);
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-bottom: 4px;
        }

        .info-value {
            font-size: 15px;
            font-weight: 700;
            color: var(--primary);
        }

        .info-value-medium {
            font-size: 13px;
            font-weight: 600;
            font-style: italic;
            color: var(--primary);
        }

        .right-section {
            width: 140px;
        }

        .amount-box {
            background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
            color: white;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .amount-label {
            font-size: 9px;
            color: rgba(255, 255, 255, 0.7);
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-bottom: 6px;
        }

        .amount-value {
            font-size: 26px;
            font-weight: 900;
        }

        .thank-you-note {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid var(--outline-variant);
        }

        .thank-you-note p {
            font-size: 7px;
            color: var(--secondary);
            line-height: 1.4;
        }

        .signature-section {
            margin-top: 15px;
            display: flex;
            justify-content: flex-end;
        }

        .signature-block {
            text-align: center;
            min-width: 180px;
        }

        .signature-line {
            border-bottom: 1px solid var(--outline-variant);
            margin-bottom: 4px;
            height: 35px;
        }

        .signature-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--accent);
        }

        .signature-name {
            font-size: 11px;
            font-weight: 700;
            color: var(--primary);
        }

        .signature-role {
            font-size: 9px;
            color: var(--secondary);
            text-transform: capitalize;
        }

        .page-footer {
            position: absolute;
            bottom: 6px;
            left: 12mm;
            right: 12mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 6px;
            border-top: 1px solid rgba(0, 0, 0, 0.08);
        }

        .footer-copyright {
            font-size: 8px;
            color: var(--secondary);
        }

        .footer-contact {
            display: flex;
            gap: 15px;
            font-size: 8px;
            color: var(--secondary);
        }

        @media print {
            body {
                background: white;
            }
        }
    </style>
</head>

<body>

    <div class="page">
        <!-- Header -->
        <header class="header">
            <div class="header-left">
                <div class="brand-row">
                    <img src="{{ url('images/HAPPY BAGS 4X4IN.jpeg') }}" alt="Happy Bags" class="brand-logo">
                    <span class="brand-name">HAPPY BAGS</span>
                </div>
                <p class="brand-tagline">Quality Luxury Essentials</p>
            </div>
            <div class="header-right">
                <h1 class="receipt-title">OFFICIAL RECEIPT</h1>
                <div class="receipt-meta">
                    <div class="meta-row">
                        <span class="meta-label">Receipt No.</span>
                        <span class="meta-value">RCP-{{ $order->order_id }}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-label">Date</span>
                        <span class="meta-value">{{ $order->created_at ? $order->created_at->format('F j, Y') : now()->format('F j, Y') }}</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <div class="content">
            <div class="left-section">
                <div class="info-box">
                    <div class="info-label">Received From</div>
                    <div class="info-value">{{ $order->client->client_name ?? 'N/A' }}</div>
                </div>

                <div class="info-box-low">
                    <div class="info-label">The Sum of (In Words)</div>
                    <div class="info-value-medium">{{ numberToWords($amountPaid) }}</div>
                </div>

                <div class="info-box">
                    <div class="info-label">Payment For</div>
                    <div class="info-value">Order #{{ $order->order_id }} - Payment for goods</div>
                </div>
            </div>

            <div class="right-section">
                <div class="amount-box">
                    <div class="amount-label">Amount Paid (GHC)</div>
                    <div class="amount-value">{{ number_format($amountPaid, 2) }}</div>
                </div>
            </div>
        </div>

        <!-- Thank You Note -->
        <div class="thank-you-note">
            <p>Thank you for your business. This receipt is computer generated and does not require a physical stamp. 
               All goods sold are subject to standard terms and conditions.</p>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature-block">
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Signature</div>
                <div class="signature-name">{{ $order->user->name ?? 'N/A' }}</div>
                <div class="signature-role">{{ $order->user->role ?? '' }}</div>
            </div>
        </div>

        <!-- Page Footer -->
        <div class="page-footer">
            <span class="footer-copyright">© Happy Bags. All rights reserved.</span>
            <div class="footer-contact">
                <span>Accra, Ghana</span>
                <span>accounts@happybags.com</span>
            </div>
        </div>
    </div>

</body>

</html>
