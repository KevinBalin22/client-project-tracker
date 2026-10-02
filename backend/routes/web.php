<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'endpoints' => [
        'GET /projects',
        'GET /projects/{id}',
        'POST /projects',
        'PUT /projects/{id}',
        'DELETE /projects/{id}',
    ],
]));
