<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FirAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'fir_id',
        'officer_id',
        'assigned_by_id',
        'notes',
    ];

    public function fir()
    {
        return $this->belongsTo(Fir::class);
    }

    public function officer()
    {
        return $this->belongsTo(User::class, 'officer_id');
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by_id');
    }
}
