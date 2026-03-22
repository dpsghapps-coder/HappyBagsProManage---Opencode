@extends('reports.layout')

@section('content')
<table>
    <thead>
        <tr>
            <th>Status</th>
            <th class="text-right">Order Count</th>
            <th class="text-right">Total Value</th>
        </tr>
    </thead>
    <tbody>
        @foreach($statuses as $status)
        <tr>
            <td><span class="badge badge-info">{{ $status->status }}</span></td>
            <td class="text-right">{{ $status->count }}</td>
            <td class="text-right">GHC {{ number_format($status->total, 2) }}</td>
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
