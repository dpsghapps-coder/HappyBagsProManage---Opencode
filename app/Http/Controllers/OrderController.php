<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Order;
use App\Models\Product;
use App\Services\AuditService;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    private function authorizeOrderAccess(Request $request, string $action = 'view'): void
    {
        $user = $request->user();
        
        if (!$user) {
            abort(401, 'Unauthorized');
        }

        $allowedRoles = ['manager', 'sales_rep', 'client'];
        
        if ($action === 'delete') {
            $allowedRoles = ['manager'];
            if (!in_array($user->role, $allowedRoles)) {
                if ($request->expectsJson()) {
                    response()->json(['error' => 'Access denied.'], 403)->send();
                    exit;
                }
                abort(403, 'Access denied.');
            }
        } elseif ($action === 'create' || $action === 'store' || $action === 'edit' || $action === 'update') {
            $allowedRoles = ['manager', 'sales_rep'];
            if (!in_array($user->role, $allowedRoles)) {
                if ($request->expectsJson()) {
                    response()->json(['error' => 'Access denied.'], 403)->send();
                    exit;
                }
                abort(403, 'Access denied.');
            }
        } else {
            if (!in_array($user->role, $allowedRoles)) {
                if ($request->expectsJson()) {
                    response()->json(['error' => 'Access denied.'], 403)->send();
                    exit;
                }
                abort(403, 'Access denied.');
            }
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $search = $request->get('search');
        $page = (int) $request->get('page', 1);
        
        $query = Order::with('client');
        
        if ($user->role === 'client' && $user->client_id) {
            $query->where('client_id', $user->client_id);
        }
        
        if ($search) {
            $searchTerm = '%' . $search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('order_id', 'like', $searchTerm)
                  ->orWhere('status', 'like', $searchTerm)
                  ->orWhereHas('client', function ($cq) use ($searchTerm) {
                      $cq->where('client_name', 'like', $searchTerm);
                  });
            });
        }
        
        $paginatedOrders = $query->orderBy('created_at', 'desc')->paginate(25, ['*'], 'page', $page);
        
        $orders = collect($paginatedOrders->items())->map(function ($order) {
            $items = is_array($order->items) ? $order->items : json_decode($order->items, true);
            
            $items = array_map(function ($item) {
                if (!isset($item['product_name']) || empty($item['product_name'])) {
                    $product = \App\Models\Product::find($item['product_id']);
                    $item['product_name'] = $product ? $product->product_name : 'Unknown Product';
                }
                $unitPrice = isset($item['unit_price']) ? (float) $item['unit_price'] : 0;
                $qty = isset($item['qty']) ? (int) $item['qty'] : 0;
                $discount = isset($item['discount']) ? (float) $item['discount'] : 0;
                $discountType = $item['discount_type'] ?? 'percentage';
                
                $lineTotal = $unitPrice * $qty;
                if ($discountType === 'percentage') {
                    $lineTotal = $lineTotal - ($lineTotal * $discount / 100);
                } else {
                    $lineTotal = $lineTotal - $discount;
                }
                $item['line_total'] = max(0, $lineTotal);
                
                return $item;
            }, $items);
            
            return [
                'id' => $order->id,
                'order_id' => $order->order_id,
                'client_id' => $order->client_id,
                'client' => $order->client,
                'items' => $items,
                'subtotal' => (float) $order->subtotal,
                'total' => (float) $order->total,
                'total_paid' => $order->totalPaid(),
                'status' => $order->status,
                'is_vat' => (bool) $order->is_vat,
                'delivery_date' => $order->delivery_date,
                'created_at' => $order->created_at,
                'deleted_at' => $order->deleted_at,
            ];
        });
        
        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'pagination' => [
                'current_page' => $paginatedOrders->currentPage(),
                'last_page' => $paginatedOrders->lastPage(),
                'per_page' => $paginatedOrders->perPage(),
                'total' => $paginatedOrders->total(),
            ],
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $user = $request->user();
        
        if ($user->role === 'client' && $user->client_id !== $order->client_id) {
            abort(403, 'Access denied.');
        }
        
        return redirect()->route('orders.edit', $order->id);
    }

    public function edit(Request $request, Order $order)
    {
        $user = $request->user();
        
        if ($user->role === 'client' && $user->client_id !== $order->client_id) {
            abort(403, 'Access denied.');
        }
        
        $order->load('client', 'payments', 'statusLogs.user');
        
        $items = is_array($order->items) ? $order->items : json_decode($order->items, true);
        
        $items = array_map(function ($item) {
            if (!isset($item['product_name']) || empty($item['product_name'])) {
                $product = \App\Models\Product::find($item['product_id']);
                $item['product_name'] = $product ? $product->product_name : 'Unknown Product';
            }
            return $item;
        }, $items);
        
        $products = Product::all();
        $clients = Client::all();
        
        return Inertia::render('Orders/Edit', [
            'order' => [
                'id' => $order->id,
                'order_id' => $order->order_id,
                'client_id' => $order->client_id,
                'client' => $order->client,
                'items' => $items,
                'subtotal' => (float) $order->subtotal,
                'total' => (float) $order->total,
                'total_paid' => $order->totalPaid(),
                'total_due' => $order->totalDue(),
                'status' => $order->status,
                'is_vat' => (bool) $order->is_vat,
                'delivery_date' => $order->delivery_date?->format('Y-m-d\TH:i'),
                'created_at' => $order->created_at,
                'order_created_at' => $order->order_created_at,
                'payments' => $order->payments,
                'statusLogs' => $order->statusLogs,
            ],
            'products' => $products,
            'clients' => $clients,
            'canManage' => in_array($user->role, ['manager', 'sales_rep']),
        ]);
    }

    public function archived(Request $request)
    {
        $this->authorizeOrderAccess($request);
        
        $archivedOrders = Order::onlyTrashed()->with('client')->orderBy('deleted_at', 'desc')->get()->map(function ($order) {
            $items = is_array($order->items) ? $order->items : json_decode($order->items, true);
            
            return [
                'id' => $order->id,
                'order_id' => $order->order_id,
                'client' => $order->client,
                'items' => $items,
                'subtotal' => (float) $order->subtotal,
                'total' => (float) $order->total,
                'status' => $order->status,
                'delivery_date' => $order->delivery_date,
                'created_at' => $order->created_at,
                'deleted_at' => $order->deleted_at,
            ];
        });
        
        return Inertia::render('Orders/Archived', [
            'archivedOrders' => $archivedOrders,
        ]);
    }

    public function create(Request $request)
    {
        $this->authorizeOrderAccess($request);
        
        $clients = Client::all();
        $products = Product::all();
        return Inertia::render('Orders/Create', [
            'clients' => $clients,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeOrderAccess($request);
        
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'items' => 'required|array|min:1|max:50',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.discount' => 'nullable|numeric|min:0|max:100',
            'items.*.discount_type' => 'nullable|in:percentage,value',
            'is_vat' => 'boolean',
            'delivery_date' => 'required|date|after_or_equal:now',
        ]);

        $subtotal = 0;
        $itemsWithPrices = [];

        foreach ($validated['items'] as $item) {
            $product = Product::find($item['product_id']);
            $lineTotal = $product->unit_price * $item['qty'];
            $discount = $item['discount'] ?? 0;
            $discountType = $item['discount_type'] ?? 'percentage';
            
            if ($discountType === 'percentage') {
                $lineTotal = $lineTotal - ($lineTotal * $discount / 100);
            } else {
                $lineTotal = $lineTotal - $discount;
            }
            
            $subtotal += $lineTotal;
            $itemsWithPrices[] = [
                'product_id' => $item['product_id'],
                'product_name' => $product->product_name,
                'qty' => $item['qty'],
                'unit_price' => $product->unit_price,
                'discount' => $discount,
                'discount_type' => $discountType,
                'line_total' => max(0, $lineTotal),
            ];
        }

        $vat = $request->boolean('is_vat') ? $subtotal * 0.20 : 0;
        $total = $subtotal + $vat;

        $order = \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $itemsWithPrices, $subtotal, $total, $request) {
            return Order::create([
                'order_id' => Order::generateOrderId(),
                'client_id' => $validated['client_id'],
                'user_id' => $request->user()->id,
                'items' => $itemsWithPrices,
                'subtotal' => $subtotal,
                'total' => $total,
                'is_vat' => $request->boolean('is_vat'),
                'delivery_date' => $validated['delivery_date'],
                'status' => 'Estimate Offered',
                'order_created_at' => now(),
            ]);
        });

        OrderService::logOrderCreation($order);
        AuditService::logCreate('Order', $order->id, [
            'order_id' => $order->order_id,
            'client_id' => $order->client_id,
            'total' => $order->total,
            'status' => $order->status,
        ], $request);

        return redirect()->route('orders.index')->with('success', 'Order created successfully');
    }

    public function update(Request $request, Order $order)
    {
        $this->authorizeOrderAccess($request);
        
        if ($request->has('status')) {
            $previousStatus = $order->status;
            $order->update([
                'status' => $request->status,
                'order_updated_at' => now(),
            ]);
            OrderService::logStatusChange($order, $previousStatus, $request->status);
            AuditService::logUpdate('Order', $order->id, [
                'status' => $previousStatus,
            ], [
                'status' => $request->status,
            ], $request);
            return redirect()->route('orders.index')->with('success', 'Order status updated');
        }

        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'items' => 'required|array|min:1|max:50',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.discount' => 'nullable|numeric|min:0|max:100',
            'items.*.discount_type' => 'nullable|in:percentage,value',
            'is_vat' => 'boolean',
            'delivery_date' => 'required|date|after_or_equal:' . $order->order_created_at->format('Y-m-d H:i:s'),
        ]);

        $subtotal = 0;
        $itemsWithPrices = [];

        foreach ($validated['items'] as $item) {
            $product = Product::find($item['product_id']);
            $lineTotal = $product->unit_price * $item['qty'];
            $discount = $item['discount'] ?? 0;
            $discountType = $item['discount_type'] ?? 'percentage';
            
            if ($discountType === 'percentage') {
                $lineTotal = $lineTotal - ($lineTotal * $discount / 100);
            } else {
                $lineTotal = $lineTotal - $discount;
            }
            
            $subtotal += $lineTotal;
            $itemsWithPrices[] = [
                'product_id' => $item['product_id'],
                'product_name' => $product->product_name,
                'qty' => $item['qty'],
                'unit_price' => $product->unit_price,
                'discount' => $discount,
                'discount_type' => $discountType,
                'line_total' => max(0, $lineTotal),
            ];
        }

        $vat = $request->boolean('is_vat') ? $subtotal * 0.20 : 0;
        $total = $subtotal + $vat;

        $oldValues = [
            'client_id' => $order->client_id,
            'subtotal' => $order->subtotal,
            'total' => $order->total,
            'is_vat' => $order->is_vat,
            'delivery_date' => $order->delivery_date,
        ];

        $order->update([
            'client_id' => $validated['client_id'],
            'items' => $itemsWithPrices,
            'subtotal' => $subtotal,
            'total' => $total,
            'is_vat' => $request->boolean('is_vat'),
            'delivery_date' => $validated['delivery_date'],
            'order_updated_at' => now(),
        ]);

        $newValues = [
            'client_id' => $validated['client_id'],
            'subtotal' => $subtotal,
            'total' => $total,
            'is_vat' => $request->boolean('is_vat'),
            'delivery_date' => $validated['delivery_date'],
        ];

        AuditService::logUpdate('Order', $order->id, $oldValues, $newValues, $request);

        return redirect()->route('orders.index')->with('success', 'Order updated successfully');
    }

    public function destroy(Request $request, Order $order)
    {
        $this->authorizeOrderAccess($request, 'delete');
        
        AuditService::logDelete('Order', $order->id, [
            'order_id' => $order->order_id,
            'status' => $order->status,
        ], $request);
        
        $order->delete();
        return redirect()->route('orders.archived')->with('success', 'Order archived successfully.');
    }

    public function restore(Request $request, $id)
    {
        $this->authorizeOrderAccess($request, 'delete');
        
        $order = Order::onlyTrashed()->find($id);
        if (!$order) {
            $order = Order::onlyTrashed()->findOrFail($id);
        }
        
        AuditService::logRestore('Order', $order->id, $request);
        $order->restore();
        
        return redirect()->route('orders.archived')->with('success', "Order has been restored successfully.");
    }

    public function forceDelete(Request $request, $id)
    {
        $user = auth()->user();
        
        if ($user->role !== 'manager') {
            return response()->json(['error' => 'Only managers can permanently delete orders.'], 403);
        }
        
        $order = Order::onlyTrashed()->find($id);
        if (!$order) {
            $order = Order::onlyTrashed()->findOrFail($id);
        }
        
        AuditService::logForceDelete('Order', $order->id, $request);
        $order->forceDelete();
        
        return redirect()->route('orders.archived')->with('success', 'Order permanently deleted.');
    }

    public function statusHistory(Order $order)
    {
        $logs = $order->statusLogs()->with('user')->get()->map(function ($log) {
            return [
                'id' => $log->id,
                'previous_status' => $log->previous_status,
                'new_status' => $log->new_status,
                'note' => $log->note,
                'created_at' => $log->created_at,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'email' => $log->user->email,
                ] : null,
            ];
        });

        return response()->json([
            'logs' => $logs,
        ]);
    }

    public function revertStatus(Request $request, Order $order)
    {
        $user = auth()->user();
        
        if ($user->role !== 'manager') {
            return response()->json(['error' => 'Only managers can revert order status.'], 403);
        }

        $lastLog = $order->statusLogs()
            ->where('new_status', '!=', 'Estimate Offered')
            ->first();

        if (!$lastLog) {
            return response()->json(['error' => 'No previous status to revert to.'], 400);
        }

        $previousStatus = $lastLog->previous_status ?: 'Estimate Offered';
        $currentStatus = $order->status;
        
        $order->update([
            'status' => $previousStatus,
            'order_updated_at' => now(),
        ]);

        OrderService::logStatusChange($order, $currentStatus, $previousStatus, 'Reverted by manager');

        return response()->json([
            'success' => true,
            'message' => 'Order status reverted to ' . $previousStatus,
        ]);
    }

    public function generateEstimate(Request $request, Order $order)
    {
        $order->load('client');
        
        $issueDate = $order->created_at ? $order->created_at->format('F j, Y') : now()->format('F j, Y');
        
        $vatAmount = 0;
        $vatPercentage = 0;
        if ($order->is_vat) {
            $vatPercentage = 20;
            $vatAmount = $order->total - $order->subtotal;
        }
        
        $documentType = 'Estimate';
        
        return \PDF::loadView('pdf.estimate', [
            'order' => $order,
            'issueDate' => $issueDate,
            'documentType' => $documentType,
            'vatAmount' => $vatAmount,
            'vatPercentage' => $vatPercentage,
        ])
        ->setPaper('a4')
        ->download("{$documentType}_{$order->order_id}.pdf");
    }

    public function generateProforma(Request $request, Order $order)
    {
        $order->load('client');
        
        $issueDate = $order->created_at ? $order->created_at->format('F j, Y') : now()->format('F j, Y');
        
        $vatAmount = 0;
        $vatPercentage = 0;
        if ($order->is_vat) {
            $vatPercentage = 20;
            $vatAmount = $order->total - $order->subtotal;
        }
        
        $documentType = 'Proforma';
        
        return \PDF::loadView('pdf.estimate', [
            'order' => $order,
            'issueDate' => $issueDate,
            'documentType' => $documentType,
            'vatAmount' => $vatAmount,
            'vatPercentage' => $vatPercentage,
        ])
        ->setPaper('a4')
        ->download("{$documentType}_{$order->order_id}.pdf");
    }

    public function generateInvoice(Request $request, Order $order)
    {
        $order->load('client');
        
        $issueDate = $order->created_at ? $order->created_at->format('F j, Y') : now()->format('F j, Y');
        
        $vatAmount = 0;
        $vatPercentage = 0;
        if ($order->is_vat) {
            $vatPercentage = 20;
            $vatAmount = $order->total - $order->subtotal;
        }
        
        $documentType = 'Invoice';
        
        return \PDF::loadView('pdf.estimate', [
            'order' => $order,
            'issueDate' => $issueDate,
            'documentType' => $documentType,
            'vatAmount' => $vatAmount,
            'vatPercentage' => $vatPercentage,
        ])
        ->setPaper('a4')
        ->download("{$documentType}_{$order->order_id}.pdf");
    }

    public function previewEstimate(Order $order)
    {
        $order = Order::with('client', 'user')->find($order->id);
        
        $issueDate = $order->created_at ? $order->created_at->format('F j, Y') : now()->format('F j, Y');
        
        $vatAmount = 0;
        $vatPercentage = 0;
        if ($order->is_vat) {
            $vatPercentage = 20;
            $vatAmount = $order->total - $order->subtotal;
        }
        
        return view('pdf.estimate', [
            'order' => $order,
            'issueDate' => $issueDate,
            'documentType' => 'Estimate',
            'vatAmount' => $vatAmount,
            'vatPercentage' => $vatPercentage,
        ]);
    }

    public function previewProforma(Order $order)
    {
        $order = Order::with('client', 'user')->find($order->id);
        
        $issueDate = $order->created_at ? $order->created_at->format('F j, Y') : now()->format('F j, Y');
        
        $vatAmount = 0;
        $vatPercentage = 0;
        if ($order->is_vat) {
            $vatPercentage = 20;
            $vatAmount = $order->total - $order->subtotal;
        }
        
        return view('pdf.estimate', [
            'order' => $order,
            'issueDate' => $issueDate,
            'documentType' => 'Proforma',
            'vatAmount' => $vatAmount,
            'vatPercentage' => $vatPercentage,
        ]);
    }

    public function previewInvoice(Order $order)
    {
        $order = Order::with('client', 'user')->find($order->id);
        
        $issueDate = $order->created_at ? $order->created_at->format('F j, Y') : now()->format('F j, Y');
        
        $vatAmount = 0;
        $vatPercentage = 0;
        if ($order->is_vat) {
            $vatPercentage = 20;
            $vatAmount = $order->total - $order->subtotal;
        }
        
        return view('pdf.invoice', [
            'order' => $order,
            'issueDate' => $issueDate,
            'documentType' => 'Invoice',
            'vatAmount' => $vatAmount,
            'vatPercentage' => $vatPercentage,
        ]);
    }

    public function downloadInvoice(Order $order)
    {
        $order->load('client');
        
        $issueDate = $order->created_at ? $order->created_at->format('F j, Y') : now()->format('F j, Y');
        
        $vatAmount = 0;
        $vatPercentage = 0;
        if ($order->is_vat) {
            $vatPercentage = 20;
            $vatAmount = $order->total - $order->subtotal;
        }
        
        $pdf = \PDF::loadView('pdf.invoice', [
            'order' => $order,
            'issueDate' => $issueDate,
            'documentType' => 'Invoice',
            'vatAmount' => $vatAmount,
            'vatPercentage' => $vatPercentage,
        ]);
        
        return $pdf->download("Invoice_{$order->order_id}.pdf");
    }

    public function downloadProforma(Order $order)
    {
        $order->load('client');
        
        $issueDate = $order->created_at ? $order->created_at->format('F j, Y') : now()->format('F j, Y');
        
        $vatAmount = 0;
        $vatPercentage = 0;
        if ($order->is_vat) {
            $vatPercentage = 20;
            $vatAmount = $order->total - $order->subtotal;
        }
        
        $pdf = \PDF::loadView('pdf.estimate', [
            'order' => $order,
            'issueDate' => $issueDate,
            'documentType' => 'Proforma',
            'vatAmount' => $vatAmount,
            'vatPercentage' => $vatPercentage,
        ]);
        
        return $pdf->download("Proforma_{$order->order_id}.pdf");
    }

    public function downloadEstimate(Order $order)
    {
        $order->load('client');
        
        $issueDate = $order->created_at ? $order->created_at->format('F j, Y') : now()->format('F j, Y');
        
        $vatAmount = 0;
        $vatPercentage = 0;
        if ($order->is_vat) {
            $vatPercentage = 20;
            $vatAmount = $order->total - $order->subtotal;
        }
        
        $pdf = \PDF::loadView('pdf.estimate', [
            'order' => $order,
            'issueDate' => $issueDate,
            'documentType' => 'Estimate',
            'vatAmount' => $vatAmount,
            'vatPercentage' => $vatPercentage,
        ]);
        
        return $pdf->download("Estimate_{$order->order_id}.pdf");
    }

    public function downloadReceipt(Request $request, Order $order)
    {
        $order->load('client', 'user');
        $amountPaid = $request->input('amount_paid', $order->total);
        
        $pdf = \PDF::loadView('pdf.receipt', [
            'order' => $order,
            'amountPaid' => $amountPaid,
        ]);
        
        return $pdf->download("Receipt_{$order->order_id}.pdf");
    }

    public function previewReceipt(Request $request, Order $order)
    {
        $order->load('client', 'user');
        $amountPaid = $request->input('amount_paid', $order->total);
        
        return view('pdf.receipt', [
            'order' => $order,
            'amountPaid' => $amountPaid,
        ]);
    }
}
