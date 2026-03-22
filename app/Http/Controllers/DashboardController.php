<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Client;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 'monthly');
        $dateRange = $this->getDateRange($period);
        
        $stats = $this->getStats($dateRange);
        $recentOrders = $this->getRecentOrders();
        $ordersByStatus = $this->getOrdersByStatus($dateRange);
        $monthlySales = $this->getMonthlySales($dateRange);
        $categoryRevenue = $this->getCategoryRevenue($dateRange);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'ordersByStatus' => $ordersByStatus,
            'monthlySales' => $monthlySales,
            'categoryRevenue' => $categoryRevenue,
            'selectedPeriod' => $period,
        ]);
    }

    private function getDateRange(string $period): array
    {
        $now = Carbon::now();
        
        return match ($period) {
            'day' => [
                'start' => $now->copy()->startOfDay(),
                'end' => $now->copy()->endOfDay(),
            ],
            'week' => [
                'start' => $now->copy()->startOfWeek(),
                'end' => $now->copy()->endOfWeek(),
            ],
            'monthly' => [
                'start' => $now->copy()->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
            ],
            'quarterly' => [
                'start' => $now->copy()->startOfQuarter(),
                'end' => $now->copy()->endOfQuarter(),
            ],
            default => [
                'start' => $now->copy()->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
            ],
        };
    }

    private function getStats(array $dateRange): array
    {
        $start = $dateRange['start'];
        $end = $dateRange['end'];
        
        return [
            'totalOrders' => Order::whereBetween('order_created_at', [$start, $end])->count(),
            'totalClients' => Client::count(),
            'totalProducts' => Product::count(),
            'totalRevenue' => (float) Order::whereBetween('order_created_at', [$start, $end])
                ->where('status', '!=', 'Estimate Offered')
                ->sum('total'),
            'pendingOrders' => Order::whereBetween('order_created_at', [$start, $end])
                ->whereIn('status', ['Estimate Offered', 'Invoice Created'])
                ->count(),
            'completedOrders' => Order::whereBetween('order_created_at', [$start, $end])
                ->where('status', 'Order Completed')
                ->count(),
        ];
    }

    private function getRecentOrders()
    {
        return Order::with('client')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_id' => $order->order_id,
                    'client' => $order->client,
                    'items' => is_array($order->items) ? $order->items : json_decode($order->items, true),
                    'subtotal' => (float) $order->subtotal,
                    'total' => (float) $order->total,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                ];
            });
    }

    private function getOrdersByStatus(array $dateRange): array
    {
        $start = $dateRange['start'];
        $end = $dateRange['end'];
        
        return Order::whereBetween('order_created_at', [$start, $end])
            ->select('status')
            ->selectRaw('count(*) as count')
            ->groupBy('status')
            ->get()
            ->toArray();
    }

    private function getMonthlySales(array $dateRange): array
    {
        $start = $dateRange['start'];
        $end = $dateRange['end'];
        
        $sales = Order::whereBetween('order_created_at', [$start, $end])
            ->where('status', '!=', 'Estimate Offered')
            ->selectRaw('strftime("%Y-%m", order_created_at) as month')
            ->selectRaw('sum(total) as total')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();
            
        if ($sales->isEmpty()) {
            $currentMonth = Carbon::now()->format('Y-m');
            return [['month' => $currentMonth, 'total' => 0]];
        }
            
        return $sales->toArray();
    }

    private function getCategoryRevenue(array $dateRange): array
    {
        $start = $dateRange['start'];
        $end = $dateRange['end'];
        
        $orders = Order::whereBetween('order_created_at', [$start, $end])
            ->where('status', '!=', 'Estimate Offered')
            ->get();
            
        $categoryTotals = [];
        
        foreach ($orders as $order) {
            $items = is_array($order->items) ? $order->items : json_decode($order->items, true);
            
            foreach ($items as $item) {
                $productName = $item['product_name'] ?? 'Unknown';
                $lineTotal = $item['line_total'] ?? 0;
                
                if (str_contains(strtolower($productName), 'tote')) {
                    $categoryTotals['Tote Bags'] = ($categoryTotals['Tote Bags'] ?? 0) + $lineTotal;
                } elseif (str_contains(strtolower($productName), 'paper')) {
                    $categoryTotals['Paper Bags'] = ($categoryTotals['Paper Bags'] ?? 0) + $lineTotal;
                } elseif (str_contains(strtolower($productName), 'box')) {
                    $categoryTotals['Box Bags'] = ($categoryTotals['Box Bags'] ?? 0) + $lineTotal;
                } elseif (str_contains(strtolower($productName), 'kraft')) {
                    $categoryTotals['Kraft Bags'] = ($categoryTotals['Kraft Bags'] ?? 0) + $lineTotal;
                } else {
                    $categoryTotals['Other'] = ($categoryTotals['Other'] ?? 0) + $lineTotal;
                }
            }
        }
        
        $categoryColors = [
            'Tote Bags' => '#7c3aed',
            'Paper Bags' => '#3b82f6',
            'Box Bags' => '#22c55e',
            'Kraft Bags' => '#eab308',
            'Other' => '#6b7280',
        ];
        
        $result = [];
        foreach ($categoryTotals as $name => $total) {
            $result[] = [
                'name' => $name,
                'revenue' => round($total, 2),
                'color' => $categoryColors[$name] ?? '#6b7280',
            ];
        }
        
        usort($result, fn($a, $b) => $b['revenue'] <=> $a['revenue']);
        
        return $result;
    }
}
