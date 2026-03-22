<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class SalesSummaryExport extends BaseExport
{
    public function collection()
    {
        $rows = [
            ['Sales Summary Report'],
            ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']],
            ['Generated:', $this->data['generated_at']],
            [''],
            ['Metric', 'Value'],
            ['Total Orders', $this->data['total_orders']],
            ['Total Revenue', 'GHC ' . $this->data['total_revenue']],
            ['Total Paid', 'GHC ' . $this->data['total_paid']],
            ['Outstanding', 'GHC ' . $this->data['outstanding']],
            ['Average Order Value', 'GHC ' . $this->data['avg_order_value']],
        ];

        return collect($rows);
    }

    public function headings(): array
    {
        return [];
    }
}
