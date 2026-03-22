@extends('reports.layout')

@section('content')
<div class="summary-box">
    <div class="summary-grid">
        <div class="summary-item">
            <div class="summary-label">Total Orders</div>
            <div class="summary-value">{{ $total_orders }}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Total Revenue</div>
            <div class="summary-value">GHC {{ $total_revenue }}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Total Paid</div>
            <div class="summary-value">GHC {{ $total_paid }}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Outstanding</div>
            <div class="summary-value">GHC {{ $outstanding }}</div>
        </div>
        <div class="summary-item" style="grid-column: span 2;">
            <div class="summary-label">Average Order Value</div>
            <div class="summary-value">GHC {{ $avg_order_value }}</div>
        </div>
    </div>
</div>

<div class="signature-box">
    <div class="signature-line">
        <hr>
        <p>Signature</p>
    </div>
    <div class="signature-line">
        <hr>
        <p>Date</p>
    </div>
</div>
@endsection
