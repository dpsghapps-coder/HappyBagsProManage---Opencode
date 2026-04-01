<?php

namespace App\Http\Controllers;

use App\Services\BackupService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class BackupController extends Controller
{
    public function index(Request $request)
    {
        $backups = BackupService::listBackups();
        
        return inertia('Backup/Index', [
            'backups' => $backups,
        ]);
    }

    public function create(Request $request): RedirectResponse
    {
        try {
            $filename = BackupService::createBackup();
            
            return redirect()->back()->with('success', 'Backup created successfully: ' . $filename);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create backup: ' . $e->getMessage());
        }
    }

    public function download(Request $request, string $filename)
    {
        $path = BackupService::getBackupPath($filename);
        
        if (!$path) {
            abort(404, 'Backup file not found');
        }
        
        return response()->download($path, $filename, [
            'Content-Type' => 'application/sql',
        ]);
    }

    public function destroy(Request $request, string $filename): RedirectResponse
    {
        $deleted = BackupService::deleteBackup($filename);
        
        if ($deleted) {
            return redirect()->back()->with('success', 'Backup deleted successfully');
        }
        
        return redirect()->back()->with('error', 'Failed to delete backup');
    }
}
