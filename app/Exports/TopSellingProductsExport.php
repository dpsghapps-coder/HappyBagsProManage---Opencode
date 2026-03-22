<?php

namespace App\Exports;

class TopSellingProductsExport extends BaseExport
{
    public function collection()
    {
        $rows = [['Top Selling Products Report'], ['Date Range:', $this->data['date_from'] . ' - ' . $this->data['date_to']], [''], ['Rank', 'Product Name', 'Quantity Sold', 'Total Revenue']];
        
        $rank = 1;
        foreach ($this->data['products'] as $product) {
            $rows[] = [$rank, $product['product_name'], $product['quantity_sold'], 'GHC ' . number_format($product['total_revenue'], 2)];
            $rank++;
        }

        return collect($rows);
    }

    public function headings(): array { return []; }
}
