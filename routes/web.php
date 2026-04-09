<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('/', fn () => inertia('Dashboard'))->name('dashboard');

    Route::resource('accounts', AccountController::class);
    Route::resource('transactions', TransactionController::class);

    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/accounts', [App\Http\Controllers\Api\AccountController::class, 'index'])->name('accounts.index');
        Route::get('/transactions', [App\Http\Controllers\Api\TransactionController::class, 'index'])->name('transactions.index');
    });
});
