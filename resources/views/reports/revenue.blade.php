@extends('reports.layout')

@section('content')
<div class="summary-box">
    <div class="summary-grid">
        <div class="summary-item">
            <div class="summary-label">Total Revenue</div>
            <div class="summary-value">GHC {{ $total_revenue }}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Total Paid</div>
            <div class="summary-value">GHC {{ $total_paid }}</div>
        </div>
        <div class="summary-item" style="grid-column: span 2;">
            <div class="summary-label">Outstanding</div>
            <div class="summary-value">GHC {{ $outstanding }}</div>
        </div>
    </div>
</div>

<h3 style="margin: 20px 0 10px;">Payment Details</h3>
<table>
    <thead>
        <tr>
            <th>Order ID</th>
            <th>Client</th>
            <th class="text-right">Amount</th>
            <th>Type</th>
            <th>Date</th>
        </tr>
    </thead>
    <tbody>
        @foreach($payments as $payment)
        <tr>
            <td>{{ $payment['order_id'] }}</td>
            <td>{{ $payment['client_name'] }}</td>
            <td class="text-right">GHC {{ $payment['amount'] }}</td>
            <td>{{ $payment['payment_type'] }}</td>
            <td>{{ $payment['date'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

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
