<?php

namespace App\Exports;

class ProductSalesSummaryExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Product Sales Summary Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], [''], ['Product Name', 'Quantity Sold', 'Total Revenue', 'Order Count']];
        
        foreach ($this->data['products'] as $product) {
            $rows[] = [$product['product_name'], $product['quantity_sold'], 'GHC ' . number_format($product['total_revenue'], 2), $product['order_count']];
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
