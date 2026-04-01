<?php

use App\Http\Controllers\ProductController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\BackupController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return file_get_contents(public_path('landingpage.html'));
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Users (manager only)
    Route::resource('users', UserController::class)->middleware(['manager']);

    // Products (manager only)
    Route::resource('products', ProductController::class)->except(['create'])->middleware(['manager']);

    // Clients (manager only)
    Route::resource('clients', ClientController::class)->except(['create'])->middleware(['manager']);

    // Orders (specific routes before resource to avoid conflict)
    Route::get('/orders/archived', [OrderController::class, 'archived'])->name('orders.archived');
    Route::post('/orders/{order}/restore', [OrderController::class, 'restore'])->name('orders.restore');
    Route::delete('/orders/{order}/force-delete', [OrderController::class, 'forceDelete'])->name('orders.forceDelete');
    Route::resource('orders', OrderController::class);
    Route::get('/orders/{order}/history', [OrderController::class, 'statusHistory'])->name('orders.history');
    Route::post('/orders/{order}/revert', [OrderController::class, 'revertStatus'])->name('orders.revert');
    Route::get('/orders/{order}/estimate', [OrderController::class, 'generateEstimate'])->name('orders.estimate');
    Route::get('/orders/{order}/proforma', [OrderController::class, 'generateProforma'])->name('orders.proforma');
    Route::get('/orders/{order}/invoice', [OrderController::class, 'generateInvoice'])->name('orders.invoice');
    Route::get('/orders/{order}/preview-estimate', [OrderController::class, 'previewEstimate'])->name('orders.preview-estimate');
    Route::get('/orders/{order}/preview-proforma', [OrderController::class, 'previewProforma'])->name('orders.preview-proforma');
    Route::get('/orders/{order}/preview-invoice', [OrderController::class, 'previewInvoice'])->name('orders.preview-invoice');
    // Download PDF routes
    Route::get('/orders/{order}/download-invoice', [OrderController::class, 'downloadInvoice'])->name('orders.download-invoice');
    Route::get('/orders/{order}/download-proforma', [OrderController::class, 'downloadProforma'])->name('orders.download-proforma');
    Route::get('/orders/{order}/download-estimate', [OrderController::class, 'downloadEstimate'])->name('orders.download-estimate');
    Route::post('/orders/{order}/download-receipt', [OrderController::class, 'downloadReceipt'])->name('orders.download-receipt');
    Route::get('/orders/{order}/payments', [PaymentController::class, 'index'])->name('orders.payments.index');
    Route::post('/orders/{order}/payments', [PaymentController::class, 'store'])->name('orders.payments.store');
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy'])->name('payments.destroy');

    // Reports (manager only)
    Route::middleware(['manager'])->group(function () {
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::post('/reports/preview', [ReportController::class, 'preview'])->name('reports.preview');
        Route::post('/reports/generate', [ReportController::class, 'generate'])->name('reports.generate');
        Route::get('/audit', [AuditController::class, 'index'])->name('audit.index');
    });

    // Backup (manager only)
    Route::middleware(['manager'])->group(function () {
        Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
        Route::post('/backup/create', [BackupController::class, 'create'])->name('backup.create');
        Route::get('/backup/download/{filename}', [BackupController::class, 'download'])->name('backup.download');
        Route::delete('/backup/delete/{filename}', [BackupController::class, 'destroy'])->name('backup.destroy');
    });
});

require __DIR__.'/auth.php';
