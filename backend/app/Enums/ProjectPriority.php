<?php

namespace App\Enums;

enum ProjectPriority: string
{
    case Low = 'Low';
    case Medium = 'Medium';
    case High = 'High';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
