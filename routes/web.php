<?php

use App\Http\Controllers\AccountController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::get('/', fn () => inertia('Dashboard'))->name('dashboard');

    Route::resource('accounts', AccountController::class);
});
