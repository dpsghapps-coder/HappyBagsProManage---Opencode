<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Client;
use App\Models\Product;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportService
{
    public static function salesSummary($dateFrom, $dateTo)
    {
        $orders = Order::whereBetween('order_created_at', [$dateFrom, $dateTo])->get();
        
        $totalOrders = $orders->count();
        $totalRevenue = $orders->sum('total');
        $totalPaid = Payment::whereHas('order', function($q) use ($dateFrom, $dateTo) {
            $q->whereBetween('order_created_at', [$dateFrom, $dateTo]);
        })->sum('amount');
        $outstanding = $totalRevenue - $totalPaid;
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        return [
            'title' => 'Sales Summary Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'total_orders' => $totalOrders,
            'total_revenue' => number_format($totalRevenue, 2),
            'total_paid' => number_format($totalPaid, 2),
            'outstanding' => number_format($outstanding, 2),
            'avg_order_value' => number_format($avgOrderValue, 2),
        ];
    }

    public static function salesByProduct($dateFrom, $dateTo)
    {
        $orders = Order::whereBetween('order_created_at', [$dateFrom, $dateTo])->get();
        
        $productData = [];
        foreach ($orders as $order) {
            $items = is_array($order->items) ? $order->items : json_decode($order->items, true);
            foreach ($items as $item) {
                $productName = $item['product_name'] ?? 'Unknown';
                if (!isset($productData[$productName])) {
                    $productData[$productName] = [
                        'product_name' => $productName,
                        'quantity_sold' => 0,
                        'total_revenue' => 0,
                    ];
                }
                $productData[$productName]['quantity_sold'] += $item['qty'] ?? 0;
                $productData[$productName]['total_revenue'] += $item['line_total'] ?? 0;
            }
        }

        usort($productData, fn($a, $b) => $b['quantity_sold'] - $a['quantity_sold']);

        return [
            'title' => 'Sales by Product Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'products' => array_values($productData),
        ];
    }

    public static function salesByClient($dateFrom, $dateTo)
    {
        $orders = Order::with('client')
            ->whereBetween('order_created_at', [$dateFrom, $dateTo])
            ->get();

        $clientData = [];
        foreach ($orders as $order) {
            $clientName = $order->client->client_name ?? 'Unknown';
            if (!isset($clientData[$clientName])) {
                $clientData[$clientName] = [
                    'client_name' => $clientName,
                    'order_count' => 0,
                    'total_revenue' => 0,
                ];
            }
            $clientData[$clientName]['order_count']++;
            $clientData[$clientName]['total_revenue'] += $order->total;
        }

        usort($clientData, fn($a, $b) => $b['total_revenue'] - $a['total_revenue']);

        return [
            'title' => 'Sales by Client Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'clients' => array_values($clientData),
        ];
    }

    public static function salesByRep($dateFrom, $dateTo)
    {
        $orders = Order::with('statusLogs.user')
            ->whereBetween('order_created_at', [$dateFrom, $dateTo])
            ->get();

        $repData = [];
        foreach ($orders as $order) {
            $firstLog = $order->statusLogs->sortBy('created_at')->first();
            $repName = $firstLog->user->name ?? 'Unknown';
            
            if (!isset($repData[$repName])) {
                $repData[$repName] = [
                    'rep_name' => $repName,
                    'order_count' => 0,
                    'total_revenue' => 0,
                ];
            }
            $repData[$repName]['order_count']++;
            $repData[$repName]['total_revenue'] += $order->total;
        }

        usort($repData, fn($a, $b) => $b['total_revenue'] - $a['total_revenue']);

        return [
            'title' => 'Sales by Sales Rep Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'reps' => array_values($repData),
        ];
    }

    public static function revenueReport($dateFrom, $dateTo)
    {
        $orders = Order::whereBetween('order_created_at', [$dateFrom, $dateTo])->get();
        $payments = Payment::whereHas('order', function($q) use ($dateFrom, $dateTo) {
            $q->whereBetween('order_created_at', [$dateFrom, $dateTo]);
        })->with('order')->get();

        $totalRevenue = $orders->sum('total');
        $totalPaid = $payments->sum('amount');
        $outstanding = $totalRevenue - $totalPaid;

        $paymentsList = $payments->map(function($payment) {
            return [
                'order_id' => $payment->order->order_id,
                'client_name' => $payment->order->client->client_name ?? 'Unknown',
                'amount' => number_format($payment->amount, 2),
                'payment_type' => $payment->payment_type,
                'date' => Carbon::parse($payment->payment_timestamp)->format('F d, Y'),
            ];
        });

        return [
            'title' => 'Revenue Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'total_revenue' => number_format($totalRevenue, 2),
            'total_paid' => number_format($totalPaid, 2),
            'outstanding' => number_format($outstanding, 2),
            'payments' => $paymentsList,
        ];
    }

    public static function outstandingPayments($dateFrom, $dateTo)
    {
        $orders = Order::with('client', 'payments')
            ->whereBetween('order_created_at', [$dateFrom, $dateTo])
            ->get();

        $outstandingOrders = $orders->filter(function($order) {
            return $order->totalPaid() < $order->total;
        })->map(function($order) {
            return [
                'order_id' => $order->order_id,
                'client_name' => $order->client->client_name ?? 'Unknown',
                'total' => number_format($order->total, 2),
                'paid' => number_format($order->totalPaid(), 2),
                'outstanding' => number_format($order->totalDue(), 2),
                'delivery_date' => $order->delivery_date ? Carbon::parse($order->delivery_date)->format('F d, Y') : 'N/A',
            ];
        });

        return [
            'title' => 'Outstanding Payments Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'orders' => array_values($outstandingOrders->toArray()),
            'total_outstanding' => number_format($outstandingOrders->sum('outstanding'), 2),
        ];
    }

    public static function paymentSummary($dateFrom, $dateTo)
    {
        $payments = Payment::with('order.client', 'user')
            ->whereBetween('payment_timestamp', [$dateFrom, $dateTo])
            ->orderBy('payment_timestamp', 'desc')
            ->get();

        $paymentsList = $payments->map(function($payment) {
            return [
                'order_id' => $payment->order->order_id ?? 'N/A',
                'client_name' => $payment->order->client->client_name ?? 'Unknown',
                'amount' => number_format($payment->amount, 2),
                'payment_type' => $payment->payment_type,
                'recorded_by' => $payment->user->name ?? 'Unknown',
                'date' => Carbon::parse($payment->payment_timestamp)->format('F d, Y H:i'),
            ];
        });

        return [
            'title' => 'Payment Summary Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'payments' => $paymentsList,
            'total_payments' => $payments->count(),
            'total_amount' => number_format($payments->sum('amount'), 2),
        ];
    }

    public static function orderSummary($dateFrom, $dateTo)
    {
        $orders = Order::with('client')
            ->whereBetween('order_created_at', [$dateFrom, $dateTo])
            ->orderBy('order_created_at', 'desc')
            ->get();

        $ordersList = $orders->map(function($order) {
            return [
                'order_id' => $order->order_id,
                'client_name' => $order->client->client_name ?? 'Unknown',
                'status' => $order->status,
                'subtotal' => number_format($order->subtotal, 2),
                'vat' => number_format(($order->is_vat ? $order->total - $order->subtotal : 0), 2),
                'total' => number_format($order->total, 2),
                'delivery_date' => $order->delivery_date ? Carbon::parse($order->delivery_date)->format('F d, Y') : 'N/A',
                'created_at' => Carbon::parse($order->created_at)->format('F d, Y'),
            ];
        });

        return [
            'title' => 'Order Summary Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'orders' => $ordersList,
            'total_orders' => $orders->count(),
        ];
    }

    public static function ordersByStatus($dateFrom, $dateTo)
    {
        $orders = Order::whereBetween('order_created_at', [$dateFrom, $dateTo])
            ->select('status', DB::raw('count(*) as count'), DB::raw('sum(total) as total'))
            ->groupBy('status')
            ->get();

        return [
            'title' => 'Orders by Status Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'statuses' => $orders,
        ];
    }

    public static function deliverySchedule($dateFrom, $dateTo)
    {
        $orders = Order::with('client')
            ->whereBetween('delivery_date', [$dateFrom, $dateTo])
            ->where('status', '!=', 'Order Completed')
            ->orderBy('delivery_date', 'asc')
            ->get();

        $deliveries = $orders->map(function($order) {
            return [
                'order_id' => $order->order_id,
                'client_name' => $order->client->client_name ?? 'Unknown',
                'delivery_address' => $order->client->delivery_address ?? 'N/A',
                'contact' => $order->client->mobile_no1 ?? 'N/A',
                'delivery_date' => Carbon::parse($order->delivery_date)->format('F d, Y'),
                'status' => $order->status,
                'total' => number_format($order->total, 2),
            ];
        });

        return [
            'title' => 'Delivery Schedule Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'deliveries' => $deliveries,
            'total_deliveries' => $orders->count(),
        ];
    }

    public static function clientDirectory()
    {
        $clients = Client::orderBy('client_name', 'asc')->get();

        $clientsList = $clients->map(function($client) {
            return [
                'client_name' => $client->client_name,
                'email' => $client->email ?? 'N/A',
                'mobile_no1' => $client->mobile_no1 ?? 'N/A',
                'mobile_no2' => $client->mobile_no2 ?? 'N/A',
                'delivery_address' => $client->delivery_address ?? 'N/A',
                'total_orders' => $client->orders->count(),
            ];
        });

        return [
            'title' => 'Client Directory Report',
            'generated_at' => now()->format('F d, Y H:i'),
            'clients' => $clientsList,
            'total_clients' => $clients->count(),
        ];
    }

    public static function clientOrderHistory($dateFrom, $dateTo)
    {
        $orders = Order::with('client')
            ->whereBetween('order_created_at', [$dateFrom, $dateTo])
            ->orderBy('client_id')
            ->get();

        $grouped = $orders->groupBy('client_id')->map(function($clientOrders, $clientId) {
            $client = $clientOrders->first()->client;
            return [
                'client_name' => $client->client_name ?? 'Unknown',
                'order_count' => $clientOrders->count(),
                'total_spent' => number_format($clientOrders->sum('total'), 2),
                'orders' => $clientOrders->map(function($order) {
                    return [
                        'order_id' => $order->order_id,
                        'date' => Carbon::parse($order->created_at)->format('F d, Y'),
                        'total' => number_format($order->total, 2),
                        'status' => $order->status,
                    ];
                }),
            ];
        });

        return [
            'title' => 'Client Order History Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'clients' => array_values($grouped->toArray()),
        ];
    }

    public static function productSalesSummary($dateFrom, $dateTo)
    {
        $orders = Order::whereBetween('order_created_at', [$dateFrom, $dateTo])->get();
        
        $productData = [];
        foreach ($orders as $order) {
            $items = is_array($order->items) ? $order->items : json_decode($order->items, true);
            foreach ($items as $item) {
                $productName = $item['product_name'] ?? 'Unknown';
                if (!isset($productData[$productName])) {
                    $productData[$productName] = [
                        'product_name' => $productName,
                        'quantity_sold' => 0,
                        'total_revenue' => 0,
                        'order_count' => 0,
                    ];
                }
                $productData[$productName]['quantity_sold'] += $item['qty'] ?? 0;
                $productData[$productName]['total_revenue'] += $item['line_total'] ?? 0;
                $productData[$productName]['order_count']++;
            }
        }

        usort($productData, fn($a, $b) => $b['quantity_sold'] - $a['quantity_sold']);

        return [
            'title' => 'Product Sales Summary Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'products' => array_values($productData),
        ];
    }

    public static function topSellingProducts($dateFrom, $dateTo)
    {
        $orders = Order::whereBetween('order_created_at', [$dateFrom, $dateTo])->get();
        
        $productData = [];
        foreach ($orders as $order) {
            $items = is_array($order->items) ? $order->items : json_decode($order->items, true);
            foreach ($items as $item) {
                $productName = $item['product_name'] ?? 'Unknown';
                if (!isset($productData[$productName])) {
                    $productData[$productName] = [
                        'product_name' => $productName,
                        'quantity_sold' => 0,
                        'total_revenue' => 0,
                    ];
                }
                $productData[$productName]['quantity_sold'] += $item['qty'] ?? 0;
                $productData[$productName]['total_revenue'] += $item['line_total'] ?? 0;
            }
        }

        usort($productData, fn($a, $b) => $b['quantity_sold'] - $a['quantity_sold']);
        $topProducts = array_slice($productData, 0, 10);

        return [
            'title' => 'Top Selling Products Report',
            'date_from' => Carbon::parse($dateFrom)->format('F d, Y'),
            'date_to' => Carbon::parse($dateTo)->format('F d, Y'),
            'generated_at' => now()->format('F d, Y H:i'),
            'products' => array_values($topProducts),
        ];
    }
}
