<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    const TYPE_CASE_ASSIGNED = 'case_assigned';
    const TYPE_HEARING_SCHEDULED = 'hearing_scheduled';
    const TYPE_HEARING_REMINDER = 'hearing_reminder';
    const TYPE_HEARING_CANCELLED = 'hearing_cancelled';
    const TYPE_DOCUMENT_UPLOADED = 'document_uploaded';
    const TYPE_CASE_STATUS_CHANGED = 'case_status_changed';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'read_at',
        'link',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }
}
