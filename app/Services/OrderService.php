<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderStatusLog;

class OrderService
{
    public static function logStatusChange(
        Order $order,
        ?string $previousStatus,
        string $newStatus,
        ?string $note = null
    ): OrderStatusLog {
        return OrderStatusLog::create([
            'order_id' => $order->id,
            'user_id' => auth()->id(),
            'previous_status' => $previousStatus,
            'new_status' => $newStatus,
            'note' => $note,
        ]);
    }

    public static function logOrderCreation(Order $order): OrderStatusLog
    {
        return self::logStatusChange(
            $order,
            '',
            'Estimate Offered',
            'Order created'
        );
    }
}
