<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ManagerMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'manager') {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Access denied. Manager role required.'], 403);
            }
            abort(403, 'Access denied. Manager role required.');
        }

        return $next($request);
    }
}
