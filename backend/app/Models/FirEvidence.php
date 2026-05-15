<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FirEvidence extends Model
{
    use HasFactory;

    protected $table = 'fir_evidences';

    protected $fillable = [
        'fir_id',
        'title',
        'description',
        'file_path',
        'file_type',
        'uploaded_by_id',
    ];

    public function fir()
    {
        return $this->belongsTo(Fir::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by_id');
    }
}
