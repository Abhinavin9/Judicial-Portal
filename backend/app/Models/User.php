<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_COURT_ADMIN = 'court_admin';
    const ROLE_JUDGE = 'judge';
    const ROLE_LAWYER = 'lawyer';
    const ROLE_CLERK = 'clerk';
    const ROLE_CLIENT = 'client';
    const ROLE_POLICE = 'police';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'bar_number',
        'court_id',
        'id_proof_path',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    public function cases()
    {
        return $this->hasMany(CaseModel::class, 'assigned_lawyer_id');
    }

    public function clientCases()
    {
        return $this->hasMany(CaseModel::class, 'client_id');
    }

    public function hearings()
    {
        return $this->belongsToMany(Hearing::class, 'hearing_participants')
            ->withPivot('role', 'attended')
            ->withTimestamps();
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function hasRole($role)
    {
        if (is_array($role)) {
            return in_array($this->role, $role);
        }
        return $this->role === $role;
    }

    public function isSuperAdmin()
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isCourtAdmin()
    {
        return $this->role === self::ROLE_COURT_ADMIN;
    }

    public function isJudge()
    {
        return $this->role === self::ROLE_JUDGE;
    }

    public function isLawyer()
    {
        return $this->role === self::ROLE_LAWYER;
    }

    public function isClerk()
    {
        return $this->role === self::ROLE_CLERK;
    }

    public function isClient()
    {
        return $this->role === self::ROLE_CLIENT;
    }

    public function isPolice()
    {
        return $this->role === self::ROLE_POLICE;
    }
}
