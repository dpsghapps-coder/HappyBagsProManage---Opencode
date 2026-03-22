<?php

namespace App\Exports;

class OrdersByStatusExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Orders by Status Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], [''], ['Status', 'Order Count', 'Total Value']];
        
        foreach ($this->data['statuses'] as $status) {
            $rows[] = [$status->status, $status->count, 'GHC ' . number_format($status->total, 2)];
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
