<?php

namespace App\Exports;

class OutstandingPaymentsExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Outstanding Payments Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], [''], ['Total Outstanding', 'GHC ' . $this->data['total_outstanding']], [''], ['Order ID', 'Client', 'Total', 'Paid', 'Outstanding', 'Delivery Date']];
        
        foreach ($this->data['orders'] as $order) {
            $rows[] = [$order['order_id'], $order['client_name'], 'GHC ' . $order['total'], 'GHC ' . $order['paid'], 'GHC ' . $order['outstanding'], $order['delivery_date']];
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
