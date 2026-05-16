<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Primary Demo Accounts (Simple Emails)
        User::updateOrCreate(['email' => 'admin@judicialportal.com'], ['name' => 'Rahul (Admin)', 'password' => Hash::make('password123'), 'role' => 'super_admin', 'phone' => '+919876543210', 'is_active' => true]);
        User::updateOrCreate(['email' => 'judge@judicialportal.com'], ['name' => 'Siddhu (Judge)', 'password' => Hash::make('password123'), 'role' => 'judge', 'phone' => '+919000000001', 'is_active' => true, 'court_id' => 'COURT-HYD-001']);
        User::updateOrCreate(['email' => 'lawyer@judicialportal.com'], ['name' => 'Arjun (Lawyer)', 'password' => Hash::make('password123'), 'role' => 'lawyer', 'phone' => '+919111111111', 'is_active' => true, 'bar_number' => 'BAR-AP-2024-001']);
        User::updateOrCreate(['email' => 'client@judicialportal.com'], ['name' => 'Abhi (Client)', 'password' => Hash::make('password123'), 'role' => 'client', 'phone' => '+919222222221', 'is_active' => true]);
        User::updateOrCreate(['email' => 'police@judicialportal.com'], ['name' => 'Vikram (Police)', 'password' => Hash::make('password123'), 'role' => 'police', 'phone' => '+919333333331', 'is_active' => true]);

        // Additional Judges
        $judges = ['Ananya Rao', 'Justice Iyer', 'Hon. Dixit', 'Justice Reddy'];
        foreach ($judges as $index => $name) {
            User::updateOrCreate(
                ['email' => strtolower(str_replace(' ', '', $name)) . '@judicialportal.com'],
                [
                    'name' => "$name (Judge)",
                    'password' => Hash::make('password123'),
                    'role' => 'judge',
                    'phone' => '+9190000000' . ($index + 2),
                    'court_id' => 'COURT-HYD-0' . ($index + 2),
                    'is_active' => true,
                ]
            );
        }

        // Additional Lawyers
        $lawyers = ['Rahul Reddy', 'Kavya Rao', 'Sneha Patel', 'Adv. Malhotra'];
        foreach ($lawyers as $index => $name) {
            User::updateOrCreate(
                ['email' => strtolower(str_replace(' ', '', $name)) . '@judicialportal.com'],
                [
                    'name' => "$name (Lawyer)",
                    'password' => Hash::make('password123'),
                    'role' => 'lawyer',
                    'phone' => '+9191111111' . ($index + 2),
                    'bar_number' => 'BAR-AP-2024-0' . ($index + 2),
                    'is_active' => true,
                ]
            );
        }

        // Expanded Police Force (Indian Names)
        $police_force = [
            'Inspector Deshmukh', 
            'DCP Rathore', 
            'ACP Shekhawat', 
            'Inspector Patil', 
            'Sub-Inspector Naidu',
            'Inspector Meena',
            'Officer Choudhary',
            'DCP Kulkarni'
        ];
        foreach ($police_force as $index => $name) {
            User::updateOrCreate(
                ['email' => strtolower(str_replace([' ', '-'], '', $name)) . '@judicialportal.com'],
                [
                    'name' => "$name (Police)",
                    'password' => Hash::make('password123'),
                    'role' => 'police',
                    'phone' => '+919333333' . str_pad($index + 2, 3, '0', STR_PAD_LEFT),
                    'is_active' => true,
                ]
            );
        }

        $this->call(DemoDataSeeder::class);
    }
}
