<?php

return [
    'exports' => [
        'chunk_size' => 1000,
        'pre_calculate_formulas' => false,
        'csv' => [
            'delimiter' => ',',
            'enclosure' => '"',
            'line_ending' => "\r\n",
            'use_bom' => false,
        ],
    ],
    'imports' => [
        'chunk_size' => 1000,
        'headings' => true,
    ],
];
