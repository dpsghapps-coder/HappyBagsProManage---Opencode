@extends('reports.layout')

@section('content')
<div class="summary-box">
    <div class="summary-item">
        <div class="summary-label">Total Orders</div>
        <div class="summary-value">{{ $total_orders }}</div>
    </div>
</div>

<table>
    <thead>
        <tr>
            <th>Order ID</th>
            <th>Client</th>
            <th>Status</th>
            <th class="text-right">Subtotal</th>
            <th class="text-right">VAT</th>
            <th class="text-right">Total</th>
            <th>Delivery Date</th>
            <th>Created</th>
        </tr>
    </thead>
    <tbody>
        @foreach($orders as $order)
        <tr>
            <td>{{ $order['order_id'] }}</td>
            <td>{{ $order['client_name'] }}</td>
            <td><span class="badge badge-info">{{ $order['status'] }}</span></td>
            <td class="text-right">GHC {{ $order['subtotal'] }}</td>
            <td class="text-right">GHC {{ $order['vat'] }}</td>
            <td class="text-right">GHC {{ $order['total'] }}</td>
            <td>{{ $order['delivery_date'] }}</td>
            <td>{{ $order['created_at'] }}</td>
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
