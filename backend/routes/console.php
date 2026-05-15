<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment('Judicial Portal Running');
})->purpose('Display application status');