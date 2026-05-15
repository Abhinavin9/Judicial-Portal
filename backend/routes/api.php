<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CaseController;
use App\Http\Controllers\HearingController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\FirController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard (Accessed by all authenticated users)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Cases
    Route::get('/cases', [CaseController::class, 'index']);
    Route::get('/cases/stats', [CaseController::class, 'stats']);
    Route::get('/cases/{id}', [CaseController::class, 'show']);
    
    // Create/Update/Delete cases restricted to Admin/Judge (Clients/Lawyers cannot edit cases)
    Route::middleware('role:super_admin,court_admin,judge')->group(function () {
        Route::post('/cases', [CaseController::class, 'store']);
        Route::put('/cases/{id}', [CaseController::class, 'update']);
        Route::delete('/cases/{id}', [CaseController::class, 'destroy']);
    });

    // Hearings
    Route::get('/hearings', [HearingController::class, 'index']);
    Route::get('/hearings/stats', [HearingController::class, 'stats']);
    Route::get('/hearings/calendar', [HearingController::class, 'calendar']);
    Route::get('/hearings/{id}', [HearingController::class, 'show']);
    
    // Manage hearings restricted to Admin/Judge
    Route::middleware('role:super_admin,court_admin,judge')->group(function () {
        Route::post('/hearings', [HearingController::class, 'store']);
        Route::put('/hearings/{id}', [HearingController::class, 'update']);
        Route::delete('/hearings/{id}', [HearingController::class, 'destroy']);
    });

    // Documents
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::get('/documents/{id}', [DocumentController::class, 'show']);
    Route::get('/documents/{id}/download', [DocumentController::class, 'download']);
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Users (Admin Only)
    Route::middleware('role:super_admin,court_admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/judges', [UserController::class, 'judges']);
        Route::get('/users/lawyers', [UserController::class, 'lawyers']);
        Route::get('/users/clients', [UserController::class, 'clients']);
        Route::get('/users/police', [UserController::class, 'police']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    // Reports (Accessible to participants)
    Route::get('/reports/case/{id}', [ReportController::class, 'caseReport']);
    Route::get('/reports/hearing/{id}', [ReportController::class, 'hearingReport']);
    Route::get('/reports/fir/{id}', [ReportController::class, 'firReport']);

    // Admin Reports
    Route::middleware('role:super_admin,court_admin,judge')->group(function () {
        Route::get('/reports/cases-list', [ReportController::class, 'casesList']);
        Route::get('/reports/hearings-list', [ReportController::class, 'hearingsList']);
    });

    // FIRs (Police/Admin/Judge/Participant)
    Route::middleware('role:police,super_admin,judge,client,lawyer')->group(function () {
        Route::get('/firs/stats', [FirController::class, 'stats']);
        Route::get('/firs', [FirController::class, 'index']);
        Route::get('/firs/{id}', [FirController::class, 'show']);
    });

    // FIR Management (Police and Super Admin)
    Route::middleware('role:police,super_admin')->group(function () {
        Route::post('/firs', [FirController::class, 'store']);
        Route::put('/firs/{id}', [FirController::class, 'update']);
        Route::post('/fir-evidences', [FirController::class, 'uploadEvidence']);
    });
});
