<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    private function authorizeManagerAccess(Request $request): void
    {
        if ($request->user()->role !== 'manager') {
            if ($request->expectsJson()) {
                response()->json(['error' => 'Access denied. Manager role required.'], 403)->send();
                exit;
            }
            abort(403, 'Access denied. Manager role required.');
        }
    }

    public function index(Request $request)
    {
        $this->authorizeManagerAccess($request);
        
        $search = $request->get('search');
        
        $query = User::with('client');
        
        if ($search) {
            $searchTerm = '%' . $search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                  ->orWhere('email', 'like', $searchTerm)
                  ->orWhere('role', 'like', $searchTerm)
                  ->orWhereHas('client', function ($cq) use ($searchTerm) {
                      $cq->where('client_name', 'like', $searchTerm);
                  });
            });
        }
        
        $users = $query->orderBy('created_at', 'desc')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'client_id' => $user->client_id,
                'client_name' => $user->client?->client_name,
                'created_at' => $user->created_at,
            ];
        });

        // Get all clients not linked to any user
        $linkedClientIds = User::whereNotNull('client_id')->pluck('client_id');
        $clients = Client::whereNotIn('id', $linkedClientIds)->get(['id', 'client_name']);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'clients' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeManagerAccess($request);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:manager,sales_rep,client',
            'client_id' => 'nullable|exists:clients,id',
        ]);

        // Prevent linking a client to more than one user
        if ($validated['role'] === 'client' && $validated['client_id']) {
            $existingUser = User::where('client_id', $validated['client_id'])->first();
            if ($existingUser) {
                return back()->withErrors(['client_id' => 'This client is already linked to another user.'])->withInput();
            }
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'client_id' => $validated['role'] === 'client' ? $validated['client_id'] : null,
        ]);

        AuditService::logCreate('User', $user->id, [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ], $request);

        return redirect()->route('users.index')->with('success', 'User created successfully');
    }

    public function update(Request $request, User $user)
    {
        $this->authorizeManagerAccess($request);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:manager,sales_rep,client',
            'client_id' => 'nullable|exists:clients,id',
        ]);

        // Prevent linking a client to more than one user (excluding current user)
        if ($validated['role'] === 'client' && $validated['client_id']) {
            $existingUser = User::where('client_id', $validated['client_id'])
                ->where('id', '!=', $user->id)
                ->first();
            if ($existingUser) {
                return back()->withErrors(['client_id' => 'This client is already linked to another user.'])->withInput();
            }
        }

        $oldValues = [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'client_id' => $user->client_id,
        ];

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'client_id' => $validated['role'] === 'client' ? $validated['client_id'] : null,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        AuditService::logUpdate('User', $user->id, $oldValues, $updateData, $request);

        return redirect()->route('users.index')->with('success', 'User updated successfully');
    }

    public function destroy(Request $request, User $user)
    {
        $this->authorizeManagerAccess($request);
        
        // Prevent deleting the last manager user
        if ($user->role === 'manager') {
            $managerCount = User::where('role', 'manager')->count();
            if ($managerCount <= 1) {
                return back()->withErrors(['Cannot delete the last manager user.']);
            }
        }

        AuditService::logDelete('User', $user->id, [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ], $request);

        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully');
    }
}
