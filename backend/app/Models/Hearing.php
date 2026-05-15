<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hearing extends Model
{
    use HasFactory;

    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_RESCHEDULED = 'rescheduled';

    const TYPE_PRE_TRIAL = 'pre_trial';
    const TYPE_TRIAL = 'trial';
    const TYPE_BAIL = 'bail';
    const TYPE_FINAL = 'final';
    const TYPE_MOTION = 'motion';

    protected $fillable = [
        'case_id',
        'hearing_number',
        'hearing_date',
        'hearing_time',
        'hearing_type',
        'status',
        'room_number',
        'judge_id',
        'notes',
        'meeting_link',
        'duration_minutes',
        'is_online',
    ];

    protected $casts = [
        'hearing_date' => 'date',
        'is_online' => 'boolean',
    ];

    public function case()
    {
        return $this->belongsTo(CaseModel::class, 'case_id');
    }

    public function judge()
    {
        return $this->belongsTo(User::class, 'judge_id');
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'hearing_participants')
            ->withPivot('role', 'attended')
            ->withTimestamps();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($hearing) {
            if (!$hearing->hearing_number) {
                $hearing->hearing_number = self::generateHearingNumber($hearing->case_id);
            }
        });
    }

    public static function generateHearingNumber($caseId)
    {
        $case = CaseModel::find($caseId);
        $count = self::where('case_id', $caseId)->count() + 1;
        return $case->case_number . '/H' . str_pad($count, 3, '0', STR_PAD_LEFT);
    }
}
