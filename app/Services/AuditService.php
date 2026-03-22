<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    public static function resolveRelatedName(string $field, mixed $value): mixed
    {
        if ($value === null) {
            return null;
        }

        if (!is_string($value) && !is_int($value) && !is_numeric($value)) {
            return is_array($value) ? json_encode($value) : $value;
        }

        if ($field === 'client_id') {
            $numericValue = is_numeric($value) ? (int) $value : null;
            if ($numericValue === null) {
                return $value;
            }
            try {
                $client = Client::find($numericValue);
                return $client instanceof Client ? $client->client_name : $numericValue;
            } catch (\Exception $e) {
                return $numericValue;
            }
        }

        return $value;
    }

    public static function formatValuesForAudit(array $values, string $entityType): array
    {
        $formatted = [];
        foreach ($values as $key => $value) {
            $formatted[$key] = self::resolveRelatedName($key, $value);
        }
        return $formatted;
    }

    public static function log(
        string $action,
        string $entityType,
        ?int $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null
    ): AuditLog {
        $request = $request ?? request();
        
        $formattedOldValues = $oldValues ? self::formatValuesForAudit($oldValues, $entityType) : null;
        $formattedNewValues = $newValues ? self::formatValuesForAudit($newValues, $entityType) : null;
        
        return AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_values' => $formattedOldValues,
            'new_values' => $formattedNewValues,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }

    public static function logCreate(string $entityType, int $entityId, array $values, ?Request $request = null): AuditLog
    {
        return self::log('create', $entityType, $entityId, null, $values, $request);
    }

    public static function logUpdate(string $entityType, int $entityId, array $oldValues, array $newValues, ?Request $request = null): AuditLog
    {
        $changes = [];
        foreach ($newValues as $key => $value) {
            if (isset($oldValues[$key]) && $oldValues[$key] !== $value) {
                $changes[$key] = [
                    'old' => self::resolveRelatedName($key, $oldValues[$key]),
                    'new' => self::resolveRelatedName($key, $value),
                ];
            }
        }
        
        return self::log('update', $entityType, $entityId, $oldValues, $changes, $request);
    }

    public static function logDelete(string $entityType, int $entityId, array $values, ?Request $request = null): AuditLog
    {
        return self::log('delete', $entityType, $entityId, $values, null, $request);
    }

    public static function logRestore(string $entityType, int $entityId, ?Request $request = null): AuditLog
    {
        return self::log('restore', $entityType, $entityId, null, null, $request);
    }

    public static function logForceDelete(string $entityType, int $entityId, ?Request $request = null): AuditLog
    {
        return self::log('force_delete', $entityType, $entityId, null, null, $request);
    }

    public static function logAuth(string $action, ?Request $request = null): AuditLog
    {
        return self::log($action, 'auth', null, null, null, $request);
    }
}
