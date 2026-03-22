<?php

namespace App\Exports;

class ClientOrderHistoryExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Client Order History Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], ['']];
        
        foreach ($this->data['clients'] as $client) {
            $rows[] = [$client['client_name'], 'Orders: ' . $client['order_count'], 'Total Spent: GHC ' . $client['total_spent']];
            $rows[] = ['Order ID', 'Date', 'Total', 'Status'];
            foreach ($client['orders'] as $order) {
                $rows[] = [$order['order_id'], $order['date'], 'GHC ' . $order['total'], $order['status']];
            }
            $rows[] = [''];
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
