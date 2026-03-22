<?php

namespace App\Exports;

class SalesByClientExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Sales by Client Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], [''], ['Client Name', 'Order Count', 'Total Revenue']];
        
        foreach ($this->data['clients'] as $client) {
            $rows[] = [$client['client_name'], $client['order_count'], 'GHC ' . number_format($client['total_revenue'], 2)];
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
