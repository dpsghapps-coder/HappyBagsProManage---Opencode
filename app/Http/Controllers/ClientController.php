<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        $clients = Client::orderBy('created_at', 'desc')->get();
        return Inertia::render('Clients/Index', [
            'clients' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mobile_no1' => 'required|string|max:20',
            'mobile_no2' => 'nullable|string|max:20',
            'delivery_address' => 'required|string',
        ]);

        $client = Client::create($validated);
        AuditService::logCreate('Client', $client->id, $validated, $request);

        return redirect()->route('clients.index')->with('success', 'Client created successfully');
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mobile_no1' => 'required|string|max:20',
            'mobile_no2' => 'nullable|string|max:20',
            'delivery_address' => 'required|string',
        ]);

        AuditService::logUpdate('Client', $client->id, $client->toArray(), $validated, $request);
        $client->update($validated);

        return redirect()->route('clients.index')->with('success', 'Client updated successfully');
    }

    public function destroy(Request $request, Client $client)
    {
        if ($request->user()->role !== 'manager') {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Access denied. Manager role required.'], 403);
            }
            abort(403, 'Access denied. Manager role required.');
        }

        if ($client->orders()->exists()) {
            return back()->withErrors(['Cannot delete a client with existing orders. Archive their orders first or contact support.']);
        }

        AuditService::logDelete('Client', $client->id, $client->toArray(), $request);
        $client->delete();
        return redirect()->route('clients.index')->with('success', 'Client deleted successfully');
    }
}
