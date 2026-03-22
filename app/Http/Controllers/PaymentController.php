<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Services\AuditService;
use App\Services\OrderService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Order $order)
    {
        $payments = $order->payments()
            ->with('user')
            ->orderBy('payment_timestamp', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => (float) $payment->amount,
                    'payment_type' => $payment->payment_type,
                    'payment_timestamp' => $payment->payment_timestamp,
                    'user' => $payment->user ? [
                        'id' => $payment->user->id,
                        'name' => $payment->user->name,
                        'email' => $payment->user->email,
                    ] : null,
                ];
            });

        return response()->json([
            'payments' => $payments,
            'totalPaid' => $order->totalPaid(),
            'totalDue' => $order->totalDue(),
            'isFullyPaid' => $order->isFullyPaid(),
        ]);
    }

    public function store(Request $request, Order $order)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_type' => 'required|in:Hubtel',
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'amount' => $validated['amount'],
            'payment_type' => $validated['payment_type'],
            'payment_timestamp' => now(),
        ]);

        AuditService::logCreate('Payment', $payment->id, [
            'order_id' => $order->id,
            'order_order_id' => $order->order_id,
            'amount' => $validated['amount'],
            'payment_type' => $validated['payment_type'],
        ], $request);

        $order->refresh();
        $previousStatus = $order->status;
        $wasFullyPaid = $order->isFullyPaid();

        if ($wasFullyPaid && $previousStatus === 'Invoice Created') {
            $order->update([
                'status' => 'Payment Received',
                'order_updated_at' => now(),
            ]);
            OrderService::logStatusChange($order, $previousStatus, 'Payment Received', 'Payment completed - auto-advanced');
        }

        return response()->json([
            'success' => true,
            'payment' => [
                'id' => $payment->id,
                'amount' => (float) $payment->amount,
                'payment_type' => $payment->payment_type,
                'payment_timestamp' => $payment->payment_timestamp,
                'user' => auth()->user()->only('id', 'name', 'email'),
            ],
            'totalPaid' => $order->totalPaid(),
            'totalDue' => $order->totalDue(),
            'isFullyPaid' => $wasFullyPaid,
            'statusChanged' => $wasFullyPaid && $previousStatus === 'Invoice Created',
        ]);
    }

    public function destroy(Request $request, Payment $payment)
    {
        $user = auth()->user();

        if ($user->role !== 'manager') {
            return response()->json(['error' => 'Only managers can delete payments.'], 403);
        }

        AuditService::logDelete('Payment', $payment->id, [
            'order_id' => $payment->order_id,
            'amount' => $payment->amount,
            'payment_type' => $payment->payment_type,
        ], $request);

        $order = $payment->order;
        $payment->delete();
        $order->refresh();

        return response()->json([
            'success' => true,
            'totalPaid' => $order->totalPaid(),
            'totalDue' => $order->totalDue(),
            'isFullyPaid' => $order->isFullyPaid(),
        ]);
    }
}
