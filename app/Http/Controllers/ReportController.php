<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    private $reportMethods = [
        'sales-summary' => 'salesSummary',
        'sales-by-product' => 'salesByProduct',
        'sales-by-client' => 'salesByClient',
        'sales-by-rep' => 'salesByRep',
        'revenue' => 'revenueReport',
        'outstanding-payments' => 'outstandingPayments',
        'payment-summary' => 'paymentSummary',
        'order-summary' => 'orderSummary',
        'orders-by-status' => 'ordersByStatus',
        'delivery-schedule' => 'deliverySchedule',
        'client-directory' => 'clientDirectory',
        'client-order-history' => 'clientOrderHistory',
        'product-sales-summary' => 'productSalesSummary',
        'top-selling-products' => 'topSellingProducts',
    ];

    public function index()
    {
        return inertia('Reports/Index');
    }

    public function preview(Request $request)
    {
        $request->validate([
            'report_type' => 'required|string',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $reportType = $request->report_type;
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to . ' 23:59:59';

        if (!isset($this->reportMethods[$reportType])) {
            return response()->json(['error' => 'Invalid report type'], 400);
        }

        $data = ReportService::{$this->reportMethods[$reportType]}($dateFrom, $dateTo);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'report_type' => 'required|string',
            'format' => 'required|in:pdf,excel',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $reportType = $request->report_type;
        $format = $request->format;
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to . ' 23:59:59';

        if (!isset($this->reportMethods[$reportType])) {
            return response()->json(['error' => 'Invalid report type'], 400);
        }

        $data = ReportService::{$this->reportMethods[$reportType]}($dateFrom, $dateTo);

        if ($format === 'pdf') {
            return $this->generatePdf($reportType, $data);
        }

        return $this->generateExcel($reportType, $data);
    }

    private function generatePdf($reportType, $data)
    {
        $reportTitles = [
            'sales-summary' => 'Sales Summary',
            'sales-by-product' => 'Sales by Product',
            'sales-by-client' => 'Sales by Client',
            'sales-by-rep' => 'Sales by Sales Rep',
            'revenue' => 'Revenue Report',
            'outstanding-payments' => 'Outstanding Payments',
            'payment-summary' => 'Payment Summary',
            'order-summary' => 'Order Summary',
            'orders-by-status' => 'Orders by Status',
            'delivery-schedule' => 'Delivery Schedule',
            'client-directory' => 'Client Directory',
            'client-order-history' => 'Client Order History',
            'product-sales-summary' => 'Product Sales Summary',
            'top-selling-products' => 'Top Selling Products',
        ];

        $title = $reportTitles[$reportType] ?? 'Report';
        $data['report_title'] = $title;

        $pdf = Pdf::loadView('reports.' . $reportType, $data);
        $pdf->setPaper('a4', 'portrait');

        $filename = str_replace(' ', '_', strtolower($title)) . '_' . date('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }

    private function generateExcel($reportType, $data)
    {
        $reportClasses = [
            'sales-summary' => \App\Exports\SalesSummaryExport::class,
            'sales-by-product' => \App\Exports\SalesByProductExport::class,
            'sales-by-client' => \App\Exports\SalesByClientExport::class,
            'sales-by-rep' => \App\Exports\SalesByRepExport::class,
            'revenue' => \App\Exports\RevenueExport::class,
            'outstanding-payments' => \App\Exports\OutstandingPaymentsExport::class,
            'payment-summary' => \App\Exports\PaymentSummaryExport::class,
            'order-summary' => \App\Exports\OrderSummaryExport::class,
            'orders-by-status' => \App\Exports\OrdersByStatusExport::class,
            'delivery-schedule' => \App\Exports\DeliveryScheduleExport::class,
            'client-directory' => \App\Exports\ClientDirectoryExport::class,
            'client-order-history' => \App\Exports\ClientOrderHistoryExport::class,
            'product-sales-summary' => \App\Exports\ProductSalesSummaryExport::class,
            'top-selling-products' => \App\Exports\TopSellingProductsExport::class,
        ];

        $exportClass = $reportClasses[$reportType] ?? null;

        if (!$exportClass) {
            return response()->json(['error' => 'Excel export not available for this report'], 400);
        }

        $reportTitles = [
            'sales-summary' => 'Sales Summary',
            'sales-by-product' => 'Sales by Product',
            'sales-by-client' => 'Sales by Client',
            'sales-by-rep' => 'Sales by Sales Rep',
            'revenue' => 'Revenue Report',
            'outstanding-payments' => 'Outstanding Payments',
            'payment-summary' => 'Payment Summary',
            'order-summary' => 'Order Summary',
            'orders-by-status' => 'Orders by Status',
            'delivery-schedule' => 'Delivery Schedule',
            'client-directory' => 'Client Directory',
            'client-order-history' => 'Client Order History',
            'product-sales-summary' => 'Product Sales Summary',
            'top-selling-products' => 'Top Selling Products',
        ];

        $title = $reportTitles[$reportType] ?? 'Report';
        $filename = str_replace(' ', '_', strtolower($title)) . '_' . date('Y-m-d');

        return Excel::download(new $exportClass($data), $filename . '.xlsx');
    }
}
