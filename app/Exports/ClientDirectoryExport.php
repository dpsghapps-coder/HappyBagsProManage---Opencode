<?php

namespace App\Exports;

class ClientDirectoryExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Client Directory Report'], ['Generated:', $this->data['generated_at']], ['Total Clients', $this->data['total_clients']], [''], ['Client Name', 'Email', 'Mobile 1', 'Mobile 2', 'Address', 'Total Orders']];
        
        foreach ($this->data['clients'] as $client) {
            $rows[] = [$client['client_name'], $client['email'], $client['mobile_no1'], $client['mobile_no2'], $client['delivery_address'], $client['total_orders']];
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
