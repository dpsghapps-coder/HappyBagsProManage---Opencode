<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;

class BackupService
{
    private const BACKUP_DIR = 'backups';
    private const MAX_BACKUPS = 10;

    public static function createBackup(): string
    {
        $filename = 'backup_' . now()->format('Y-m-d_His') . '.sql';
        $path = storage_path('app/' . self::BACKUP_DIR . '/' . $filename);

        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }

        $connection = config('database.default');
        $config = config('database.connections.' . $connection);
        $isSqlite = $connection === 'sqlite';

        $dump = "-- HappyBagsProManage Database Backup\n";
        $dump .= "-- Generated: " . now()->format('Y-m-d H:i:s') . "\n";
        $dump .= "-- Database: " . $config['database'] . "\n";
        $dump .= "-- Driver: " . ($isSqlite ? 'SQLite' : 'MySQL') . "\n\n";

        if ($isSqlite) {
            $dump .= self::backupSqlite();
        } else {
            $dump .= self::backupMysql();
        }

        file_put_contents($path, $dump);

        self::cleanupOldBackups();

        return $filename;
    }

    private static function backupSqlite(): string
    {
        $dump = "-- SQLite Database Backup\n";
        $dump .= "PRAGMA foreign_keys=OFF;\n\n";

        $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");

        foreach ($tables as $table) {
            $tableName = $table->name;
            
            $dump .= "\n-- Table: {$tableName}\n";
            $dump .= "DROP TABLE IF EXISTS \"{$tableName}\";\n";

            $createTable = DB::select("SELECT sql FROM sqlite_master WHERE type='table' AND name = ?", [$tableName]);
            if (!empty($createTable)) {
                $dump .= $createTable[0]->sql . ";\n\n";
            }

            $rows = DB::table($tableName)->get();
            if ($rows->isNotEmpty()) {
                foreach ($rows as $row) {
                    $row = (array) $row;
                    $columns = implode('", "', array_keys($row));
                    $values = array_map(function ($value) {
                        if (is_null($value)) {
                            return 'NULL';
                        }
                        if (is_int($value) || is_float($value)) {
                            return $value;
                        }
                        return "'" . str_replace(["\r", "\n", "'", "\x00", "\x1a"], ["\\r", "\\n", "''", "\\0", "\\Z"], addslashes($value)) . "'";
                    }, array_values($row));
                    $values = implode(', ', $values);
                    $dump .= "INSERT INTO \"{$tableName}\" (\"{$columns}\") VALUES ({$values});\n";
                }
                $dump .= "\n";
            }
        }

        $dump .= "PRAGMA foreign_keys=ON;\n";
        
        return $dump;
    }

    private static function backupMysql(): string
    {
        $ignoreTables = [];
        $tables = DB::select('SHOW TABLES');
        $tableKey = 'Tables_in_' . config('database.connections.mysql.database');

        $dump = "SET FOREIGN_KEY_CHECKS=0;\n";
        $dump .= "SET SQL_MODE = NO_AUTO_VALUE_ON_ZERO;\n";
        $dump .= "SET AUTOCOMMIT = 0;\n";
        $dump .= "START TRANSACTION;\n\n";

        foreach ($tables as $table) {
            $tableName = $table->$tableKey;
            
            if (in_array($tableName, $ignoreTables)) {
                continue;
            }

            $dump .= "\n-- Table: {$tableName}\n";
            $dump .= "DROP TABLE IF EXISTS `{$tableName}`;\n";

            $createTable = DB::select("SHOW CREATE TABLE `{$tableName}`");
            if (!empty($createTable)) {
                $createResult = (array) $createTable[0];
                $createSQL = array_values($createResult)[1];
                $dump .= $createSQL . ";\n\n";
            }

            $rows = DB::table($tableName)->get();
            if ($rows->isNotEmpty()) {
                foreach ($rows as $row) {
                    $row = (array) $row;
                    $columns = implode('`, `', array_keys($row));
                    $values = array_map(function ($value) {
                        if (is_null($value)) {
                            return 'NULL';
                        }
                        return "'" . str_replace(["\r", "\n", "'"], ["\\r", "\\n", "\\'"], addslashes($value)) . "'";
                    }, array_values($row));
                    $values = implode(', ', $values);
                    $dump .= "INSERT INTO `{$tableName}` (`{$columns}`) VALUES ({$values});\n";
                }
                $dump .= "\n";
            }
        }

        $dump .= "SET FOREIGN_KEY_CHECKS=1;\n";
        $dump .= "COMMIT;\n";
        
        return $dump;
    }

    public static function listBackups(): array
    {
        $path = storage_path('app/' . self::BACKUP_DIR . '/');
        
        if (!is_dir($path)) {
            return [];
        }

        $files = collect(scandir($path))
            ->filter(fn($f) => pathinfo($f, PATHINFO_EXTENSION) === 'sql')
            ->map(fn($f) => [
                'filename' => $f,
                'size' => filesize($path . $f),
                'size_formatted' => self::formatBytes(filesize($path . $f)),
                'created' => filemtime($path . $f),
                'created_formatted' => date('M d, Y H:i', filemtime($path . $f)),
            ])
            ->sortByDesc('created')
            ->values()
            ->toArray();

        return $files;
    }

    public static function getBackupPath(string $filename): ?string
    {
        $path = storage_path('app/' . self::BACKUP_DIR . '/' . $filename);
        
        if (file_exists($path) && pathinfo($filename, PATHINFO_EXTENSION) === 'sql') {
            return $path;
        }
        
        return null;
    }

    public static function deleteBackup(string $filename): bool
    {
        $path = self::getBackupPath($filename);
        
        if ($path) {
            return unlink($path);
        }
        
        return false;
    }

    public static function cleanupOldBackups(): int
    {
        $backups = self::listBackups();
        $toDelete = array_slice($backups, self::MAX_BACKUPS);
        
        foreach ($toDelete as $backup) {
            self::deleteBackup($backup['filename']);
        }
        
        return count($toDelete);
    }

    private static function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
