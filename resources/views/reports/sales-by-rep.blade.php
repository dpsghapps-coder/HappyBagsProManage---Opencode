@extends('reports.layout')

@section('content')
<table>
    <thead>
        <tr>
            <th>Sales Rep</th>
            <th class="text-right">Order Count</th>
            <th class="text-right">Total Revenue</th>
        </tr>
    </thead>
    <tbody>
        @foreach($reps as $rep)
        <tr>
            <td>{{ $rep['rep_name'] }}</td>
            <td class="text-right">{{ $rep['order_count'] }}</td>
            <td class="text-right">GHC {{ number_format($rep['total_revenue'], 2) }}</td>
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
