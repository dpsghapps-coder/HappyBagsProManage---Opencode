import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Database, Download, Trash2, Plus, RefreshCw, FileText, Shield, Clock, ChevronRight } from 'lucide-react';

interface Backup {
    filename: string;
    size: number;
    size_formatted: string;
    created: number;
    created_formatted: string;
}

interface Props {
    backups: Backup[];
}

export default function Index({ backups }: Props) {
    const [isCreating, setIsCreating] = useState(false);
    const [deletingFile, setDeletingFile] = useState<string | null>(null);

    const createBackup = () => {
        Swal.fire({
            title: 'Create Database Backup?',
            text: 'This will create a new backup of your database. The system will keep the last 10 backups automatically.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, create backup',
        }).then((result) => {
            if (result.isConfirmed) {
                setIsCreating(true);
                router.post(route('backup.create'), {}, {
                    onFinish: () => {
                        setIsCreating(false);
                    },
                });
            }
        });
    };

    const downloadBackup = (filename: string) => {
        window.location.href = route('backup.download', { filename: encodeURIComponent(filename) });
    };

    const deleteBackup = (filename: string) => {
        Swal.fire({
            title: 'Delete Backup?',
            text: `Are you sure you want to delete "${filename}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
        }).then((result) => {
            if (result.isConfirmed) {
                setDeletingFile(filename);
                router.delete(route('backup.destroy', { filename: encodeURIComponent(filename) }), {
                    onFinish: () => {
                        setDeletingFile(null);
                    },
                });
            }
        });
    };

    const totalSizeMB = backups.length > 0
        ? (backups.reduce((acc, b) => acc + b.size, 0) / (1024 * 1024)).toFixed(2)
        : '0.00';

    return (
        <AuthenticatedLayout>
            <Head title="Database Backup" />

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Header - Mobile optimized */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Database Backup</h1>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">Manage your backups</p>
                    </div>
                    <Button
                        onClick={createBackup}
                        className="gap-2 w-full sm:w-auto text-sm"
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus size={18} />
                                Create Backup
                            </>
                        )}
                    </Button>
                </div>

                {/* Info Card */}
                <div className="glass-card p-3 md:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm md:text-base">Automatic Backup Management</h3>
                            <p className="text-xs md:text-sm text-gray-600 mt-1 hidden sm:block">
                                The system automatically keeps the last 10 backups. Older backups are deleted when new ones are created.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats - Mobile optimized */}
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    <div className="glass-card p-3 flex flex-col items-center text-center">
                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-blue-100 flex items-center justify-center mb-2">
                            <Database className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                        </div>
                        <p className="text-lg md:text-2xl font-bold text-gray-800">{backups.length}</p>
                        <p className="text-xs text-gray-500 hidden md:block">Total Backups</p>
                    </div>
                    <div className="glass-card p-3 flex flex-col items-center text-center">
                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-green-100 flex items-center justify-center mb-2">
                            <FileText className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                        </div>
                        <p className="text-lg md:text-2xl font-bold text-gray-800">{totalSizeMB}</p>
                        <p className="text-xs text-gray-500 hidden md:block">MB Total</p>
                    </div>
                    <div className="glass-card p-3 flex flex-col items-center text-center">
                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                            <Clock className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />
                        </div>
                        <p className="text-xs md:text-base font-bold text-gray-800 truncate max-w-full px-1">
                            {backups.length > 0 ? backups[0].created_formatted.split(' ')[0] : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 hidden md:block">Latest</p>
                    </div>
                </div>

                {/* Backups List - Mobile optimized */}
                <div className="glass-card overflow-hidden">
                    <div className="px-3 md:px-4 py-2.5 md:py-3 bg-white/30 border-b border-white/20">
                        <h2 className="font-semibold text-gray-700 text-sm md:text-base">Backup History</h2>
                    </div>

                    {backups.length === 0 ? (
                        <div className="p-6 md:p-8 text-center">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
                                <Database className="w-7 h-7 md:w-8 md:h-8 text-gray-400" />
                            </div>
                            <h3 className="text-base md:text-lg font-medium text-gray-700 mb-1 md:mb-2">No Backups Yet</h3>
                            <p className="text-xs md:text-sm text-gray-500 mb-4">
                                Create your first backup to secure your data.
                            </p>
                            <Button onClick={createBackup} disabled={isCreating} className="text-sm">
                                Create First Backup
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {backups.map((backup, index) => (
                                <div
                                    key={backup.filename}
                                    className="p-3 md:p-4 hover:bg-white/10 transition-colors active:bg-white/20"
                                >
                                    {/* Mobile: Stacked layout */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                index === 0 ? 'bg-green-100' : 'bg-blue-100'
                                            }`}>
                                                <FileText className={`w-5 h-5 ${
                                                    index === 0 ? 'text-green-600' : 'text-blue-600'
                                                }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-medium text-gray-800 text-sm md:text-base truncate">{backup.filename}</p>
                                                    {index === 0 && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Latest
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mt-0.5">
                                                    <span className="hidden xs:inline">{backup.created_formatted}</span>
                                                    <span className="xs:hidden">{new Date(backup.created * 1000).toLocaleDateString()}</span>
                                                    <span>·</span>
                                                    <span>{backup.size_formatted}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons - Touch friendly */}
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <button
                                                onClick={() => downloadBackup(backup.filename)}
                                                className="p-2 md:p-2.5 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-colors text-blue-600 touch-manipulation"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteBackup(backup.filename)}
                                                disabled={deletingFile === backup.filename}
                                                className="p-2 md:p-2.5 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors text-red-500 touch-manipulation disabled:opacity-50"
                                                title="Delete"
                                            >
                                                {deletingFile === backup.filename ? (
                                                    <RefreshCw className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expandable details on mobile */}
                                    <div className="md:hidden mt-2 pt-2 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-400">
                                                <span>Created: {backup.created_formatted}</span>
                                            </div>
                                            <button
                                                onClick={() => downloadBackup(backup.filename)}
                                                className="flex items-center gap-1 text-xs text-blue-600 font-medium"
                                            >
                                                <Download className="w-3 h-3" />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Warning - Mobile optimized */}
                <div className="glass-card p-3 md:p-4 bg-amber-50 border border-amber-100">
                    <div className="flex items-start gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
                        </div>
                        <div className="text-xs md:text-sm text-amber-800">
                            <p className="font-medium">Regular Backups Recommended</p>
                            <p className="mt-0.5 md:mt-1 text-amber-700 hidden sm:block">
                                We recommend creating backups regularly, especially before making major changes to your system.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mobile FAB (Floating Action Button) for quick backup */}
                <button
                    onClick={createBackup}
                    disabled={isCreating}
                    className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-accent-500 text-white shadow-lg shadow-accent-500/30 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                    title="Create Backup"
                >
                    {isCreating ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                        <Plus className="w-6 h-6" />
                    )}
                </button>
            </div>
        </AuthenticatedLayout>
    );
}
