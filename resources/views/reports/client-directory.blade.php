@extends('reports.layout')

@section('content')
<div class="summary-box">
    <div class="summary-item">
        <div class="summary-label">Total Clients</div>
        <div class="summary-value">{{ $total_clients }}</div>
    </div>
</div>

<table>
    <thead>
        <tr>
            <th>Client Name</th>
            <th>Email</th>
            <th>Mobile 1</th>
            <th>Mobile 2</th>
            <th>Address</th>
            <th class="text-right">Total Orders</th>
        </tr>
    </thead>
    <tbody>
        @foreach($clients as $client)
        <tr>
            <td>{{ $client['client_name'] }}</td>
            <td>{{ $client['email'] }}</td>
            <td>{{ $client['mobile_no1'] }}</td>
            <td>{{ $client['mobile_no2'] }}</td>
            <td>{{ $client['delivery_address'] }}</td>
            <td class="text-right">{{ $client['total_orders'] }}</td>
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
