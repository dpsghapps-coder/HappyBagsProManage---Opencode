<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'unit_price',
        'category',
        'dimension',
        'other_details',
    ];

    protected $casts = [
        'unit_price' => 'float',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
