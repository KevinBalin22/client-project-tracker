<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RejectMalformedJson
{
    public function handle(Request $request, Closure $next): Response
    {
        $content = $request->getContent();

        if ($request->isJson() && trim($content) !== '') {
            json_decode($content);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'message' => 'The request body is not valid JSON: '.json_last_error_msg().'.',
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        return $next($request);
    }
}
