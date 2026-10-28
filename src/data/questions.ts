/**
 * Banco de preguntas de la evaluación.
 *
 * Para cambiar la evaluación solo hay que editar este archivo: la aplicación
 * lee el arreglo `questions` y ajusta por sí sola la numeración, la barra de
 * progreso, el puntaje máximo y la pantalla de resultado.
 *
 * Campos:
 *  - id            : identificador único (además reinicia el contador).
 *  - text          : enunciado de la pregunta.
 *  - points        : puntos que vale la pregunta.
 *  - correctAnswer : respuesta correcta, visible solo al pulsar «Ver respuesta».
 *  - explanation   : (opcional) por qué esa es la respuesta correcta.
 *  - group         : (opcional) grupo al que le corresponde responder.
 *  - category      : (opcional) etiqueta temática sobre el enunciado.
 *  - timeLimit     : (opcional) segundos solo para esta pregunta.
 *                    Si se omite se usan 600 (10 minutos).
 */

export interface Question {
  id: number;
  text: string;
  points: number;
  correctAnswer: string;
  explanation?: string;
  group?: number;
  category?: string;
  timeLimit?: number;
}

/** Tiempo por defecto para cada pregunta: 10 minutos. */
export const DEFAULT_TIME_LIMIT = 600;

/** Cantidad de grupos que participan en la evaluación. */
export const TOTAL_GROUPS = 6;

/**
 * Preguntas de ejemplo sobre Tecnología de Información.
 * Reemplace el contenido por las preguntas definitivas; no hace falta tocar
 * ningún componente.
 */
export const questions: Question[] = [
  {
    id: 1,
    points: 4,
    category: 'Redes',
    text: '¿Qué dispositivo permite interconectar diferentes redes y decidir por qué camino viajan los paquetes hasta su destino?',
    correctAnswer: 'El router',
    explanation:
      'El router trabaja en la capa de red: lee la dirección IP de destino, la compara con su tabla de enrutamiento y reenvía el paquete por la mejor ruta. El switch, en cambio, solo conmuta tramas dentro de una misma red local.',
  },
  {
    id: 2,
    points: 4,
    category: 'Seguridad informática',
    text: 'Una empresa sufre un ataque en el que se cifran todos sus archivos y se exige un pago para recuperarlos. ¿De qué tipo de software malicioso se trata y cuál es la medida preventiva más eficaz?',
    correctAnswer: 'Ransomware; la medida más eficaz son las copias de seguridad periódicas y aisladas de la red',
    explanation:
      'El ransomware cifra la información y pide un rescate. Pagar no garantiza la recuperación, por eso la defensa real es disponer de respaldos probados y fuera de línea, junto con actualizaciones y control de accesos.',
  },
  {
    id: 3,
    points: 4,
    category: 'Bases de datos',
    text: 'En una base de datos relacional, ¿qué función cumple la clave primaria y en qué se diferencia de la clave foránea?',
    correctAnswer:
      'La clave primaria identifica de forma única cada registro de una tabla; la clave foránea apunta a la clave primaria de otra tabla para relacionarlas',
    explanation:
      'La clave primaria no admite valores repetidos ni nulos y garantiza que cada fila sea distinguible. La clave foránea establece la relación entre tablas y mantiene la integridad referencial: no puede apuntar a un registro que no existe.',
  },
  {
    id: 4,
    points: 4,
    category: 'Sistemas operativos',
    text: 'Explique la diferencia entre memoria RAM y almacenamiento secundario (disco duro o SSD), e indique qué ocurre con la información de cada uno al apagar el equipo.',
    correctAnswer:
      'La RAM es memoria volátil de trabajo y pierde su contenido al apagar el equipo; el almacenamiento secundario es no volátil y conserva los datos',
    explanation:
      'La RAM guarda los datos y programas en ejecución, es mucho más rápida y se borra al cortar la energía. El disco o SSD mantiene la información de forma permanente, aunque con tiempos de acceso bastante mayores.',
  },
  {
    id: 5,
    points: 4,
    category: 'Desarrollo web',
    text: 'Al escribir una dirección en el navegador, ¿qué servicio traduce el nombre de dominio a una dirección IP y por qué es necesario ese paso?',
    correctAnswer: 'El DNS (Sistema de Nombres de Dominio)',
    explanation:
      'Las personas recordamos nombres, pero el enrutamiento en Internet funciona con direcciones IP numéricas. El DNS actúa como directorio: consulta el nombre de dominio y devuelve la IP del servidor para poder establecer la conexión.',
  },
];

/** Puntaje máximo posible: la suma de los puntos de todas las preguntas. */
export const MAX_SCORE = questions.reduce((total, question) => total + question.points, 0);
