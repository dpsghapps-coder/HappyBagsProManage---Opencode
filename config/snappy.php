<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Snappy PDF / Image Configuration
    |--------------------------------------------------------------------------
    */

    'pdf' => [
        'enabled' => true,
        'binary'  => base_path('storage/bin/wkhtmltopdf.bat'),
        'timeout' => false,
        'options' => [
            'enable-local-file-access' => true,
        ],
        'env'     => [],
    ],
    
    'image' => [
        'enabled' => true,
        'binary'  => base_path('storage/bin/wkhtmltoimage.bat'),
        'env'     => [],
    ],

];
