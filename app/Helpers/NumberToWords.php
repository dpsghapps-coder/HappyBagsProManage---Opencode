<?php

if (!function_exists('numberToWords')) {
    function numberToWords(float $amount): string
    {
        $amount = round($amount, 2);
        
        $cedis = intval($amount);
        $pesewas = round(($amount - $cedis) * 100);
        
        $cedisWords = convertNumber($cedis);
        $pesewasWords = convertNumber($pesewas);
        
        $result = $cedisWords . ' Cedis';
        
        if ($pesewas > 0) {
            $result .= ', ' . $pesewasWords . ' Pesewas';
        }
        
        return $result;
    }
}

if (!function_exists('convertNumber')) {
    function convertNumber(int $num): string
    {
        if ($num == 0) {
            return 'Zero';
        }
        
        $ones = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];
        
        $tens = [
            '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
        ];
        
        if ($num < 20) {
            return $ones[$num];
        }
        
        if ($num < 100) {
            $ten = intval($num / 10);
            $one = $num % 10;
            return $tens[$ten] . ($one > 0 ? ' ' . $ones[$one] : '');
        }
        
        if ($num < 1000) {
            $hundred = intval($num / 100);
            $remainder = $num % 100;
            return $ones[$hundred] . ' Hundred' . ($remainder > 0 ? ' ' . convertNumber($remainder) : '');
        }
        
        if ($num < 1000000) {
            $thousands = intval($num / 1000);
            $remainder = $num % 1000;
            return convertNumber($thousands) . ' Thousand' . ($remainder > 0 ? ' ' . convertNumber($remainder) : '');
        }
        
        if ($num < 1000000000) {
            $millions = intval($num / 1000000);
            $remainder = $num % 1000000;
            return convertNumber($millions) . ' Million' . ($remainder > 0 ? ' ' . convertNumber($remainder) : '');
        }
        
        $billions = intval($num / 1000000000);
        $remainder = $num % 1000000000;
        return convertNumber($billions) . ' Billion' . ($remainder > 0 ? ' ' . convertNumber($remainder) : '');
    }
}
