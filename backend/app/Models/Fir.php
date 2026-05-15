<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fir extends Model
{
    use HasFactory;

    protected $fillable = [
        'fir_number',
        'title',
        'description',
        'incident_date',
        'location',
        'status',
        'police_station_id',
        'filed_by_id',
        'linked_case_id',
    ];

    protected $casts = [
        'incident_date' => 'datetime',
    ];

    public function filedBy()
    {
        return $this->belongsTo(User::class, 'filed_by_id');
    }

    public function linkedCase()
    {
        return $this->belongsTo(CaseModel::class, 'linked_case_id');
    }

    public function evidences()
    {
        return $this->hasMany(FirEvidence::class);
    }

    public function assignments()
    {
        return $this->hasMany(FirAssignment::class);
    }
}
