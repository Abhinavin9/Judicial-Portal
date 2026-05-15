<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    const TYPE_PETITION = 'petition';
    const TYPE_EVIDENCE = 'evidence';
    const TYPE_ORDER = 'order';
    const TYPE_JUDGMENT = 'judgment';
    const TYPE_NOTICE = 'notice';
    const TYPE_AFFIDAVIT = 'affidavit';
    const TYPE_OTHER = 'other';

    protected $fillable = [
        'case_id',
        'uploaded_by',
        'document_type',
        'title',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'description',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function case()
    {
        return $this->belongsTo(CaseModel::class, 'case_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getFileSizeFormattedAttribute()
    {
        $bytes = $this->file_size;
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
}
