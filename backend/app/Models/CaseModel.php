<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CaseModel extends Model
{
    use HasFactory;

    protected $table = 'cases';

    const STATUS_FILED = 'filed';
    const STATUS_PENDING = 'pending';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_ADJOURNED = 'adjourned';
    const STATUS_CLOSED = 'closed';
    const STATUS_DISMISSED = 'dismissed';

    protected $fillable = [
        'case_number',
        'title',
        'case_type',
        'description',
        'filing_date',
        'status',
        'priority',
        'client_id',
        'assigned_judge_id',
        'assigned_lawyer_id',
        'court_id',
        'next_hearing_date',
    ];

    protected $casts = [
        'filing_date' => 'date',
        'next_hearing_date' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function judge()
    {
        return $this->belongsTo(User::class, 'assigned_judge_id');
    }

    public function lawyer()
    {
        return $this->belongsTo(User::class, 'assigned_lawyer_id');
    }

    public function hearings()
    {
        return $this->hasMany(Hearing::class, 'case_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'case_id');
    }

    public function timeline()
    {
        return $this->hasMany(CaseTimeline::class, 'case_id');
    }

    public function fir()
    {
        return $this->hasOne(Fir::class, 'linked_case_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($case) {
            if (!$case->case_number) {
                $case->case_number = self::generateCaseNumber();
            }
        });
    }

    public static function generateCaseNumber()
    {
        $year = date('Y');
        $lastCase = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastCase ? intval(substr($lastCase->case_number, -6)) + 1 : 1;
        return 'CASE/' . $year . '/' . str_pad($number, 6, '0', STR_PAD_LEFT);
    }
}
