@extends('reports.layout')

@section('content')
@foreach($clients as $client)
<div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
    <h3 style="color: #7C3AED; margin-bottom: 10px;">{{ $client['client_name'] }}</h3>
    <p style="color: #666; margin-bottom: 5px;">Orders: {{ $client['order_count'] }} | Total Spent: GHC {{ $client['total_spent'] }}</p>
    
    <table style="margin-top: 10px;">
        <thead>
            <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th class="text-right">Total</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($client['orders'] as $order)
            <tr>
                <td>{{ $order['order_id'] }}</td>
                <td>{{ $order['date'] }}</td>
                <td class="text-right">GHC {{ $order['total'] }}</td>
                <td><span class="badge badge-info">{{ $order['status'] }}</span></td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endforeach

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
