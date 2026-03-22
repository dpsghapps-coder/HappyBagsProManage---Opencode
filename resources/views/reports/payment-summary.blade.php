@extends('reports.layout')

@section('content')
<div class="summary-box">
    <div class="summary-grid">
        <div class="summary-item">
            <div class="summary-label">Total Payments</div>
            <div class="summary-value">{{ $total_payments }}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Total Amount</div>
            <div class="summary-value">GHC {{ $total_amount }}</div>
        </div>
    </div>
</div>

<table>
    <thead>
        <tr>
            <th>Order ID</th>
            <th>Client</th>
            <th class="text-right">Amount</th>
            <th>Type</th>
            <th>Recorded By</th>
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
            <td>{{ $payment['recorded_by'] }}</td>
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
