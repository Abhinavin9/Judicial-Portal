<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

User::all()->each(function($user) {
    if (strpos($user->name, '(') !== false) return;

    $role = match($user->role) {
        'super_admin' => 'Admin',
        'court_admin' => 'Court Admin',
        'judge' => 'Judge',
        'lawyer' => 'Lawyer',
        'police' => 'Police',
        'client' => 'Client',
        default => ucfirst($user->role)
    };

    // Remove existing role suffixes if they exist
    $newName = preg_replace('/\s+(Judge|Lawyer|Client|Police|Admin)$/i', '', $user->name);
    
    // Also remove "Judge " or "Adv. " prefixes if we want it clean
    $newName = preg_replace('/^(Judge|Adv\.|Justice|Hon\.)\s+/i', '', $newName);

    $user->name = "$newName ($role)";
    $user->save();
    echo "Updated: {$user->name}\n";
});
