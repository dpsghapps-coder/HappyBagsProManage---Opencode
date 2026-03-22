<?php

namespace App\Exports;

class PaymentSummaryExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Payment Summary Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], [''], ['Total Payments', $this->data['total_payments']], ['Total Amount', 'GHC ' . $this->data['total_amount']], [''], ['Order ID', 'Client', 'Amount', 'Type', 'Recorded By', 'Date']];
        
        foreach ($this->data['payments'] as $payment) {
            $rows[] = [$payment['order_id'], $payment['client_name'], 'GHC ' . $payment['amount'], $payment['payment_type'], $payment['recorded_by'], $payment['date']];
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
