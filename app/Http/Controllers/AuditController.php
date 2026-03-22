<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user')->orderBy('created_at', 'desc');

        if ($request->has('entity_type') && $request->entity_type) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('from_date') && $request->from_date) {
            $query->where('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date') && $request->to_date) {
            $query->where('created_at', '<=', $request->to_date . ' 23:59:59');
        }

        $perPage = $request->get('per_page', 25);
        $logs = $query->paginate($perPage);

        $entityTypes = AuditLog::distinct()->pluck('entity_type')->filter()->values();
        $actions = AuditLog::distinct()->pluck('action')->filter()->values();

        return Inertia::render('Audit/Index', [
            'logs' => $logs,
            'entityTypes' => $entityTypes,
            'actions' => $actions,
            'filters' => [
                'entity_type' => $request->entity_type,
                'action' => $request->action,
                'user_id' => $request->user_id,
                'from_date' => $request->from_date,
                'to_date' => $request->to_date,
            ],
        ]);
    }

    public function show(AuditLog $auditLog)
    {
        $auditLog->load('user');
        return response()->json($auditLog);
    }
}
