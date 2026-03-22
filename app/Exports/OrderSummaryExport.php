<?php

namespace App\Exports;

class OrderSummaryExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Order Summary Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], ['Total Orders', $this->data['total_orders']], [''], ['Order ID', 'Client', 'Status', 'Subtotal', 'VAT', 'Total', 'Delivery Date', 'Created']];
        
        foreach ($this->data['orders'] as $order) {
            $rows[] = [$order['order_id'], $order['client_name'], $order['status'], 'GHC ' . $order['subtotal'], 'GHC ' . $order['vat'], 'GHC ' . $order['total'], $order['delivery_date'], $order['created_at']];
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
