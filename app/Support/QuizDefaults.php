<?php

namespace App\Support;

/**
 * Datos de fábrica del autodiagnóstico: las situaciones y la recomendación de cada una. Solo se usan para llenar la
 * base de datos la primera vez (seeders); después todo se edita desde el panel.
 */
class QuizDefaults
{
    /** @return array<string, mixed> */
    public static function quiz(): array
    {
        $i = fn (string $text, string $recommendation) => compact('text', 'recommendation');

        return [
            'title' => '¿Qué tan expuesta está tu empresa?',
            'subtitle' => 'Marca lo que se parece a tu empresa.',
            'items' => [
                $i('Dependo de una sola persona para toda mi tecnología', 'Documentar la tecnología y establecer continuidad del soporte.'),
                $i('Nunca probé restaurar un backup', 'Revisar los respaldos y programar pruebas de recuperación.'),
                $i('No sé cuántas computadoras y licencias tengo', 'Realizar un inventario y asignar responsables de activos.'),
                $i('Ex trabajadores podrían seguir entrando a mi correo o sistema', 'Revisar cuentas y permisos, priorizando accesos sensibles.'),
                $i('Cuando falla el internet o el ERP, yo hago de intermediario', 'Centralizar la coordinación técnica y el seguimiento.'),
                $i('No sé cuánto gastaré en TI este mes', 'Planificar el presupuesto con inventario, vencimientos y compras a tiempo.'),
            ],
            'result_eyebrow' => 'Tus recomendaciones',
            'result_title' => 'Identificaste {n} situaciones por revisar',
            'result_title_one' => 'Identificaste 1 situación por revisar',
            'result_intro' => 'Estas son las acciones por las que convendría comenzar:',
            'msg_zero' => 'Marca lo que se parece a tu empresa y te mostramos por dónde conviene comenzar.',
            'result_note' => 'El resultado no es una puntuación certificada de riesgo.',
            'cta_label' => 'Solicitar diagnóstico',
            'cta_empty' => 'Agenda tu diagnóstico',
        ];
    }
}
