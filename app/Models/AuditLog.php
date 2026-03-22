<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function actionTypes(): array
    {
        return [
            'create' => 'Created',
            'update' => 'Updated',
            'delete' => 'Deleted',
            'restore' => 'Restored',
            'force_delete' => 'Permanently Deleted',
            'login' => 'Logged In',
            'logout' => 'Logged Out',
            'password_change' => 'Changed Password',
            'profile_update' => 'Updated Profile',
        ];
    }

    public function getActionLabelAttribute(): string
    {
        return self::actionTypes()[$this->action] ?? ucfirst($this->action);
    }
}
