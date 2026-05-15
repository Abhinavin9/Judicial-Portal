<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hearing_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hearing_id')->constrained('hearings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('role')->default('participant');
            $table->boolean('attended')->default(false);
            $table->timestamps();
            
            $table->unique(['hearing_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hearing_participants');
    }
};
