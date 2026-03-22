<?php

namespace App\Exports;

use Illuminate\Support\Collection;

class SalesByProductExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Sales by Product Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], [''], ['Product Name', 'Quantity Sold', 'Total Revenue']];
        
        foreach ($this->data['products'] as $product) {
            $rows[] = [$product['product_name'], $product['quantity_sold'], 'GHC ' . number_format($product['total_revenue'], 2)];
        }

        return collect($rows);
    }

    public function headings(): array
    {
        return [];
    }
}
