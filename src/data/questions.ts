/**
 * Banco de preguntas de la evaluación.
 *
 * Para cambiar la evaluación solo hay que editar este archivo: la aplicación
 * lee el arreglo `questions` y ajusta por sí sola la numeración, la barra de
 * progreso, el puntaje máximo y la pantalla de resultado.
 *
 * Campos:
 *  - id            : identificador único (además reinicia el contador).
 *  - title         : (opcional) nombre del caso que encabeza el enunciado.
 *  - text          : enunciado o situación planteada.
 *  - code          : (opcional) bloque literal (salida de consola, listado…).
 *  - parts         : (opcional) incisos; se numeran solos a), b), c)…
 *  - points        : puntos que vale la pregunta.
 *  - correctAnswer : clave resumida, visible solo al pulsar «Ver respuesta».
 *  - answers       : (opcional) clave inciso por inciso, en el mismo orden
 *                    que `parts`; es lo que se muestra al revelar.
 *  - explanation   : (opcional) nota adicional sobre la respuesta.
 *  - group         : (opcional) grupo al que le corresponde responder.
 *  - category      : (opcional) etiqueta temática sobre el enunciado.
 *  - timeLimit     : (opcional) segundos solo para esta pregunta.
 *                    Si se omite se usan 600 (10 minutos).
 */

export interface Question {
  id: number;
  title?: string;
  text: string;
  code?: string;
  parts?: string[];
  points: number;
  correctAnswer: string;
  answers?: string[];
  explanation?: string;
  group?: number;
  category?: string;
  timeLimit?: number;
}

/** Tiempo por defecto para cada pregunta: 10 minutos. */
export const DEFAULT_TIME_LIMIT = 600;

/** Cantidad de grupos que participan en la evaluación. */
export const TOTAL_GROUPS = 6;

export const questions: Question[] = [
  {
    id: 1,
    points: 4,
    category: 'Redes y cableado',
    title: 'Consultora «Andes Tech» instala su oficina',
    text:
      'La empresa alquila un piso con 40 PC. El rack está en un extremo y el puesto más lejano ' +
      'queda a 115 metros. Dos switches deben conectarse entre sí. En la sala de servidores hay ' +
      'un grupo electrógeno que genera interferencia. El servidor corre Ubuntu sin entorno gráfico.',
    parts: [
      'El proveedor ofrece UTP Cat6. Según lo visto, ¿el enlace de 115 m funcionará? Justifica con el dato técnico del cable y di qué velocidad soporta Cat5e frente a Cat6.',
      'Para el enlace switch ↔ switch, ¿qué cable corresponde y qué estándar va en cada extremo? Explica qué ocurre eléctricamente en ese cable.',
      'En la sala del grupo electrógeno, ¿UTP o STP? Indica la diferencia constructiva y dos desventajas del que elijas.',
      'En el servidor se necesita: ver la IP, comprobar que llega a internet, ver memoria RAM libre y crear de una sola vez respaldos/2026/octubre. Escribe los cuatro comandos exactos.',
      'Clasifica la red de la oficina y la topología que conviene; da su ventaja y su desventaja según la PPT.',
    ],
    correctAnswer:
      'No funciona a 115 m (máximo 100 m) · cable cruzado T568A–T568B · STP · ip addr, ping, free -h, mkdir -p · LAN en estrella',
    answers: [
      'No: la longitud máxima del UTP es 100 m. Cat5e = 1 Gbps, Cat6 = 10 Gbps.',
      'Cruzado (crossover): un extremo T568A y el otro T568B; se invierten los pines TX y RX.',
      'STP: 4 pares trenzados con blindaje metálico. Desventajas: mayor costo y es más rígido / difícil de instalar.',
      'ip addr · ping 8.8.8.8 (o ping google.com) · free -h · mkdir -p respaldos/2026/octubre',
      'LAN; topología estrella: fácil de gestionar / depende del switch central.',
    ],
  },
  {
    id: 2,
    points: 4,
    category: 'Seguridad informática',
    title: 'Incidente en la distribuidora «LogiSur»',
    text:
      'El lunes los archivos del servidor aparecen cifrados con un pedido de rescate. La ' +
      'investigación arroja tres hechos: (1) un operario abrió un adjunto inesperado; (2) ese ' +
      'operario trabajaba con la cuenta de administrador; (3) no se instalan parches desde hace ' +
      '7 meses. El único respaldo estaba en el mismo servidor. Días antes, el antivirus ya había ' +
      'detectado un programa que se replicaba infectando otros archivos al ejecutarse, y otro que ' +
      'se propagaba por la red sin que nadie hiciera nada.',
    parts: [
      'Nombra las tres amenazas descritas en el enunciado y defínelas diferenciándolas entre sí.',
      'De las seis buenas prácticas de la PPT, identifica las cuatro que LogiSur incumplió y explica en una línea cómo debió aplicarse cada una.',
      'Explica la regla 3-2-1 y por qué el respaldo que tenían no servía.',
      '¿Qué pilar de la tríada CIA se vio directamente afectado al quedar los archivos cifrados? Define los otros dos pilares.',
      'Escribe el comando de Ubuntu que actualiza la lista de paquetes y aplica las mejoras en una sola línea, y el comando que activa el firewall.',
    ],
    correctAnswer:
      'Ransomware, virus y gusano · mínimo privilegio, actualizaciones, respaldos y desconfiar de adjuntos · regla 3-2-1 · disponibilidad · apt update && apt upgrade, ufw enable',
    answers: [
      'Ransomware (cifra archivos y pide rescate), virus (se replica e infecta otros archivos al ejecutarse) y gusano (se propaga por la red sin intervención del usuario).',
      'Mínimo privilegio (no usar root/admin para tareas cotidianas); mantener el SO actualizado (los atacantes explotan vulnerabilidades conocidas); copias de seguridad; desconfiar de lo desconocido / adjuntos inesperados.',
      '3 copias, en 2 medios distintos, 1 fuera del sitio. La suya estaba en el mismo equipo, así que el cifrado la alcanzó.',
      'Disponibilidad. Confidencialidad = solo usuarios autorizados acceden; Integridad = los datos no se alteran sin autorización.',
      'sudo apt update && sudo apt upgrade · sudo ufw enable',
    ],
  },
  {
    id: 3,
    points: 4,
    category: 'Linux y permisos',
    title: 'Auditoría de permisos en el laboratorio',
    text: 'El docente lista archivos en Ubuntu y obtiene:',
    code: '-rwxr-x---  alumno1  docentes  practica.sh\n-rw-r--r--  alumno2  alumnos   notas.txt',
    parts: [
      'Interpreta la primera línea completa: tipo, permisos de propietario, grupo y otros, propietario y grupo.',
      'Un usuario del grupo docentes: ¿puede ejecutar practica.sh? ¿Puede modificarlo? Justifica.',
      '¿Qué número usa chmod para dar rwx al dueño y rx a grupo y otros? Escribe el comando completo sobre practica.sh.',
      'alumno2 debe ceder notas.txt a alumno1 y al grupo docentes. Escribe el comando y di por qué necesita sudo.',
      'El docente quiere ver solo las últimas 5 líneas de notas.txt, y luego el archivo completo paginado. Escribe ambos comandos e indica cómo se sale del segundo.',
      '¿Qué dos comandos muestran, respectivamente, el usuario actual y su UID/GID con sus grupos?',
    ],
    correctAnswer:
      'Archivo regular rwx r-x --- de alumno1:docentes · ejecutar sí, modificar no · chmod 755 · sudo chown · tail -5 y less (se sale con q) · whoami e id',
    answers: [
      'Archivo regular (-); propietario rwx (leer, escribir, ejecutar); grupo r-x (leer y ejecutar); otros --- (sin permisos); dueño alumno1, grupo docentes.',
      'Sí puede ejecutarlo (la x está presente); no puede modificarlo (no tiene w).',
      '755 → chmod 755 practica.sh',
      'sudo chown alumno1:docentes notas.txt · sudo ejecuta el comando como superusuario, necesario para cambiar el propietario.',
      'tail -5 notas.txt y less notas.txt · se sale con q.',
      'whoami e id.',
    ],
  },
  {
    id: 4,
    points: 4,
    category: 'Sistemas operativos móviles',
    title: 'Flota móvil de la empresa «TransAndina»',
    text:
      'La empresa debe equipar a 300 conductores. Evalúa teléfonos Android, iPhone, y teléfonos ' +
      'muy económicos para zonas rurales. Un gerente propone «usar Windows Phone porque la empresa ' +
      'ya tiene Office 365». El área de TI advierte que en hora punta el sistema de pedidos se ' +
      'satura y deja de responder.',
    parts: [
      'Evalúa la propuesta del gerente con el dato de la PPT sobre Windows Phone y menciona por qué fue conocido ese SO.',
      'Para las zonas rurales con teléfonos de gama baja, ¿qué SO corresponde? Indica en qué está basado, a qué mercados apunta, su cuota y dos apps que soporta.',
      'Compara Android e iOS en código fuente, dispositivos compatibles, cuota de mercado, personalización y seguridad. Con esos datos, justifica cuál conviene para 300 equipos de distintas marcas.',
      'El gerente pregunta por HarmonyOS. Explica su origen, su propósito multi-dispositivo y su estado/cuota.',
      'La saturación del sistema de pedidos corresponde a una amenaza de la PPT: nómbrala y defínela. Escribe además los dos comandos Linux que usarías para ver puertos activos y procesos en tiempo real.',
    ],
    correctAnswer:
      'Windows Phone está descontinuado · KaiOS para gama baja · Android para 300 equipos de distintas marcas · HarmonyOS de Huawei · ataque DoS: netstat -tuln y top/htop',
    answers: [
      'Windows Phone fue descontinuado en 2017, así que la propuesta es inviable; fue conocido por su interfaz de «Tiles» y su integración con Office 365.',
      'KaiOS (KaiOS Technologies), basado en Firefox OS, orientado a gama baja y mercados emergentes, ~2 % mundial; soporta WhatsApp y Google Maps.',
      'Android: AOSP de código abierto, múltiples fabricantes (Samsung, Xiaomi, Motorola), ~72 %, personalización alta (widgets, launchers, ROMs), seguridad variable según el fabricante. iOS: propietario cerrado, solo iPhone/iPad, ~27 %, personalización limitada pero consistente, seguridad muy controlada y uniforme. → Android, por soportar distintas marcas y dominar el mercado.',
      'SO propio de Huawei desarrollado tras las restricciones de Google, diseñado para funcionar en múltiples dispositivos (teléfonos, TV, autos); activo, ~4 % de cuota en Asia.',
      'Ataque DoS: satura un servicio o red para que deje de funcionar correctamente. netstat -tuln y top / htop.',
    ],
  },
  {
    id: 5,
    points: 4,
    category: 'Topologías y Linux',
    title: 'Campamento minero «Altoandina»',
    text:
      'El campamento controla sistemas críticos: la red no puede caer aunque se corte un enlace. ' +
      'Se evaluaron tres topologías: bus, estrella y malla. El campamento se enlaza con la sede de ' +
      'Lima; dentro de cada módulo hay Wi-Fi; los técnicos usan audífonos Bluetooth. El servidor ' +
      'Ubuntu solo se administra por terminal.',
    parts: [
      'Elige la topología adecuada y justifica con su ventaja. Indica su desventaja y explica por qué se descartan bus y estrella usando la desventaja específica de cada una.',
      'Clasifica: enlace campamento–Lima, red interna del módulo por cable, Wi-Fi del módulo y el audífono Bluetooth. Da el alcance aproximado de los dos últimos.',
      'Según la PPT, ¿qué es la topología de árbol, cuál es su ventaja y su desventaja? ¿Por qué no es la mejor opción aquí?',
      'Menciona cuatro elementos del árbol de directorios de Linux indicando qué guarda cada uno, e incluye obligatoriamente dónde están los logs y dónde la configuración del sistema.',
      'Sobre los mecanismos de protección: explica la diferencia entre autenticación y control de acceso, dando dos ejemplos de cada uno según la PPT.',
    ],
    correctAnswer:
      'Malla por redundancia · WAN / LAN / WLAN / PAN · árbol: cae el nodo raíz · /etc configuración y /var logs · autenticación vs. control de acceso',
    answers: [
      'Malla: alta redundancia (ventaja), pero costosa y compleja (desventaja). Bus: un fallo corta toda la red. Estrella: depende del switch central, si falla cae toda la red.',
      'WAN / LAN / WLAN (~30–100 m) / PAN (~1–10 m).',
      'Disposición jerárquica; ventaja: escalable; desventaja: si falla el nodo raíz, falla todo, algo inaceptable en sistemas críticos.',
      '/ raíz; /bin comandos esenciales (ls, cp, mv); /etc configuración del sistema; /home carpetas personales; /root directorio del superusuario; /tmp temporales; /usr aplicaciones y librerías; /var logs, bases de datos y datos variables.',
      'Autenticación = verificar la identidad del usuario antes de dar acceso (contraseñas seguras, 2FA, biometría, llaves SSH). Control de acceso = determinar qué recursos puede usar cada usuario (permisos chmod, usuarios y grupos, UAC en Windows, sudo/administrador).',
    ],
  },
];

/** Puntaje máximo posible: la suma de los puntos de todas las preguntas. */
export const MAX_SCORE = questions.reduce((total, question) => total + question.points, 0);
