<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cases', function (Blueprint $table) {
            $table->id();
            $table->string('case_number')->unique();
            $table->string('title');
            $table->string('case_type');
            $table->text('description');
            $table->date('filing_date');
            $table->enum('status', [
                'filed', 
                'pending', 
                'in_progress', 
                'adjourned', 
                'closed', 
                'dismissed'
            ])->default('filed');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('assigned_judge_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('assigned_lawyer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('court_id')->nullable();
            $table->dateTime('next_hearing_date')->nullable();
            $table->timestamps();
            
            $table->index('case_number');
            $table->index('status');
            $table->index('filing_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cases');
    }
};
