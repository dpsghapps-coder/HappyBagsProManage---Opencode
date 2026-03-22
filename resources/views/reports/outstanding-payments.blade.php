@extends('reports.layout')

@section('content')
<div class="summary-box">
    <div class="summary-item">
        <div class="summary-label">Total Outstanding</div>
        <div class="summary-value">GHC {{ $total_outstanding }}</div>
    </div>
</div>

<table>
    <thead>
        <tr>
            <th>Order ID</th>
            <th>Client</th>
            <th class="text-right">Total</th>
            <th class="text-right">Paid</th>
            <th class="text-right">Outstanding</th>
            <th>Delivery Date</th>
        </tr>
    </thead>
    <tbody>
        @foreach($orders as $order)
        <tr>
            <td>{{ $order['order_id'] }}</td>
            <td>{{ $order['client_name'] }}</td>
            <td class="text-right">GHC {{ $order['total'] }}</td>
            <td class="text-right">GHC {{ $order['paid'] }}</td>
            <td class="text-right">GHC {{ $order['outstanding'] }}</td>
            <td>{{ $order['delivery_date'] }}</td>
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
