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
        User::create(['name' => 'Rahul Admin', 'email' => 'admin@judicialportal.com', 'password' => Hash::make('password123'), 'role' => 'super_admin', 'phone' => '+919876543210', 'is_active' => true]);
        User::create(['name' => 'Siddhu Judge', 'email' => 'judge@judicialportal.com', 'password' => Hash::make('password123'), 'role' => 'judge', 'phone' => '+919000000001', 'is_active' => true, 'court_id' => 'COURT-HYD-001']);
        User::create(['name' => 'Arjun Lawyer', 'email' => 'lawyer@judicialportal.com', 'password' => Hash::make('password123'), 'role' => 'lawyer', 'phone' => '+919111111111', 'is_active' => true, 'bar_number' => 'BAR-AP-2024-001']);
        User::create(['name' => 'Abhi Client', 'email' => 'client@judicialportal.com', 'password' => Hash::make('password123'), 'role' => 'client', 'phone' => '+919222222221', 'is_active' => true]);
        User::create(['name' => 'Vikram Police', 'email' => 'police@judicialportal.com', 'password' => Hash::make('password123'), 'role' => 'police', 'phone' => '+919333333331', 'is_active' => true]);

        // Additional Judges
        $judges = ['Ananya Rao', 'Justice Iyer', 'Hon. Dixit', 'Justice Reddy'];
        foreach ($judges as $index => $name) {
            User::create([
                'name' => "Judge $name",
                'email' => strtolower(str_replace(' ', '', $name)) . '@judicialportal.com',
                'password' => Hash::make('password123'),
                'role' => 'judge',
                'phone' => '+9190000000' . ($index + 2),
                'court_id' => 'COURT-HYD-0' . ($index + 2),
                'is_active' => true,
            ]);
        }

        // Additional Lawyers
        $lawyers = ['Rahul Reddy', 'Kavya Rao', 'Sneha Patel', 'Adv. Malhotra'];
        foreach ($lawyers as $index => $name) {
            User::create([
                'name' => $name,
                'email' => strtolower(str_replace(' ', '', $name)) . '@judicialportal.com',
                'password' => Hash::make('password123'),
                'role' => 'lawyer',
                'phone' => '+9191111111' . ($index + 2),
                'bar_number' => 'BAR-AP-2024-0' . ($index + 2),
                'is_active' => true,
            ]);
        }

        // Expanded Police Force (Indian Names)
        $police = [
            'Inspector Deshmukh', 
            'DCP Rathore', 
            'ACP Shekhawat', 
            'Inspector Patil', 
            'Sub-Inspector Naidu',
            'Inspector Meena',
            'Officer Choudhary',
            'DCP Kulkarni'
        ];
        foreach ($police as $index => $name) {
            User::create([
                'name' => $name,
                'email' => strtolower(str_replace([' ', '-'], '', $name)) . '@judicialportal.com',
                'password' => Hash::make('password123'),
                'role' => 'police',
                'phone' => '+919333333' . str_pad($index + 2, 3, '0', STR_PAD_LEFT),
                'is_active' => true,
            ]);
        }
    }
}
