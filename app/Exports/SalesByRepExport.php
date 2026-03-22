<?php

namespace App\Exports;

class SalesByRepExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Sales by Sales Rep Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], [''], ['Sales Rep', 'Order Count', 'Total Revenue']];
        
        foreach ($this->data['reps'] as $rep) {
            $rows[] = [$rep['rep_name'], $rep['order_count'], 'GHC ' . number_format($rep['total_revenue'], 2)];
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
