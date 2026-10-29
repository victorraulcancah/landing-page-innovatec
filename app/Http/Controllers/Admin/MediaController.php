<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /** Sube una imagen y devuelve su URL publica. SVG queda fuera a proposito (puede llevar scripts). */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif', 'max:4096'],
        ], [
            'image.mimes' => 'Sube una imagen JPG, PNG, WebP o GIF.',
            'image.max' => 'La imagen no puede pesar más de 4 MB.',
        ]);

        $file = $request->file('image');
        $name = Str::random(16).'.'.$file->extension();
        Storage::disk('uploads')->putFileAs('', $file, $name);

        return response()->json(['url' => '/uploads/'.$name]);
    }
}
