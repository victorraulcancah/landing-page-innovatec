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

    /**
     * Sube un documento (PDF, Word, Excel, PowerPoint) o un video (MP4, WebM) y devuelve su URL pública y el nombre
     * original. El peso máximo también depende del límite de subida del servidor (PHP y Nginx).
     */
    public function file(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,mp4,webm', 'max:40960'],
        ], [
            'file.mimes' => 'Sube un PDF, Word, Excel, PowerPoint, o un video MP4 o WebM.',
            'file.max' => 'El archivo no puede pesar más de 40 MB.',
            'file.uploaded' => 'No se pudo subir: el servidor limita el peso de los archivos. Prueba con uno más liviano o sube el video a YouTube y pega el enlace.',
        ]);

        $file = $request->file('file');
        $name = Str::random(16).'.'.strtolower($file->extension());
        Storage::disk('uploads')->putFileAs('', $file, $name);

        return response()->json(['url' => '/uploads/'.$name, 'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)]);
    }
}
