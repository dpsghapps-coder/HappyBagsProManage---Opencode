<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::orderBy('created_at', 'desc')->get();
        return Inertia::render('Products/Index', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:255',
            'unit_price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'dimension' => 'required|string|max:255',
            'other_details' => 'nullable|string|max:255',
        ]);

        $product = Product::create($validated);
        AuditService::logCreate('Product', $product->id, $validated, $request);

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Product created successfully', 'product' => $product]);
        }

        return redirect()->route('products.index')->with('success', 'Product created successfully');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:255',
            'unit_price' => 'required|numeric|min:0',
            'category' => 'required|string|max:255',
            'dimension' => 'required|string|max:255',
            'other_details' => 'nullable|string|max:255',
        ]);

        AuditService::logUpdate('Product', $product->id, $product->toArray(), $validated, $request);
        $product->update($validated);

        return redirect()->route('products.index')->with('success', 'Product updated successfully');
    }

    public function destroy(Request $request, Product $product)
    {
        if ($request->user()->role !== 'manager') {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Access denied. Manager role required.'], 403);
            }
            abort(403, 'Access denied. Manager role required.');
        }

        AuditService::logDelete('Product', $product->id, $product->toArray(), $request);
        $product->delete();
        return redirect()->route('products.index')->with('success', 'Product deleted successfully');
    }
}
