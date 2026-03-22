<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique(); // Format: HPBG-YYYY-XXXX
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->json('items'); // [{product_id, qty, line_total}]
            $table->decimal('subtotal', 10, 2);
            $table->decimal('total', 10, 2);
            $table->enum('status', ['Estimate Offered', 'Invoice Created', 'Payment Received', 'Production Started', 'Order Delivered', 'Order Completed'])->default('Estimate Offered');
            $table->boolean('is_vat')->default(false);
            $table->date('delivery_date')->nullable();
            $table->timestamp('order_created_at');
            $table->timestamp('order_updated_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
