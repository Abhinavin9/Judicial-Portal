<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('firs', function (Blueprint $table) {
            $table->id();
            $table->string('fir_number')->unique();
            $table->string('title');
            $table->text('description');
            $table->dateTime('incident_date');
            $table->string('location');
            $table->enum('status', ['pending', 'investigating', 'closed', 'court_referred'])->default('pending');
            $table->string('police_station_id')->nullable();
            $table->foreignId('filed_by_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('linked_case_id')->nullable()->constrained('cases')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('firs');
    }
};
