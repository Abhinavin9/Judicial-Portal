<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hearings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('cases')->onDelete('cascade');
            $table->string('hearing_number')->unique();
            $table->date('hearing_date');
            $table->time('hearing_time');
            $table->enum('hearing_type', [
                'pre_trial', 
                'trial', 
                'bail', 
                'final', 
                'motion'
            ])->default('pre_trial');
            $table->enum('status', [
                'scheduled', 
                'in_progress', 
                'completed', 
                'cancelled', 
                'rescheduled'
            ])->default('scheduled');
            $table->string('room_number')->nullable();
            $table->foreignId('judge_id')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->string('meeting_link')->nullable();
            $table->integer('duration_minutes')->default(60);
            $table->boolean('is_online')->default(false);
            $table->timestamps();
            
            $table->index('hearing_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hearings');
    }
};
