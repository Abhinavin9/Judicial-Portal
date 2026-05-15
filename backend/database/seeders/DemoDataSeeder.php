<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\CaseModel;
use App\Models\Hearing;
use App\Models\Document;
use App\Models\Fir;
use App\Models\Notification;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Get our demo users
        $judge = User::where('email', 'judge@judicialportal.com')->first();
        $lawyer = User::where('email', 'lawyer@judicialportal.com')->first();
        $client = User::where('email', 'client@judicialportal.com')->first();
        $police = User::where('email', 'police@judicialportal.com')->first();

        if (!$judge || !$lawyer || !$client || !$police) {
            $this->command->error('Run DatabaseSeeder first to create base users.');
            return;
        }

        // 1. Create FIRs
        $fir1 = Fir::firstOrCreate(['fir_number' => 'FIR-2024-001'], [
            'fir_number' => 'FIR-2024-001',
            'title' => 'Financial Fraud Investigation',
            'description' => 'Investigation into embezzlement of funds.',
            'incident_date' => Carbon::now()->subDays(30),
            'location' => 'Cyberabad',
            'status' => 'court_referred',
            'filed_by_id' => $police->id,
        ]);

        $fir2 = Fir::firstOrCreate(['fir_number' => 'FIR-2024-002'], [
            'fir_number' => 'FIR-2024-002',
            'title' => 'Property Dispute Escalation',
            'description' => 'Trespassing and property damage reported.',
            'incident_date' => Carbon::now()->subDays(10),
            'location' => 'Jubilee Hills',
            'status' => 'pending',
            'filed_by_id' => $police->id,
        ]);

        // 2. Create Cases
        $case1 = CaseModel::firstOrCreate(['case_number' => 'CASE-2024-001'], [
            'case_number' => 'CASE-2024-001',
            'title' => 'State vs. Corporate Entities',
            'description' => 'High profile financial fraud case.',
            'case_type' => 'criminal',
            'status' => 'in_progress',
            'priority' => 'high',
            'filing_date' => Carbon::now()->subDays(25),
            'client_id' => $client->id,
            'assigned_judge_id' => $judge->id,
            'assigned_lawyer_id' => $lawyer->id,
            'next_hearing_date' => Carbon::now()->addDays(2),
        ]);

        $case2 = CaseModel::firstOrCreate(['case_number' => 'CASE-2024-002'], [
            'case_number' => 'CASE-2024-002',
            'title' => 'Civil Property Dispute',
            'description' => 'Land ownership dispute over commercial property.',
            'case_type' => 'civil',
            'status' => 'pending',
            'priority' => 'medium',
            'filing_date' => Carbon::now()->subDays(5),
            'client_id' => $client->id,
            'assigned_judge_id' => $judge->id,
            'assigned_lawyer_id' => $lawyer->id,
            'next_hearing_date' => Carbon::now()->addDays(5),
        ]);

        // 3. Create Hearings
        $hearing1 = Hearing::firstOrCreate(['hearing_number' => 'HRG-2024-001'], [
            'hearing_number' => 'HRG-2024-001',
            'case_id' => $case1->id,
            'judge_id' => $judge->id,
            'hearing_date' => Carbon::now()->addDays(2),
            'hearing_time' => '10:30:00',
            'hearing_type' => 'trial',
            'status' => 'scheduled',
            'is_online' => true,
            'meeting_link' => 'https://meet.jit.si/judicial-portal-demo-room-1',
            'notes' => 'Primary evidence review phase.',
        ]);
        $hearing1->participants()->syncWithPivotValues([$lawyer->id, $client->id, $police->id], ['role' => 'participant']);

        $hearing2 = Hearing::firstOrCreate(['hearing_number' => 'HRG-2024-002'], [
            'hearing_number' => 'HRG-2024-002',
            'case_id' => $case2->id,
            'judge_id' => $judge->id,
            'hearing_date' => Carbon::now()->addDays(5),
            'hearing_time' => '14:00:00',
            'hearing_type' => 'pre_trial',
            'status' => 'scheduled',
            'is_online' => true,
            'meeting_link' => 'https://meet.jit.si/judicial-portal-demo-room-2',
            'notes' => 'Initial arguments.',
        ]);
        $hearing2->participants()->syncWithPivotValues([$lawyer->id, $client->id], ['role' => 'participant']);

        // 4. Create Documents
        Document::firstOrCreate(['file_name' => 'demo_fir_copy.pdf'], [
            'title' => 'Initial FIR Report Copy',
            'file_name' => 'demo_fir_copy.pdf',
            'file_path' => 'demo/demo_fir_copy.pdf',
            'file_size' => 1024000, // 1MB
            'mime_type' => 'application/pdf',
            'document_type' => 'evidence',
            'case_id' => $case1->id,
            'uploaded_by' => $police->id,
        ]);

        Document::firstOrCreate(['file_name' => 'defense_petition.pdf'], [
            'title' => 'Defense Petition',
            'file_name' => 'defense_petition.pdf',
            'file_path' => 'demo/defense_petition.pdf',
            'file_size' => 2048000, // 2MB
            'mime_type' => 'application/pdf',
            'document_type' => 'petition',
            'case_id' => $case2->id,
            'uploaded_by' => $lawyer->id,
        ]);

        // 5. Create Notifications
        $usersToNotify = [$judge->id, $lawyer->id, $client->id, $police->id];
        foreach ($usersToNotify as $uid) {
            Notification::updateOrCreate([
                'user_id' => $uid,
                'title' => 'Portal Access Authorized',
            ], [
                'type' => 'system',
                'message' => 'Your credentials have been verified. Your judicial portfolio is now active and ready for use.',
                'link' => '/dashboard',
            ]);

            Notification::updateOrCreate([
                'user_id' => $uid,
                'title' => 'Hearing Summons Issued',
            ], [
                'type' => 'hearing',
                'message' => 'The Honorable Court has scheduled a new hearing. Please review the summons details in your portfolio.',
                'link' => '/hearings',
            ]);
        }

        $this->command->info('Demo Data generated successfully!');
    }
}
