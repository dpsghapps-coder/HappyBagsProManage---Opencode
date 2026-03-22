@extends('reports.layout')

@section('content')
<table>
    <thead>
        <tr>
            <th>Product Name</th>
            <th class="text-right">Quantity Sold</th>
            <th class="text-right">Total Revenue</th>
        </tr>
    </thead>
    <tbody>
        @foreach($products as $product)
        <tr>
            <td>{{ $product['product_name'] }}</td>
            <td class="text-right">{{ $product['quantity_sold'] }}</td>
            <td class="text-right">GHC {{ number_format($product['total_revenue'], 2) }}</td>
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
