@extends('reports.layout')

@section('content')
<table>
    <thead>
        <tr>
            <th class="text-center">Rank</th>
            <th>Product Name</th>
            <th class="text-right">Quantity Sold</th>
            <th class="text-right">Total Revenue</th>
        </tr>
    </thead>
    <tbody>
        @php $rank = 1; @endphp
        @foreach($products as $product)
        <tr style="{{ $rank <= 3 ? 'background: ' . ($rank == 1 ? '#fef3c7' : ($rank == 2 ? '#f3f4f6' : '#fef3c7')) . ';' : '' }}">
            <td class="text-center">{{ $rank }}</td>
            <td><strong>{{ $product['product_name'] }}</strong></td>
            <td class="text-right">{{ $product['quantity_sold'] }}</td>
            <td class="text-right">GHC {{ number_format($product['total_revenue'], 2) }}</td>
        </tr>
        @php $rank++; @endphp
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
