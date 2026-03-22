@extends('reports.layout')

@section('content')
<div class="summary-box">
    <div class="summary-item">
        <div class="summary-label">Total Deliveries</div>
        <div class="summary-value">{{ $total_deliveries }}</div>
    </div>
</div>

<table>
    <thead>
        <tr>
            <th>Order ID</th>
            <th>Client</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Delivery Date</th>
            <th>Status</th>
            <th class="text-right">Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($deliveries as $delivery)
        <tr>
            <td>{{ $delivery['order_id'] }}</td>
            <td>{{ $delivery['client_name'] }}</td>
            <td>{{ $delivery['delivery_address'] }}</td>
            <td>{{ $delivery['contact'] }}</td>
            <td>{{ $delivery['delivery_date'] }}</td>
            <td><span class="badge badge-warning">{{ $delivery['status'] }}</span></td>
            <td class="text-right">GHC {{ $delivery['total'] }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<div class="signature-box">
    <div class="signature-line">
        <hr>
        <p>Driver Signature</p>
    </div>
    <div class="signature-line">
        <hr>
        <p>Date</p>
    </div>
</div>
@endsection
