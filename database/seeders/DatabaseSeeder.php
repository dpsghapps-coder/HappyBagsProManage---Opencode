<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Create manager user
        $manager = User::create([
            'name' => 'Manager',
            'email' => 'manager@happbags.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
        ]);

        // Create sales rep user
        $salesRep = User::create([
            'name' => 'Sales Rep',
            'email' => 'sales@happbags.com',
            'password' => Hash::make('password'),
            'role' => 'sales_rep',
        ]);

        // Create sample clients
        $client1 = Client::create([
            'client_name' => 'ABC Company',
            'mobile_no1' => '0551234567',
            'mobile_no2' => '0501234567',
            'delivery_address' => 'Accra, Ghana',
        ]);

        $client2 = Client::create([
            'client_name' => 'XYZ Enterprise',
            'mobile_no1' => '0245678901',
            'delivery_address' => 'Tema, Ghana',
        ]);

        // Create client users
        User::create([
            'name' => 'ABC Client',
            'email' => 'client1@abc.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'client_id' => $client1->id,
        ]);

        // Create sample products
        $products = [
            [
                'product_name' => 'Premium SOS Paper Bag',
                'unit_price' => 2.50,
                'category' => 'Paper Bag',
                'dimension' => '10x5x12 inches',
                'other_details' => 'Twisted Handle',
            ],
            [
                'product_name' => 'Flat Handle Paper Bag',
                'unit_price' => 3.00,
                'category' => 'Paper Bag',
                'dimension' => '12x6x14 inches',
                'other_details' => 'Flat Handle',
            ],
            [
                'product_name' => 'Luxury Gift Bag',
                'unit_price' => 5.00,
                'category' => 'Tote',
                'dimension' => '14x8x16 inches',
                'other_details' => 'Rope Handle',
            ],
            [
                'product_name' => 'Food Packaging Box',
                'unit_price' => 4.50,
                'category' => 'Box',
                'dimension' => '8x8x4 inches',
                'other_details' => 'With Handle',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        // Create sample orders
        $items1 = json_encode([
            ['product_id' => 1, 'product_name' => 'Premium SOS Paper Bag', 'qty' => 100, 'unit_price' => 2.50, 'line_total' => 250.00],
            ['product_id' => 2, 'product_name' => 'Flat Handle Paper Bag', 'qty' => 50, 'unit_price' => 3.00, 'line_total' => 150.00],
        ]);

        Order::create([
            'order_id' => Order::generateOrderId(),
            'client_id' => $client1->id,
            'items' => $items1,
            'subtotal' => 400.00,
            'total' => 400.00,
            'status' => 'Payment Received',
            'is_vat' => false,
            'delivery_date' => now()->addDays(7),
            'order_created_at' => now()->subDays(2),
            'order_updated_at' => now(),
        ]);
    }
}
