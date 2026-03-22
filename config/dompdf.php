<?php

return [
    'pdf' => [
        'enabled' => true,
        'public_path' => null,
        'binary' => env('DOMPDF_BINARY', null),
        'font_path' => base_path('resources/fonts/'),
        'font_data' => [],
        'orientation' => 'portrait',
        'verify_format' => true,
        'debug' => env('APP_DEBUG', false),
    ],
];
