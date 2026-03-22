<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_id',
        'client_id',
        'items',
        'subtotal',
        'total',
        'status',
        'is_vat',
        'delivery_date',
        'order_created_at',
        'order_updated_at',
    ];

    protected $casts = [
        'items' => 'array',
        'subtotal' => 'float',
        'total' => 'float',
        'is_vat' => 'boolean',
        'delivery_date' => 'datetime',
        'order_created_at' => 'datetime',
        'order_updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $dates = ['deleted_at'];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function statusLogs()
    {
        return $this->hasMany(OrderStatusLog::class)->orderBy('created_at', 'desc');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class)->orderBy('payment_timestamp', 'desc');
    }

    public function totalPaid(): float
    {
        return (float) $this->payments()->sum('amount');
    }

    public function totalDue(): float
    {
        return (float) $this->total - $this->totalPaid();
    }

    public function isFullyPaid(): bool
    {
        return $this->totalPaid() >= (float) $this->total;
    }

    public static function generateOrderId()
    {
        $year = date('Y');
        $maxAttempts = 10;
        $attempt = 0;

        while ($attempt < $maxAttempts) {
            $attempt++;

            $lastOrder = self::withTrashed()
                ->where('order_id', 'like', "HPBG-{$year}-%")
                ->orderBy('order_id', 'desc')
                ->first();

            if ($lastOrder) {
                $lastNumber = (int) substr($lastOrder->order_id, -4);
                $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '0001';
            }

            $newOrderId = "HPBG-{$year}-{$newNumber}";

            $exists = self::withTrashed()->where('order_id', $newOrderId)->exists();
            if (!$exists) {
                return $newOrderId;
            }
        }

        throw new \Exception('Unable to generate unique order ID after ' . $maxAttempts . ' attempts');
    }
}
