<?php

namespace App\Exports;

class RevenueExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Revenue Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], [''], ['Summary'], ['Total Revenue', 'GHC ' . $this->data['total_revenue']], ['Total Paid', 'GHC ' . $this->data['total_paid']], ['Outstanding', 'GHC ' . $this->data['outstanding']], [''], ['Payment Details'], ['Order ID', 'Client', 'Amount', 'Type', 'Date']];
        
        foreach ($this->data['payments'] as $payment) {
            $rows[] = [$payment['order_id'], $payment['client_name'], 'GHC ' . $payment['amount'], $payment['payment_type'], $payment['date']];
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
