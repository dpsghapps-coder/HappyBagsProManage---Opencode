<?php

namespace App\Exports;

class DeliveryScheduleExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Delivery Schedule Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], ['Total Deliveries', $this->data['total_deliveries']], [''], ['Order ID', 'Client', 'Address', 'Contact', 'Delivery Date', 'Status', 'Total']];
        
        foreach ($this->data['deliveries'] as $delivery) {
            $rows[] = [$delivery['order_id'], $delivery['client_name'], $delivery['delivery_address'], $delivery['contact'], $delivery['delivery_date'], $delivery['status'], 'GHC ' . $delivery['total']];
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
