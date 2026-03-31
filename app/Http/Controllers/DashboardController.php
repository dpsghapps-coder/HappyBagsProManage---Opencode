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
        $user = $request->user();
        $isClient = $user->role === 'client' && $user->client_id;
        
        $period = $request->get('period', 'monthly');
        $dateRange = $this->getDateRange($period);
        
        $stats = $this->getStats($dateRange, $isClient ? $user->client_id : null);
        $recentOrders = $this->getRecentOrders($isClient ? $user->client_id : null);
        $ordersByStatus = $this->getOrdersByStatus($dateRange, $isClient ? $user->client_id : null);
        $monthlySales = $this->getMonthlySales($dateRange, $isClient ? $user->client_id : null);
        $categoryRevenue = $this->getCategoryRevenue($dateRange, $isClient ? $user->client_id : null);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'ordersByStatus' => $ordersByStatus,
            'monthlySales' => $monthlySales,
            'categoryRevenue' => $categoryRevenue,
            'selectedPeriod' => $period,
            'isClient' => $isClient,
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

    private function getStats(array $dateRange, ?int $clientId = null): array
    {
        $start = $dateRange['start'];
        $end = $dateRange['end'];
        
        $orderQuery = function($query) use ($start, $end, $clientId) {
            $query->whereBetween('order_created_at', [$start, $end]);
            if ($clientId) {
                $query->where('client_id', $clientId);
            }
            return $query;
        };
        
        return [
            'totalOrders' => Order::where($orderQuery)->count(),
            'totalClients' => $clientId ? 1 : Client::count(),
            'totalProducts' => Product::count(),
            'totalRevenue' => (float) Order::where($orderQuery)
                ->where('status', '!=', 'Estimate Offered')
                ->sum('total'),
            'pendingOrders' => Order::where($orderQuery)
                ->whereIn('status', ['Estimate Offered', 'Invoice Created'])
                ->count(),
            'completedOrders' => Order::where($orderQuery)
                ->where('status', 'Order Completed')
                ->count(),
        ];
    }

    private function getRecentOrders(?int $clientId = null)
    {
        $query = Order::with('client');
        if ($clientId) {
            $query->where('client_id', $clientId);
        }
        return $query->orderBy('created_at', 'desc')
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

    private function getOrdersByStatus(array $dateRange, ?int $clientId = null): array
    {
        $start = $dateRange['start'];
        $end = $dateRange['end'];
        
        $query = Order::whereBetween('order_created_at', [$start, $end]);
        if ($clientId) {
            $query->where('client_id', $clientId);
        }
        
        return $query->select('status')
            ->selectRaw('count(*) as count')
            ->groupBy('status')
            ->get()
            ->toArray();
    }

    private function getMonthlySales(array $dateRange, ?int $clientId = null): array
    {
        $start = $dateRange['start'];
        $end = $dateRange['end'];
        
        $query = Order::whereBetween('order_created_at', [$start, $end]);
        if ($clientId) {
            $query->where('client_id', $clientId);
        }
        
        $sales = $query
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

    private function getCategoryRevenue(array $dateRange, ?int $clientId = null): array
    {
        $start = $dateRange['start'];
        $end = $dateRange['end'];
        
        $query = Order::whereBetween('order_created_at', [$start, $end]);
        if ($clientId) {
            $query->where('client_id', $clientId);
        }
        
        $orders = $query
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
