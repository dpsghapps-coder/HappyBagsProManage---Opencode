<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $report_title ?? 'Report' }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #7C3AED; }
        .header h1 { color: #7C3AED; font-size: 24px; margin-bottom: 5px; }
        .header h2 { color: #333; font-size: 18px; font-weight: normal; }
        .meta { margin-top: 15px; color: #666; font-size: 11px; }
        .summary-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .summary-item { text-align: center; }
        .summary-label { font-size: 10px; color: #666; text-transform: uppercase; }
        .summary-value { font-size: 18px; font-weight: bold; color: #7C3AED; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #7C3AED; color: white; padding: 10px 8px; text-align: left; font-size: 11px; }
        td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #666; }
        .signature-box { margin-top: 50px; display: flex; justify-content: space-between; }
        .signature-line { width: 45%; }
        .signature-line hr { border: none; border-top: 1px solid #333; margin-top: 40px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-info { background: #dbeafe; color: #1e40af; }
        .badge-gray { background: #f3f4f6; color: #374151; }
    </style>
</head>
<body>
    <div class="header">
        <h1>HappyBags Pro Manager</h1>
        <h2>{{ $report_title ?? 'Report' }}</h2>
        <div class="meta">
            @if(isset($date_from))
                <p>Date Range: {{ $date_from }} - {{ $date_to }}</p>
            @endif
            <p>Generated: {{ $generated_at ?? now()->format('F d, Y H:i') }}</p>
        </div>
    </div>
    
    @yield('content')
    
    <div class="footer">
        <p>HappyBags Pro Manager - Confidential Report</p>
    </div>
</body>
</html>
