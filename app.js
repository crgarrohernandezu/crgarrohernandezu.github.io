/* =========================================================
   app.js - Prototipo TG · Documental USACH (vanilla)
   ========================================================= */

/* =========================================================
   1. STATE + PERSISTENCIA (localStorage)
   ========================================================= */
const STORAGE_KEY = 'tg-doc-proto-v1';
const defaultState = {
  search: {
    query:'', scope:'todo', filters:{}, sort:'relevancia', view:'rows', page:1,
    advancedOpen:false, quickFiltersOpen:null, selectedChips:[], facetsDocked:true, filterDrawerOpen:false, miExplDrawerOpen:false, homeCollectionsExpanded:false,
    history:['reglamento becas postgrado','RE-001-2024','renuncia académica','horarios navidad'],
    trail:[{tipo:'consulta',label:'cómo renunciar',ts:Date.now()-3600_000,q:'cómo renunciar'},{tipo:'filtro',label:'Solo Vigentes',ts:Date.now()-3000_000,key:'estado',val:'Vigente'}],
    savedDocs:[],
    expandedTerms:[],
    openDocs:[],
    comparedDocs:[],
    _clarification:null,
    evaluationMode:false,
    routeSearchScrollY:0,
    showExploracion:false,
    stickyCompact:false,
    previewDocId:null,
    whyOpenDocId:null,
    lastResultIds:[],
    lastPreviewIndex:-1,
    _scrollBeforeDrawer:0,
    _focusBeforeDrawer:null,
    _collapsed: {unidad:false, tipo:false, anio:false, estado:false, acceso:false, confianza:false, senal:false, nivel:false, versiones:false, relaciones:false, disponibilidad:false, materia:false}
  },
  review: {
    decisions: {},
    selected: null,
    selectedCand: null,
    evIdx: 0,
    corrOpen: null,
    filters: {relacion:'todas', confianza:'todas', estado:'todas', unidad:'todas', anio:'todas', senal:'todas'},
    history: [],
    progress: {total:5, aceptadas:0, corregidas:0, rechazadas:0, pendientes:5, posteriores:0},
    _focusChange: null,
    _focusDoc: null
  },
  admin: {
    role: 'administrador',
    pipelineStep: 6,
    lastSummary: {
      refsExplicitas: 3,
      candidatos: 5,
      pendientes: 5,
      advertencias: 1,
      docId: 'd002'
    },
    tableSearch: ''
  },
  ui: {
    railOpen: true,
    navOpen: true
  },
  currentRoute: { name:'home', params:{}, query:{} }
};
let state = loadState();
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const merged = Object.assign({}, deepClone(defaultState), parsed);
    if(merged.search){
      merged.search = Object.assign({}, deepClone(defaultState.search), merged.search);
      if(!Array.isArray(merged.search.history)) merged.search.history = deepClone(defaultState.search.history);
      if(!Array.isArray(merged.search.trail)) merged.search.trail = [];
      if(!Array.isArray(merged.search.savedDocs)) merged.search.savedDocs = [];
      if(!Array.isArray(merged.search.expandedTerms)) merged.search.expandedTerms = [];
      if(!Array.isArray(merged.search.openDocs)) merged.search.openDocs = [];
      if(!Array.isArray(merged.search.comparedDocs)) merged.search.comparedDocs = [];
      if(!merged.search._collapsed) merged.search._collapsed = deepClone(defaultState.search._collapsed);
    }
    if(merged.review){
      merged.review = Object.assign({}, deepClone(defaultState.review), merged.review);
      if(!Array.isArray(merged.review.selected)) merged.review.selected = [];
    }
    if(merged.admin) merged.admin = Object.assign({}, deepClone(defaultState.admin), merged.admin);
    if(merged.ui) merged.ui = Object.assign({}, deepClone(defaultState.ui), merged.ui);
    return merged;
  }catch(e){ return deepClone(defaultState); }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function deepClone(o){ return JSON.parse(JSON.stringify(o)); }

/* =========================================================
   2. DATOS MOCK (USACH · contenido realista en español)
   ========================================================= */
const TIPOS = ['Reglamento','Normativa','Acuerdo','Circular','Resolución','Convenio','Manual','Protocolo','Directiva'];
const UNIDADES = ['Rectoría','Vicerrectoría Académica','Vicerrectoría de Investigación','Vicerrectoría Financiera','Facultad de Ingeniería','Facultad de Ciencia','Facultad de Humanidades','Dirección de Admisión','DIDECO','Secretaría General'];
const ESTADOS = ['Vigente','Histórico','En revisión'];
const ACCESOS = ['Público','Interno','Rol unidad'];

const DOCUMENTOS = [
  {id:'d001', codigo:'RE-001-2024', tipo:'Reglamento', unidad:'Vicerrectoría Académica', fecha:'2024-03-14', anio:2024, estado:'Vigente', disponibilidad:'Público', consultas:12580,
   titulo:'Reglamento de Ingreso y Admisión a Pregrado 2024',
   resumen:'Norma el proceso de ingreso regular y especial a carreras de pregrado, incluyendo ponderaciones PAES, cupos PSU, cupos especiales y sistema de re-postulación. Deroga RE-002-2022.',
   versiones:[{v:'1.0', fecha:'2024-03-14', nota:'Publicación oficial en Diario Oficial.'},{v:'1.1', fecha:'2024-05-02', nota:'Corrección errata en artículo 17 numeral 3.'}],
   secciones:['Disposiciones Generales','Proceso Regular','Cupos Especiales','Ponderaciones','Recursos','Transitorios'],
   articulos:['Artículo 1. El ingreso a las carreras de pregrado se regirá por lo dispuesto en el presente reglamento, por la Ley 20.027 y por los estatutos institucionales vigentes.','Artículo 2. Se reconocen tres vías de ingreso: vía PAES regular, cupos especiales y admisión directa para postulantes destacados.','Artículo 3. Las ponderaciones específicas por carrera serán publicadas anualmente por la Dirección de Admisión, con a lo menos 180 días de antelación al proceso de postulación.','Artículo 17. Los cupos destinados a cupos PACE representarán no menos del 15% del total de vacantes de cada facultad.','Artículo 21. Los recursos de reposición se interpondrán dentro de los 5 días hábiles siguientes a la publicación de resultados.'],
   afectaciones:[{relacion:'Deroga', codigo:'RE-002-2022', descripcion:'Reglamento de Ingreso 2022'}]},
  {id:'d002', codigo:'RE-007-2024', tipo:'Reglamento', unidad:'Vicerrectoría Financiera', fecha:'2024-06-18', anio:2024, estado:'Vigente', disponibilidad:'Interno', consultas:8943,
   titulo:'Reglamento de Presupuesto, Ejecución Financiera y Control de Gastos',
   resumen:'Establece el ciclo presupuestario anual, principios de ejecución, límites de delegación de firma y controles posteriores a la ejecución. Integra las modificaciones introducidas por la Circular CF-19 del Ministerio de Hacienda.',
   versiones:[{v:'1.0', fecha:'2024-06-18', nota:'Aprobado por Consejo Directivo del 15 de junio.'}],
   secciones:['Principios Presupuestarios','Ciclo Anual','Modificaciones Presupuestarias','Delegación de Firmas','Control y Auditoría','Disposiciones Finales'],
   articulos:['Artículo 4. El presupuesto anual se elaborará bajo la metodología de presupuesto base cero, con desglose por unidad y por glosa presupuestaria.','Artículo 9. La modificación presupuestaria por traslado de glosa requerirá resolución del o de la vicerrector(a) financiero(a), cuando el monto supere el 5% de la glosa de destino.','Artículo 15. Las delegaciones de firma operarán conforme a niveles de monto: Nivel 1 hasta 500 UF; Nivel 2 hasta 5.000 UF; Nivel 3 superior al umbral anterior con firma conjunta.'],
   afectaciones:[{relacion:'Modifica parcialmente', codigo:'RE-011-2021', descripcion:'Reglamento de Tesorería 2021'},{relacion:'Incorpora lineamientos de', codigo:'CI-CF-19', descripcion:'Circular 19 Ministerio de Hacienda'}]},
  {id:'d003', codigo:'AC-004-2024', tipo:'Acuerdo', unidad:'Consejo Universitario', fecha:'2024-05-30', anio:2024, estado:'Vigente', disponibilidad:'Público', consultas:5430,
   titulo:'Acuerdo CU N°4/2024 · Política de Igualdad de Género e Inclusión',
   resumen:'Ratifica los lineamientos estratégicos institucionales en materia de equidad, incorporando metas cuatrienales de participación y protocolo de acompañamiento para personas en situación de discriminación.',
   versiones:[{v:'1.0', fecha:'2024-05-30', nota:'Aprobación unánime en sesión N° 33 del Consejo Universitario.'}],
   secciones:['Ámbito de Aplicación','Definiciones','Principios','Metas 2024-2027','Mecanismos de Seguimiento','Transitorios'],
   articulos:['Artículo 3. Las unidades académicas y administrativas reportarán anualmente sus avances de equidad a la Unidad de Género e Inclusión.','Artículo 8. El protocolo de acompañamiento estará disponible para toda persona integrante de la comunidad, bajo reserva debida y acompañamiento psicológico.'],
   afectaciones:[{relacion:'Supletorio a', codigo:'CU-011-2020', descripcion:'Acuerdo Marco de Inclusión 2020'}]},
  {id:'d004', codigo:'CI-21-2024', tipo:'Circular', unidad:'Rectoría', fecha:'2024-08-22', anio:2024, estado:'Vigente', disponibilidad:'Público', consultas:22100,
   titulo:'Circular Rectoría 021/2024 · Horarios y Cierre Administrativo Navidad 2024',
   resumen:'Establece el cierre administrativo gradual desde el lunes 23 de diciembre al viernes 3 de enero, con guardias mínimas operativas y procedimiento para autorización de teletrabajo extraordinario.',
   versiones:[{v:'1.0', fecha:'2024-08-22', nota:'Emisión oficial'}],
   secciones:['Alcance','Cierre Gradual','Guardias','Teletrabajo','Consultas'],
   articulos:['Artículo 1. El presente horario de cierre afecta a todas las unidades dependientes de Rectoría y vicerrectorías, salvo las expresamente exceptuadas.','Artículo 4. Las solicitudes de teletrabajo extraordinario se autorizarán por jefatura directa con copia a la Dirección de Personal.'],
   afectaciones:[{relacion:'Deroga', codigo:'CI-008-2020', descripcion:'Circular Docencia Mixta 2020'}]},
  {id:'d005', codigo:'RE-002-2022', tipo:'Reglamento', unidad:'Vicerrectoría Académica', fecha:'2022-01-15', anio:2022, estado:'Histórico', disponibilidad:'Público', consultas:18400,
   titulo:'Reglamento de Ingreso y Admisión a Pregrado 2022',
   resumen:'Norma el proceso de ingreso a carreras de pregrado año 2022. Derogado a contar del 14 de marzo de 2024 por RE-001-2024.',
   versiones:[{v:'1.0', fecha:'2022-01-15', nota:'Publicación original'}],
   secciones:['Disposiciones Generales','Proceso Regular','Cupos Especiales'],
   articulos:['Artículo 2. Se reconocen dos vías de ingreso: vía PSU regular y cupos especiales.','Artículo 17. Los cupos destinados a cupos PACE representarán no menos del 12% del total de vacantes.'],
   afectaciones:[{relacion:'Derogado por', codigo:'RE-001-2024', descripcion:'Reglamento de Ingreso 2024'}]},
  {id:'d006', codigo:'MA-010-2023', tipo:'Manual', unidad:'Dirección de Admisión', fecha:'2023-09-12', anio:2023, estado:'Vigente', disponibilidad:'Interno', consultas:4120,
   titulo:'Manual Operativo de Postulación en Línea 2024',
   resumen:'Describe paso a paso el flujo de uso del sistema de postulación, incluyendo validación de documentos, resolución de incidencias y generación de actas resumen.',
   versiones:[{v:'2.0', fecha:'2023-09-12', nota:'Actualización para el proceso 2024.'}],
   secciones:['Acceso al Sistema','Ingreso de Datos','Validación','Actas','Reversas','Soporte'],
   articulos:['Sección 3.4: La validación automática de documentos considerará coincidencia por RUT, nombre y tipo de documento.'],
   afectaciones:[]},
  {id:'d007', codigo:'RE-006-2020', tipo:'Reglamento', unidad:'Facultad de Ingeniería', fecha:'2020-10-01', anio:2020, estado:'En revisión', disponibilidad:'Interno', consultas:7840,
   titulo:'Reglamento de Convalidaciones y Reconocimiento de Aprendizajes Previos',
   resumen:'Establece los criterios para convalidar asignaturas y reconocer aprendizajes previos en estudiantes de transferencia y convenios bilaterales.',
   versiones:[{v:'1.0', fecha:'2020-10-01', nota:'Aprobación Consejo de Facultad Ingeniería'}],
   secciones:['Alcance','Criterios','Procedimiento','Comité','Casos Especiales'],
   articulos:['Artículo 11. La convalidación procederá cuando exista al menos un 75% de coincidencia de contenidos entre la asignatura cursada y la asignatura de destino.'],
   afectaciones:[{relacion:'Derogado por', codigo:'RE-001-2024', descripcion:'Título V del Reglamento de Ingreso'}]},
  {id:'d008', codigo:'RE-031-2021', tipo:'Reglamento', unidad:'Vicerrectoría Académica', fecha:'2021-11-10', anio:2021, estado:'Vigente', disponibilidad:'Interno', consultas:9980,
   titulo:'Reglamento de Doctorados Institucionales',
   resumen:'Establece lineamientos comunes para todos los programas de doctorado en coherencia con la política de posgrado y acreditación avanzada.',
   versiones:[{v:'1.2', fecha:'2022-06-07', nota:'Ajuste en requisitos de evaluación anual'}],
   secciones:['Finalidad','Admisión','Currículo','Avance','Graduación','Comités'],
   articulos:['Artículo 9. El comité de programa revisará anualmente el plan individual de cada estudiante de doctorado, considerando avances de artículo científico y plan de tesis.'],
   afectaciones:[]},
  {id:'d009', codigo:'CO-007-2023', tipo:'Convenio', unidad:'Vicerrectoría de Investigación', fecha:'2023-02-20', anio:2023, estado:'Vigente', disponibilidad:'Interno', consultas:1520,
   titulo:'Convenio Marco de Colaboración CONICYT · USACH 2023-2025',
   resumen:'Acuerdo marco con ANID para ejecución de proyectos Fondecyt, Fondef y centros de excelencia con contrapartidas institucionales.',
   versiones:[{v:'1.0', fecha:'2023-02-20', nota:'Firma institucional'}],
   secciones:['Objeto','Contrapartidas','Plazo','Renuncia','Confidencialidad'],
   articulos:['Cláusula 4: La contrapartida institucional mínima por proyecto Fondecyt Regular será de 20 millones anuales de apoyo indirecto.'],
   afectaciones:[]},
  {id:'d010', codigo:'DI-014-2024', tipo:'Directiva', unidad:'DIDECO', fecha:'2024-07-01', anio:2024, estado:'Vigente', disponibilidad:'Público', consultas:3210,
   titulo:'Directiva de Vinculación con el Medio Proyectos Extensiones 2024',
   resumen:'Define criterios de evaluación, montos máximos y modalidades de proyectos de extensión con financiamiento DIDECO.',
   versiones:[{v:'1.0', fecha:'2024-07-01', nota:'Aprobación Director(a) DIDECO'}],
   secciones:['Tipos de Proyecto','Presupuesto','Criterios','Flujo','Cierre'],
   articulos:['Artículo 7. Se priorizarán proyectos con al menos 3 socios externos de carácter público o comunitario.'],
   afectaciones:[{relacion:'Deroga', codigo:'DI-014-2023', descripcion:'Directiva Proyectos Extensión 2023'}]},
  {id:'d011', codigo:'PR-002-2022', tipo:'Protocolo', unidad:'Vicerrectoría Académica', fecha:'2022-04-05', anio:2022, estado:'Vigente', disponibilidad:'Interno', consultas:6120,
   titulo:'Protocolo de Integridad Académica y Prevención del Plagio',
   resumen:'Institucionaliza procedimientos de detección, sanción y acompañamiento ante conductas contrarias a la integridad académica en pregrado y posgrado.',
   versiones:[{v:'1.1', fecha:'2023-01-14', nota:'Ampliación de alcance a trabajos de titulación'}],
   secciones:['Definiciones','Principios','Detección','Procedimiento','Medidas','Apelaciones'],
   articulos:['Artículo 12. Toda tesis de posgrado y trabajo final de pregrado será sometido a software de detección de similitud antes de su presentación a tribunal.'],
   afectaciones:[]},
  {id:'d012', codigo:'RS-009-2023', tipo:'Resolución', unidad:'Secretaría General', fecha:'2023-12-18', anio:2023, estado:'Vigente', disponibilidad:'Público', consultas:2980,
   titulo:'Resolución Rect N° 009/2023 · Comisión de Autoevaluación Institucional',
   resumen:'Conforma la comisión triestamental responsable de conducir el proceso de autoevaluación para acreditación institucional CEA año 2025.',
   versiones:[{v:'1.0', fecha:'2023-12-18', nota:'Publicación B.O.'}],
   secciones:['Conformación','Objetivos','Plazo','Informes'],
   articulos:['Artículo 3. La comisión entregará informe parcial a los 6 meses e informe final a los 18 meses de conformada.'],
   afectaciones:[{relacion:'Deroga', codigo:'RS-003-2019', descripcion:'Resolución Rect. Comisión Autoevaluación 2019'}]},
  {id:'d013', codigo:'RE-011-2021', tipo:'Reglamento', unidad:'Vicerrectoría Financiera', fecha:'2021-05-03', anio:2021, estado:'Histórico', disponibilidad:'Interno', consultas:10120,
   titulo:'Reglamento de Tesorería y Administración de Fondos',
   resumen:'Norma el manejo de fondos, conciliaciones bancarias y rendiciones. Modificado parcialmente por RE-007-2024 en materia de delegaciones.',
   versiones:[{v:'1.0', fecha:'2021-05-03', nota:'Original'}],
   secciones:['General','Apertura de Cuentas','Conciliaciones','Rendiciones'],
   articulos:['Artículo 15. Las conciliaciones bancarias se practicarán mensualmente por unidad y se remitirán con firma del contralor interno.'],
   afectaciones:[{relacion:'Modificado parcialmente por', codigo:'RE-007-2024', descripcion:'Reglamento Presupuesto y Ejecución'},{relacion:'Derogado por', codigo:'RE-007-2024', descripcion:'Título VI del Reglamento de Presupuesto'}]},
  {id:'d014', codigo:'CI-008-2020', tipo:'Circular', unidad:'Rectoría', fecha:'2020-11-20', anio:2020, estado:'Histórico', disponibilidad:'Público', consultas:14230,
   titulo:'Circular 008/2020 · Modalidad de Docencia Mixta 1er Semestre 2021',
   resumen:'Establece lineamientos para el retorno gradual a presencialidad en carreras de la salud y experimentales durante el primer semestre académico 2021.',
   versiones:[{v:'1.2', fecha:'2020-12-02', nota:'Incorporación Facultad de Química.'}],
   secciones:['Ámbito','Criterios','Aforos','Contingencia'],
   articulos:['Artículo 4. El aforo máximo será de un 35% de la capacidad normal del salón, con medición de aforo al ingreso.'],
   afectaciones:[{relacion:'Derogado por', codigo:'CI-21-2024', descripcion:'Cierre Administrativo Navidad 2024 (reemplazo lineamiento docencia mixta)'}]},
  {id:'d015', codigo:'RS-2092-1991', tipo:'Resolución', unidad:'Facultad de Humanidades', fecha:'1991-07-19', anio:1991, estado:'Histórico', disponibilidad:'Público', consultas:3420,
   pdf:'Resolución 2092/r912092_crea_postitulo_de_especialista_en_metodologia_de_la_ensenanza_del_ingles_y_su_reglamento.pdf',
   titulo:'Resolución 2092/1991 · Crea Postítulo de Especialista en Metodología de la Enseñanza del Inglés y aprueba su Reglamento de Régimen Académico',
   resumen:'Crea el Programa de Postítulo de Especialista en Metodología de la Enseñanza del Inglés en la Facultad de Humanidades y aprueba su Reglamento de Régimen Académico. Define requisitos de ingreso, plan de estudios, sistema de calificaciones, régimen de tesina y emisión de certificaciones.',
   versiones:[{v:'1.0', fecha:'1991-07-19', nota:'Publicación oficial aprobada por Consejo de Facultad de Humanidades, sesión N° 96 del 6 de junio de 1991.'}],
   secciones:['Considerandos y Vistos','RESUELVO · Creación del Programa','I. Definiciones y Responsabilidades','II. Sistema de Ingreso','III. Del Plan de Estudios','IV. De las Calificaciones','V. La Tesina','VI. De las Certificaciones y Diplomas','Disposiciones Finales'],
   articulos:[
     'Artículo 1. Créase el Programa de Postítulo de Especialista en Metodología de la Enseñanza del Inglés, dependiente de la Facultad de Humanidades de la Universidad de Santiago de Chile.',
     'Artículo 2. La selección y admisión a este Programa de Postítulo estará a cargo de la Facultad de Humanidades, de acuerdo con los criterios que esta unidad establezca para estos efectos.',
     'Artículo 3. Para los efectos de este reglamento se operará con las definiciones siguientes: PROGRAMA DE POSTÍTULO, RÉGIMEN ACADÉMICO, PLAN DE ESTUDIOS, CÁTEDRA, TESINA, COMITÉ DE POSTÍTULO, PROFESORES REGULARES y PROFESORES VISITANTES, cada uno con su contenido normativo específico.',
     'Artículo 4. El responsable del Programa será el Director del Departamento de Idiomas, quien podrá delegar la gestión ejecutiva en un Coordinador. Se establecen sus funciones específicas así como las atribuciones del Comité de Postítulo en materias de cupos, preselección y pautas departamentales de tesinas.',
     'Artículo 5. Podrán postular al Postítulo quienes posean el grado de Licenciado en Educación con mención en Inglés, o el Título de Profesor de Inglés o equivalente. Además, los postulantes deberán acreditar una experiencia docente mínima de 2 años.',
     'Artículo 6. Los procedimientos de ingreso comprenden tres etapas: (a) Postulación con presentación de antecedentes en Coordinación; (b) Selección a cargo del Coordinador y dos profesores del programa; (c) Matrícula en la Facultad de Humanidades dentro del plazo establecido, con aranceles fijados por la Facultad.',
     'Artículo 7. Las cátedras podrán ser ofrecidas bajo las denominaciones que adopten las asignaturas específicas. El Director del Departamento de Idiomas informará a la Facultad las cátedras del trimestre respectivo y los académicos que las dictarán.',
     'Artículo 8. Las cátedras del Plan de Estudios serán materia de una resolución específica. Tendrán un trimestre de duración y a lo menos 48 horas de clases distribuidas en 12 semanas. Se exceptúa la tesina, que tendrá 12 horas.',
     'Artículo 9. Será obligación del estudiante realizar sus estudios en trimestres consecutivos. Por excepción, el Decano podrá conceder suspensión temporal por una sola vez, a solicitud del alumno y previo informe del Director del Departamento de Idiomas.',
     'Artículo 10. La permanencia mínima de un estudiante en el Programa, incluida la presentación y calificación de la Tesina, será igual a tres trimestres académicos.',
     'Artículo 11. La permanencia máxima de un alumno en el Programa, incluida la presentación y aprobación de la Tesina, será igual o inferior a seis trimestres académicos.',
     'Artículo 12. En cada cátedra o actividad, la calificación final será responsabilidad del profesor o profesores asignados a ellas.',
     'Artículo 13. En cada cátedra los alumnos deberán rendir, a lo menos, dos evaluaciones sumativas parciales y una evaluación final de carácter acumulativo.',
     'Artículo 14. Para aprobar la cátedra, el alumno deberá acreditar una asistencia igual o superior a 80%. Las calificaciones parciales se expresan en escala de 1 a 7; la calificación final en escala A (máxima distinción, ≥6,5), B (distinción, 5,0–6,4), C (aprobado, 4,0–4,9) y D (reprobado, <4,0). La calificación mínima de aprobación es C.',
     'Artículo 15. El alumno que al final del trimestre tenga un promedio parcial de aprobación pero no complete los requerimientos por razones justificadas obtendrá calificación I (incompleto). Contará con un plazo máximo de un trimestre para cumplir los requisitos pendientes.',
     'Artículo 16. El alumno que reprobare alguna cátedra deberá cursarla en el trimestre siguiente mediante el sistema tutorial y en forma paralela a las cátedras de ese trimestre, siendo su aprobación requisito para rendir examen final. Si la reprobare nuevamente quedará excluido del Programa.',
     'Artículo 17. Los estudiantes podrán iniciar su tesina cuando hayan aprobado la totalidad de las cátedras de los niveles anteriores (primero y segundo trimestre). El proceso considera presentación del proyecto y evaluación por Comisión, y revisión y calificación por el Profesor Guía.',
     'Artículo 18. En caso de que la Tesina fuese aprobada con observaciones, el estudiante deberá incorporar las modificaciones en el plazo de 45 días. Si obtiene calificación D, deberá repetirla por una sola vez en el trimestre siguiente.',
     'Artículo 19. El proceso de evaluación y calificación de la tesina se sujetará a las disposiciones que dicte el Comité de Postítulo y la normativa vigente de posgrado de la Universidad.',
     'Artículo 20. Los alumnos que aprueben la totalidad de las exigencias curriculares tendrán derecho a un Diploma de Postítulo que los acredite como "Especialista en Metodología de la Enseñanza del Inglés" y a las certificaciones correspondientes.',
     'Artículo 21. Cualquier situación no prevista en esta Resolución será resuelta por el Decano de la Facultad de Humanidades.'
   ],
   pdfPath:'docs/resolucion-2092-1991.pdf',
   keywords:['Postítulo','Metodología','Enseñanza del Inglés','Facultad de Humanidades','Régimen Académico','Tesina','Especialista'],
   area:'Académica · Posgrado · Humanidades',
   refLegal:'D.F.L. N° 149 de 1981 · Resolución N° 841 del 2 de mayo de 1988 · Acuerdo Consejo de Facultad N° 96/1991 · Estatutos USACH',
   afectaciones:[
     {relacion:'Aprueba', codigo:'REGLAMENTO-RRA-1991', descripcion:'Reglamento de Régimen Académico del Postítulo de Especialista en Metodología de la Enseñanza del Inglés', evidencia:'"...y APRUEBA SU REGLAMENTO DE REGIMEN ACADEMICO" en el título de la resolución.', validador:'Secretaría General · Facultad de Humanidades', fechaVal:'1991-07-19', articulo:'Título', pagina:'1'},
     {relacion:'Cita', codigo:'RS-841-1988', descripcion:'Resolución N° 841 del 2 de mayo de 1988 (facultades del Decano)', evidencia:'"...las facultades que me confiere el Art. 6.10 de la Resolución N° 841 del 2 de mayo de 1988"', validador:'Secretaría General USACH', fechaVal:'1991-07-19', articulo:'Vistos', pagina:'1'},
     {relacion:'Cita', codigo:'DFL-149-1981', descripcion:'D.F.L. N° 149 de 1981 (norma orgánica de la Universidad)', evidencia:'VISTOS: lo dispuesto en el D.F.L. 149 de 1981', validador:'Secretaría General USACH', fechaVal:'1991-07-19', articulo:'Vistos', pagina:'1'}
   ]}
];

const COLECCIONES = [
  {id:'c1', nombre:'Admisión e Ingreso 2024', desc:'Normativa oficial y operativos del proceso de admisión 2024.', count:6, pattern:'pt-diag', color:'#2A4463', docs:['d001','d006','d010']},
  {id:'c2', nombre:'Presupuesto y Finanzas', desc:'Reglamentos de presupuesto, ejecución y controles.', count:9, pattern:'pt-grid', color:'#B95A3B', docs:['d002','d013']},
  {id:'c3', nombre:'Equidad, Género e Inclusión', desc:'Acuerdos, protocolos y directrices de equidad.', count:4, pattern:'pt-waves', color:'#5E4268', docs:['d003','d011']},
  {id:'c4', nombre:'Investigación y Posgrado', desc:'Convenios, reglamentos doctorales y proyectos ANID.', count:7, pattern:'pt-dots', color:'#3F6B4A', docs:['d008','d009','d015']},
  {id:'c5', nombre:'Vinculación con el Medio', desc:'Directivas, proyectos y convenios DIDECO.', count:3, pattern:'pt-lines', color:'#A77B1D', docs:['d010']},
  {id:'c6', nombre:'Rectoría y Secretaría', desc:'Circulares, resoluciones y acuerdos CU.', count:11, pattern:'pt-cross', color:'#566274', docs:['d004','d003','d012']},
  {id:'c7', nombre:'Integridad y Ética', desc:'Protocolos, códigos y comité de ética institucional.', count:5, pattern:'pt-diag', color:'#566274', docs:['d011']},
  {id:'c8', nombre:'Normativa Histórica y Referencia', desc:'Versiones históricas y normativas antiguas conservadas como referencia.', count:14, pattern:'pt-grid', color:'#1F2430', docs:['d005','d013','d014','d015']}
];

const CAMBIOS_RECIENTES = [
  {id:'ch1', desde:'d001', hacia:'d005', relacion:'Deroga', fecha:'2024-03-14', por:'Vice.Académica',
    detalle:'RE-001-2024 sustituye versión 2022, nuevo porcentaje PACE 15% (antes 12%).',
    confianza:'muy_alta', senal:'explícita', estado:'validado', validador:'Carlos Garrido · Sec.Gral',
    evidencia:'"Deroga RE-002-2022" párrafo final del considerando 3º.',
    origenDoc:'Reglamento RE-001-2024 · Artículo 21 · Pág. 14'},
  {id:'ch2', desde:'d002', hacia:'d013', relacion:'Modifica parcialmente', fecha:'2024-06-18', por:'Vice.Finanzas',
    detalle:'Niveles de delegación de firma actualizados por tramos UF: Nivel 1 hasta 500 UF, Nivel 2 hasta 5.000 UF.',
    confianza:'alta', senal:'híbrida', estado:'validado', validador:'Marcela Rojas · Contraloría',
    evidencia:'Nueva definición "tramos por nivel de firma" sustituye tabla anterior.',
    origenDoc:'RE-007-2024 · Artículo 15 · Pág. 22'},
  {id:'ch3', desde:'d003', hacia:'d011', relacion:'Complementa', fecha:'2024-05-30', por:'Rectoría',
    detalle:'Política de género incorpora protocolo de acompañamiento (existente en Protocolo Integridad).',
    confianza:'media', senal:'semántica', estado:'pendiente', validador:'—',
    evidencia:'"Acompañamiento psicológico" aparece en ambos textos.',
    origenDoc:'Acuerdo CU 4/2024 · Artículo 8 · Pág. 7'},
  {id:'ch4', desde:'d001', hacia:'d006', relacion:'Prorroga', fecha:'2024-03-14', por:'Dir.Admisión',
    detalle:'Postulaciones extraordinarias se extienden 15 días hábiles respecto del Manual Operativo.',
    confianza:'alta', senal:'explícita', estado:'corregido', validador:'Diego Fuentes · Dir.Admisión',
    evidencia:'"Se prorroga el plazo del Manual Operativo MA-010-2023 en 15 días."',
    origenDoc:'RE-001-2024 · Disposición transitoria 2 · Pág. 28'},
  {id:'ch5', desde:'d004', hacia:'d014', relacion:'Sin afectación directa', fecha:'2024-08-22', por:'Rectoría',
    detalle:'Circular 21/2024 establece cierre navideño sin impactar normativa vigente.',
    confianza:'baja', senal:'léxica', estado:'rechazado', validador:'Sofía Mardones · Rectoría',
    evidencia:'Ámbitos no solapados (horarios administrativos vs docencia).',
    origenDoc:'Circular 021/2024 · Considerandos · Pág. 1'},
  {id:'ch6', desde:'d003', hacia:'CU-011-2020', relacion:'Rectifica', fecha:'2024-05-30', por:'Consejo Universitario',
    detalle:'Meta cuatrienal de participación ajustada de 40% a 45% en cargos dirección.',
    confianza:'alta', senal:'explícita', estado:'validado', validador:'Comisión de Género',
    evidencia:'Artículo 3 de CU 4/2024 reemplaza literal del Acuerdo Marco 2020.',
    origenDoc:'CU 4/2024 · Artículo 3 · Pág. 5'},
  {id:'ch7', desde:'d008', hacia:'d001', relacion:'Posible relación', fecha:'2023-11-10', por:'Vice.Académica',
    detalle:'Convalidaciones podrían extenderse a ingreso vía admisión especial de doctorado.',
    confianza:'media', senal:'semántica', estado:'pendiente', validador:'—',
    evidencia:'Menciones a "cupos especiales" y "admisión directa".',
    origenDoc:'RE-031-2021 · Artículo 9 · Pág. 11'}
];

const SCOPES_BUSQUEDA = [
  {v:'todo',   label:'Todo el archivo',    icon:'<i class="fa-solid fa-bullseye ic-meta" aria-hidden="true"></i>'},
  {v:'titulo', label:'Solo títulos',       icon:'<i class="fa-solid fa-file-pen ic-meta" aria-hidden="true"></i>'},
  {v:'cuerpo', label:'Contenido / Artículos', icon:'<i class="fa-solid fa-file-lines ic-meta" aria-hidden="true"></i>'},
  {v:'unidad', label:'Unidad responsable', icon:'<i class="fa-solid fa-building-columns ic-meta" aria-hidden="true"></i>'},
  {v:'codigo', label:'Código / Referencia', icon:'<i class="fa-solid fa-hashtag ic-meta" aria-hidden="true"></i>', desc:'búsqueda exacta tipo RE-001-2024'}
];

const CONSULTAS_SUGERIDAS = [
  {q:'reglamento ingreso PACE 15% vacantes', scope:'todo'},
  {q:'delegación firma Nivel 2 hasta 5.000 UF', scope:'cuerpo'},
  {q:'protocolo acompañamiento equidad género',  scope:'todo'},
  {q:'Convenio ANID contrapartida Fondecyt',     scope:'titulo'},
  {q:'Circular cierre navideño 23 diciembre',    scope:'todo'}
];

const CHIPS_TEMATICOS = [
  {label:'Ingreso 2024',       q:'ingreso 2024'},
  {label:'Presupuesto UF',     q:'delegación firma presupuesto'},
  {label:'Equidad género',     q:'género inclusión equidad'},
  {label:'Doctorados',         q:'doctorado comité programa'},
  {label:'Circulares Rectoría',q:'circular rectoría'},
  {label:'Convalidaciones',    q:'convalidación transferencia 75%'},
  {label:'Integridad plagio',  q:'plagio integridad tesis similitud'},
  {label:'Acreditación CEA',   q:'autoevaluación acreditación CEA 2025'}
];

const TIPOS_REL_COLOR = {
  'Deroga':                 {c:'#B91C1C', bg:'#FEF2F2', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Deja sin efecto'},
  'Modifica parcialmente':  {c:'#B45309', bg:'#FFFBEB', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Ajusta parcial'},
  'Modifica parcial':       {c:'#B45309', bg:'#FFFBEB', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Ajusta parcial'},
  'Aprueba':                {c:'#166534', bg:'#ECFDF5', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Sanciona oficial'},
  'Complementa':            {c:'#1D4ED8', bg:'#EFF6FF', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Agrega contenido'},
  'Reemplaza':              {c:'#B91C1C', bg:'#FEF2F2', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Sustituye'},
  'Rectifica':              {c:'#A16207', bg:'#FEF9C3', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Corrige literal'},
  'Prorroga':               {c:'#0369A1', bg:'#EFF6FF', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Extiende plazo'},
  'Deja sin efecto':        {c:'#7F1D1D', bg:'#FEF2F2', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Anula'},
  'Incorpora lineamientos': {c:'#166534', bg:'#ECFDF5', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Agrega criterio'},
  'Supletorio a':           {c:'#6B21A8', bg:'#FAF5FF', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Complementa'},
  'Cita':                   {c:'#4B5563', bg:'#F3F4F6', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Referencia'},
  'Afecta presupuesto de proyecto': {c:'#B95A3B', bg:'#FFF7ED', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Impacto $'},
  'Sin afectación directa': {c:'#6B7280', bg:'#F3F4F6', dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>', etiqueta:'Independiente'},
  'Derogado por':           {c:'#B91C1C', bg:'#FEF2F2', dir:'<i class="fa-solid fa-arrow-left ic-meta" aria-hidden="true"></i>', etiqueta:'Queda sin efecto'},
  'Modificado parcialmente por': {c:'#B45309', bg:'#FFFBEB', dir:'<i class="fa-solid fa-arrow-left ic-meta" aria-hidden="true"></i>', etiqueta:'Ajustado por'},
  'Posible relación':       {c:'#64748B', bg:'#F1F5F9', dir:'<i class="fa-solid fa-circle-question ic-meta" aria-hidden="true"></i>', etiqueta:'Revisar'}
};

const ESTADOS_REL_COLOR = {
  'validado':    {c:'#166534', bg:'#ECFDF5', label:'Validado',   icon:'<i class="fa-solid fa-check ic-meta" aria-hidden="true"></i>'},
  'corregido':   {c:'#92400E', bg:'#FFFBEB', label:'Corregido',  icon:'<i class="fa-solid fa-pen ic-meta" aria-hidden="true"></i>'},
  'rechazado':   {c:'#B91C1C', bg:'#FEF2F2', label:'Rechazado',  icon:'<i class="fa-solid fa-xmark ic-meta" aria-hidden="true"></i>'},
  'pendiente':   {c:'#1D4ED8', bg:'#EFF6FF', label:'Pendiente', icon:'<i class="fa-solid fa-clock-rotate-left ic-meta" aria-hidden="true"></i>'}
};

const SENAL_COLOR = {
  'explícita':  {c:'#166534', label:'Referencia explícita', dot:'<i class="fa-solid fa-circle ic-meta" aria-hidden="true"></i>'},
  'léxica':     {c:'#6B21A8', label:'Coincidencia léxica',  dot:'<i class="fa-solid fa-circle-half-stroke ic-meta" aria-hidden="true"></i>'},
  'semántica':  {c:'#1D4ED8', label:'Recuperación semántica',dot:'<i class="fa-regular fa-gem ic-meta" aria-hidden="true"></i>'},
  'híbrida':    {c:'#B45309', label:'Regla híbrida',          dot:'<i class="fa-solid fa-gem ic-meta" aria-hidden="true"></i>'}
};

const CANDIDATOS = [
  {id:'k01', docNuevoId:'d002', docCandId:'d013', relacionSugerida:'Modifica parcialmente',
   confianza:'alta', senal:'híbrida',
   porqueComparte:['niveles de delegación de firma','tesorería','artículo 15: conciliaciones'],
   evidenciaNuevo:['Niveles de firma por tramos UF, Nivel 1 hasta 500 UF, Nivel 2 hasta 5.000 UF...','La modificación presupuestaria por traslado de glosa requerirá resolución vicerrectorial...'],
   evidenciaCand:['Artículo 15. Las conciliaciones bancarias se practicarán mensualmente por unidad...','Niveles de delegación de firma originales no incluyen tramo por UF.'],
   fragmentosSync:[{nuevo:'Nivel 1 hasta 500 UF; Nivel 2 hasta 5.000 UF', cand:'Niveles de delegación de firma originales'}]},
  {id:'k02', docNuevoId:'d001', docCandId:'d005', relacionSugerida:'Deroga',
   confianza:'muy_alta', senal:'explícita',
   porqueComparte:['RE-002-2022 en artículos deroga','mismo ámbito ingreso','menciones a cupos PACE 12% a 15%'],
   evidenciaNuevo:['"Deroga RE-002-2022" en párrafo final del resumen del Reglamento RE-001-2024.','PACE sube del 12% al 15% de vacantes por facultad.'],
   evidenciaCand:['RE-002-2022 artículo 17: cupos PACE "no menos del 12%"','Título: Reglamento de Ingreso y Admisión a Pregrado 2022.'],
   fragmentosSync:[{nuevo:'Deroga RE-002-2022', cand:'RE-002-2022 artículo 17'},{nuevo:'15% del total de vacantes', cand:'12% del total de vacantes'}]},
  {id:'k03', docNuevoId:'d003', docCandId:'d011', relacionSugerida:'Incorpora lineamientos',
   confianza:'media', senal:'semántica',
   porqueComparte:['equidad','acompañamiento','protocolo','integridad'],
   evidenciaNuevo:['Artículo 8 protocolo de acompañamiento.','Meta 2027: reducir brechas en participación en cargos de dirección.'],
   evidenciaCand:['Protocolo de Integridad: detección de plagio y acompañamiento.','Apelaciones: reserva y apoyo psicológico.'],
   fragmentosSync:[{nuevo:'protocolo de acompañamiento estará disponible', cand:'acompañamiento psicológico'}]},
  {id:'k04', docNuevoId:'d004', docCandId:'d014', relacionSugerida:'Sin afectación directa',
   confianza:'baja', senal:'léxica',
   porqueComparte:['circular','horarios','rectoría'],
   evidenciaNuevo:['Cierre administrativo gradual 23 diciembre a 3 enero.','Guardias mínimas operativas.'],
   evidenciaCand:['Modalidad de docencia mixta y aforos.','Incorporación Facultad de Química.'],
   fragmentosSync:[]},
  {id:'k05', docNuevoId:'d002', docCandId:'d009', relacionSugerida:'Afecta presupuesto de proyecto',
   confianza:'media', senal:'híbrida',
   porqueComparte:['contrapartida ANID','presupuesto base cero','unidad vicerrectoría'],
   evidenciaNuevo:['Presupuesto bajo metodología de presupuesto base cero.','Glosa de transferencia.'],
   evidenciaCand:['Contrapartida institucional mínima por proyecto Fondecyt: 20 millones.','Objeto: proyectos Fondecyt, Fondef y centros.'],
   fragmentosSync:[{nuevo:'metodología de presupuesto base cero', cand:'Contrapartida institucional mínima por proyecto'}]}
];

const STEPS_REVIEW = [
  {n:1, t:'Recibir documento', desc:'Subida y metadatos'},
  {n:2, t:'Señalizador', desc:'Detección automática de afectaciones'},
  {n:3, t:'Candidatos', desc:'Revisión administrativa'},
  {n:4, t:'Decisiones', desc:'Aceptar · Corregir · Rechazar'},
  {n:5, t:'Evidencia', desc:'Comparación y fragmentos'},
  {n:6, t:'Publicación', desc:'Cierre y registro histórico'}
];

const TIPOS_RELACION = ['Deroga','Modifica parcialmente','Aprueba','Incorpora lineamientos','Supletorio a','Cita','Derogado por','Modificado parcialmente por','Afecta presupuesto de proyecto','Sin afectación directa','Otro (describir)'];

/* =========================================================
   3. UTILIDADES
   ========================================================= */
const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
function escHTML(s){ return (s==null?'':String(s)).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function fmtDate(iso){ if(!iso) return ''; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; }
function fmtHace(iso){
  if(!iso) return '';
  const t = new Date(iso).getTime();
  const ahora = Date.now();
  const diff = Math.max(0, ahora-t);
  const d = Math.floor(diff/86400000);
  if(d===0) return 'hoy';
  if(d===1) return 'ayer';
  if(d<30) return `hace ${d} d`;
  if(d<365) return `hace ${Math.floor(d/30)} mes${Math.floor(d/30)===1?'':'es'}`;
  return `hace ${Math.floor(d/365)} año${Math.floor(d/365)===1?'':'s'}`;
}
function slug(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function sumarDias(iso, n){
  if(!iso) return '';
  const [y,m,d] = iso.split('-').map(Number);
  const dt = new Date(y, (m||1)-1, d||1);
  dt.setDate(dt.getDate() + n);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth()+1).padStart(2,'0');
  const dd = String(dt.getDate()).padStart(2,'0');
  return `${yy}-${mm}-${dd}`;
}
function toast(msg, opts={}){
  const region = $('#toastRegion'); if(!region) return;
  const {title='', kind='info', ms=3800} = opts;
  const div = document.createElement('div');
  const col = kind==='ok'?'var(--moss)':kind==='warn'?'var(--amber)':kind==='err'?'var(--terracotta)':'var(--accent)';
  const icono = kind==='ok'?'<i class="fa-solid fa-circle-check ic-meta" aria-hidden="true"></i>':kind==='warn'?'<i class="fa-solid fa-triangle-exclamation ic-meta" aria-hidden="true"></i>':kind==='err'?'<i class="fa-solid fa-circle-xmark ic-meta" aria-hidden="true"></i>':'<i class="fa-solid fa-circle-info ic-meta" aria-hidden="true"></i>';
  div.className = 'toast show';
  div.innerHTML = `<div class="t-ic" style="background:${col}">${icono}</div><div><div class="t-title">${escHTML(title||(kind==='ok'?'Listo':kind==='warn'?'Atención':kind==='err'?'Error':'Información'))}</div><div class="t-msg">${escHTML(msg)}</div></div><button class="t-close" aria-label="Cerrar notificación"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`;
  region.appendChild(div);
  div.querySelector('.t-close')?.addEventListener('click', ()=>{ div.classList.remove('show'); setTimeout(()=>div.remove(), 220); });
  setTimeout(()=>{ if(div.parentNode){ div.classList.remove('show'); setTimeout(()=>div.remove(),220); } }, ms);
}
function monogramFor(d){
  const texto = d?.codigo || d?.titulo || 'D';
  const parts = texto.replace(/[^\wáéíóúñÁÉÍÓÚÑ]/g,' ').trim().split(/\s+/).slice(0,2);
  return parts.map(p=>p[0]||'').join('').toUpperCase().slice(0,2) || 'D';
}
function colorForTipo(tipo){
  switch(tipo){
    case 'Reglamento': return '#2A4463';
    case 'Normativa': return '#2A4463';
    case 'Acuerdo': return '#3F6B4A';
    case 'Circular': return '#A77B1D';
    case 'Resolución': return '#5E4268';
    case 'Convenio': return '#566274';
    case 'Manual': return '#B95A3B';
    case 'Protocolo': return '#3F6B4A';
    case 'Directiva': return '#B95A3B';
    default: return '#566274';
  }
}
function textForConf(c){
  if(c==='muy_alta') return 'Muy alta';
  if(c==='alta') return 'Alta';
  if(c==='media') return 'Media';
  if(c==='baja') return 'Baja';
  return '—';
}
function textForSenal(s){
  if(s==='explícita') return 'Explícita';
  if(s==='léxica') return 'Léxica';
  if(s==='semántica') return 'Semántica';
  if(s==='híbrida') return 'Híbrida';
  return '—';
}
function scoreDoc(d, q, scope='todo'){
  if(!q) return 0;
  const qq = q.toLowerCase();
  const tokens = qq.split(/\s+/).filter(Boolean);
  let s = 0;
  const hit = (txt, mult=1)=>{
    if(!txt) return;
    const t = String(txt).toLowerCase();
    tokens.forEach(tok=>{ if(t.includes(tok)) s += mult; });
  };
  if(scope==='todo'){
    hit(d.titulo, 8); hit(d.codigo, 6); hit(d.resumen, 3); hit(d.unidad, 2); hit(d.tipo, 1);
    (d.articulos||[]).forEach(a=>hit(a, 0.8));
    s += (d.consultas||0)/5000;
  } else if(scope==='titulo'){
    hit(d.titulo, 10);
  } else if(scope==='cuerpo'){
    (d.articulos||[]).forEach(a=>hit(a, 2));
    hit(d.resumen, 1.2); hit(d.secciones?.join(' '), 1);
  } else if(scope==='unidad'){
    hit(d.unidad, 10);
  } else if(scope==='codigo'){
    hit(d.codigo, 20);
    // si es búsqueda exacta con guiones o similar, dar bonus
    if(d.codigo.toLowerCase().replace(/[^a-z0-9]/g,'')===qq.replace(/[^a-z0-9]/g,'')) s += 100;
  }
  return s;
}
/* =========================================================
   2b. Helpers STOPWORDS + highlightMulti V4
   ========================================================= */
const STOPWORDS_V3 = new Set(['de','la','las','el','los','y','o','u','e','ni','que','quien','quienes','cual','cuales','cuya','cuyo','en','a','al','del','con','sin','por','para','porque','pues','como','se','ha','han','he','hay','soy','eres','es','somos','sois','son','estar','está','están','estoy','nos','también','tampoco','pero','sino','aunque','desde','hasta','entre','durante','sobre','tras','via','no','si','sí','su','sus','un','una','unos','unas','más','menos','muy','cuando','donde','cómo','cuál','qué','quién','esto','este','esta','estos','estas','ese','esa','esos','esas','aquel','aquella','aquellos','aquellas','mí','ti','él','ella','nosotros','vosotros','ellos','le','lo','los','las','me','te','nos','os','tu','tus','mi','mis','nuestro','nuestra','vuestro','vuestra','suyo','suya','todo','toda','todos','todas','otro','otra','otros','otras','mismo','misma','ser','estar','tener','hacer','poder','decir','saber','querer','llegar','pasar','deber','poner','parecer','quedar','creer','hablar','llevar','dejar','seguir','encontrar','cómo']);

function tokenizeQueryV3(q){
  const qq = String(q||'').trim().toLowerCase();
  if(!qq) return [];
  const raw = qq.split(/[\s,;:_.()¿?¡!"'«»“”‘’\/\-–—]+/).filter(Boolean);
  const out = [];
  for(const tok of raw){
    if(tok.length < 2) continue;
    if(STOPWORDS_V3.has(tok)) continue;
    out.push(tok);
  }
  return Array.from(new Set(out));
}

/* ---------- highlightMulti V4: stopwords + 3 kinds ---------- */
function highlight(txt, q){
  if(!txt || !q) return escHTML(txt);
  const tokens = tokenizeQueryV3(q);
  if(!tokens.length) return escHTML(txt);
  return highlightMulti(txt, tokens, {showVariants:true, showSemantic:false});
}
function highlightMulti(txt, terms=[], opts={}){
  if(!txt) return '';
  const str = String(txt);
  const exact = (opts.exact || []).filter(Boolean).map(t=>String(t).toLowerCase());
  const variant = (opts.variant || []).filter(Boolean).map(t=>String(t).toLowerCase());
  const semantic = (opts.semantic || []).filter(Boolean).map(t=>String(t).toLowerCase());
  const base = (terms||[]).filter(Boolean).map(t=>String(t).toLowerCase());
  // Filter stopwords on explicit `terms` too
  const baseClean = new Set(base.filter(t => t.length>=2 && !STOPWORDS_V3.has(t)));
  const exactSet = new Set([...baseClean, ...exact.filter(t=>t.length>=2 && !STOPWORDS_V3.has(t))]);
  const variantSet = new Set(variant.filter(t=>t.length>=2 && !STOPWORDS_V3.has(t)));
  const semanticSet = new Set(semantic.filter(t=>t.length>=2 && !STOPWORDS_V3.has(t)));
  if(!exactSet.size && !variantSet.size && !semanticSet.size) return escHTML(str);
  // Build regex that preserves word order (not perfect but keeps sequence)
  const allTokens = [...exactSet, ...variantSet, ...semanticSet];
  const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const re = new RegExp('(' + allTokens.map(esc).join('|') + ')', 'ig');
  const safe = escHTML(str);
  return safe.replace(re, (m) => {
    const k = m.toLowerCase();
    if(exactSet.has(k)) return `<mark class="hl hl-exact" title="Coincidencia exacta">${m}</mark>`;
    if(variantSet.has(k)) return `<mark class="hl hl-variant" title="Variante léxica">${m}</mark>`;
    if(semanticSet.has(k)) return `<mark class="hl hl-semantic" title="Relacionado semánticamente">${m}</mark>`;
    return `<mark>${m}</mark>`;
  });
}
let _currentCompareCandId = null;

/* =========================================================
   3b. SEARCH DOCUMENTS ENGINE (V3) · C0-C5 + 3 ESCENARIOS
   ========================================================= */
const SCOPES_SEARCH_V3 = [
  {v:'todo', l:'Todo el archivo', i:'<i class="fa-solid fa-bullseye ic-meta" aria-hidden="true"></i>', d:'Busca en todos los campos'},
  {v:'titulo', l:'Título', i:'<i class="fa-solid fa-file-pen ic-meta" aria-hidden="true"></i>', d:'Solo en el título'},
  {v:'codigo', l:'Identificador', i:'<i class="fa-solid fa-id-card ic-meta" aria-hidden="true"></i>', d:'Códigos como RE-001-2024'},
  {v:'cuerpo', l:'Contenido', i:'<i class="fa-solid fa-file-lines ic-meta" aria-hidden="true"></i>', d:'Artículos y cuerpo completo'},
  {v:'unidad', l:'Unidad responsable', i:'<i class="fa-solid fa-building-columns ic-meta" aria-hidden="true"></i>', d:'Vicerrectoría, Facultad, Dirección'}
];
const RELACIONES_FILTRO = ['Cita','Modifica','Complementa','Reemplaza','Rectifica','Prorroga','Deja sin efecto'];
const TIPOS_VISTA_DOC = [
  {v:'rows', l:'Filas', d:'Vista detallada con fragmentos'},
  {v:'cards', l:'Tarjetas', d:'Vista compacta con imágenes'}
];
const ORDENES_V3 = [
  {v:'relevancia', l:'Relevancia', d:'Mejores coincidencias primero'},
  {v:'vigentes', l:'Vigentes primero', d:'Documentos vigentes antes que históricos'},
  {v:'fecha_desc', l:'Más recientes', d:'Por fecha emisión desc'},
  {v:'fecha_asc', l:'Más antiguos', d:'Por fecha emisión asc'},
  {v:'consultas', l:'Más consultados', d:'Por visualizaciones'},
  {v:'titulo', l:'Título A–Z', d:'Alfabético por título'}
];

const CLARIFICATIONS = {
  'renuncia': [
    {v:'retiro_academico', l:'Renuncia o retiro académico', q:'retiro definitivo estudiante pregrado desistimiento'},
    {v:'renuncia_beneficio', l:'Renuncia a un beneficio (beca, crédito)', q:'renuncia beneficio beca crédito'},
    {v:'renuncia_cargo', l:'Renuncia a un cargo o función', q:'renuncia cargo función director'},
    {v:'renuncia_proyecto', l:'Renuncia a un proyecto', q:'renuncia proyecto Fondecyt investigador'},
    {v:'termino_anticipado', l:'Término anticipado de actividad', q:'término anticipado convenio contrato'},
    {v:'todos', l:'Buscar en todos los contextos', q:''}
  ]
};
function findClarification(q){
  const qq = String(q||'').toLowerCase();
  if(/renunc/.test(qq) || /retiro acad/.test(qq) || /desistimient/.test(qq)) return CLARIFICATIONS.renuncia;
  return null;
}
const RELATED_TERMS = {
  'renuncia':['retiro','desistimiento','término anticipado','renuncia voluntaria','pérdida de calidad','desvinculación','abandono'],
  'retiro':['renuncia','desistimiento','perdida calidad estudiante','no reinscripción'],
  'beca':['financiamiento','beneficio estudiantil','crédito','Fondos Solidarios','ANID','Bicentenario','doctorado','arancel'],
  'postgrado':['magister','doctorado','posgrado','tesis','programa académico','investigación','anid'],
  'presupuesto':['finanzas','tesorería','ejecución gasto','glosa','reprogramación','delegación firma'],
  'admisión':['ingreso','PAES','cupos','Postulación 2024','ponderaciones','PACE','PSU']
};
/* ---------- MORFOLOGÍA SIMPLE (sufijos) para variantes léxicas ---------- */
function buildVariantTerms(terms){
  const sufijos = [
    {rx:/(ar|er|ir|or|uar|ear|iar)$/, strip:2, add:['ación','amiento','miento','dor','dora','nte','da','do','ido','ada','ndo','s','es','es']},
    {rx:/(ión|amiento|miento)$/, strip:3, add:['ar','er','ir','dor','dora','s','es']},
    {rx:/(idad|dad|tad|tud)$/, strip:3, add:['al','ivo','iva','ar','er','s','es']},
    {rx:/(ble)$/, strip:3, add:['bilidad','mente','s','es']}
  ];
  const out = new Set();
  for(const t of (terms||[])){
    const s = String(t||'').trim().toLowerCase();
    if(s.length<4) continue;
    if(STOPWORDS_V3.has(s)) continue;
    out.add(s);
    for(const rule of sufijos){
      if(rule.rx.test(s)){
        const stem = s.slice(0,-rule.strip);
        if(stem.length>=3){
          rule.add.forEach(suf => { if(suf !== s.slice(-suf.length)) out.add(stem + suf); });
        }
      }
    }
    // plurinomial simple (s / es)
    if(s.endsWith('s')) out.add(s.slice(0,-1));
    else if(s.endsWith('es')){ out.add(s.slice(0,-2)); out.add(s.slice(0,-2)+'e'); }
    else { out.add(s+'s'); out.add(s+'es'); }
    // tildes swaps
    const norm = s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if(norm !== s) out.add(norm);
  }
  // remove stopwords from variants
  const clean = [];
  for(const v of out) if(v.length>=3 && !STOPWORDS_V3.has(v)) clean.push(v);
  return clean;
}
function buildSemanticTerms(terms){
  const out = new Set();
  const qq = (terms||[]).join(' ').toLowerCase();
  Object.keys(RELATED_TERMS).forEach(k=>{
    if(qq.includes(k) || (terms||[]).some(t=>k.includes(t) || t.includes(k))) RELATED_TERMS[k].forEach(t=>out.add(t.toLowerCase()));
  });
  Object.keys(C3_SIM_V3 || {}).forEach(k=>{
    if(qq.includes(k) || (terms||[]).some(t=>k.includes(t) || t.includes(k))) (C3_SIM_V3[k]||'').split(/\s+/).filter(Boolean).forEach(t=>out.add(t.toLowerCase()));
  });
  const clean = [];
  for(const v of out) if(v.length>=3 && !STOPWORDS_V3.has(v)) clean.push(v);
  return clean;
}
function relatedTermsFor(q){
  const qq = (q||'').toLowerCase();
  const terms = new Set();
  Object.keys(RELATED_TERMS).forEach(k=>{ if(qq.includes(k)) RELATED_TERMS[k].forEach(t=>terms.add(t)); });
  return Array.from(terms);
}
function searchDocuments(query='', filters={}, sort='relevancia', config='C4'){
  const q = String(query||'').trim();
  const qLower = q.toLowerCase();
  const tokensOrig = qLower.split(/\s+/).filter(Boolean);
  // ===== STOPWORDS filtering =====
  const tokens = tokenizeQueryV3(q);
  const expanded = (state.search.expandedTerms||[]).filter(t=>t && !STOPWORDS_V3.has(String(t).toLowerCase())).map(t=>String(t).toLowerCase()).slice();
  const variants = buildVariantTerms([...tokens, ...expanded]);
  const semantic = buildSemanticTerms([...tokens, ...expanded]);
  const allTerms = Array.from(new Set([...tokens, ...expanded, ...variants, ...semantic])).filter(t=>t && t.length>=2);
  const tsStart = performance.now();
  const explicitPattern = /([A-Z]{1,4}[\-–_]?\d{2,4}[\-–_]?\d{2,4})/i;
  const hasExplicit = explicitPattern.test(q);
  const explicitMatch = q.match(explicitPattern);
  let scope = (config&&typeof config==='object'?config.scope:null) || state.search.scope || 'todo';

  // BM25-ish IDF sobre los tokens significativos (simulado simple)
  const IDF = {};
  const N = DOCUMENTOS.length;
  for(const tok of [...new Set([...tokens, ...expanded, ...variants])]){
    if(tok.length<2) continue;
    const re = new RegExp('\\b'+tok.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','i');
    let df = 0;
    for(const d of DOCUMENTOS){
      if(re.test(d.titulo+' '+d.resumen+' '+((d.secciones||[]).join(' '))+' '+((d.articulos||[]).join(' ')))) df++;
    }
    IDF[tok] = Math.max(0.2, Math.log((N - df + 0.5) / (df + 0.5) + 1));
  }
  const SEM = {};
  for(const tok of semantic){
    if(tok.length<2) continue;
    SEM[tok] = 0.42;
  }

  const C3_SIM_V3 = {
    'renuncia':'renunciar retiro desistimiento abandono termino anticipado perdida calidad desvincular',
    'retiro':'renuncia desistimiento terminar vacante',
    'desistimiento':'renuncia retiro abandonar',
    'término':'finalizar concluir renuncia anticipado',
    'desvinculación':'renuncia retiro fin contrato',
    'pérdida':'perder pérdida renuncia calidad',
    'financiamiento':'presupuesto beca crédito financiar',
    'beca':'beneficio financiamiento estudiantil ANID Bicentenario doctorado arancel',
    'postgrado':'posgrado magister doctorado tesis programa investigación anid',
    'doctorado':'posgrado postgrado ANID Fondecyt investigación',
    'presupuesto':'finanzas tesorería glosa gasto ejecutar',
    'admisión':'ingreso postulación PAES PSU PACE cupos'
  };

  const scored = DOCUMENTOS.map(d=>{
    let lexicalScore = 0;
    let semanticScore = 0;
    let deterministicSignal = 0;
    const matchedFields = [];
    const matchReasons = [];
    const highlightFragments = [];
    let relationStatus = null;
    const fragmentsMeta = [];

    // C0 determinístico: ID explícito / citas
    if(hasExplicit && explicitMatch){
      const codNorm = explicitMatch[0].replace(/[\-–_]/g,'').toLowerCase();
      const dCod = (d.codigo||'').replace(/[\-–_]/g,'').toLowerCase();
      if(dCod===codNorm){ deterministicSignal += 1000; matchedFields.push('Identificador (coincidencia exacta)'); matchReasons.push({kind:'exacta_id', texto:`Coincidencia directa por identificador ${d.codigo}`}); }
      else if(dCod.includes(codNorm)){ deterministicSignal += 200; matchedFields.push('Identificador'); matchReasons.push({kind:'partial_id', texto:`Contiene el identificador ${explicitMatch[0]}`}); }
      else if(d.afectaciones && d.afectaciones.some(a=>(a.codigo||'').replace(/[\-–_]/g,'').toLowerCase()===codNorm)){ deterministicSignal += 120; matchedFields.push('Afectaciones'); matchReasons.push({kind:'cita', texto:`Referencia explícita a ${explicitMatch[0]}`}); }
    }
    const hitT = (text, mult, fieldName, report)=>{
      if(!text) return {found:false, weight:0, termKind:null};
      const t = String(text).toLowerCase();
      let w = 0; let hit = false; let kind = null;
      // Exact
      for(const tok of tokens){
        if(tok.length<2) continue;
        if(t.includes(tok)){ w += mult * (IDF[tok] || 1.2) * 2.2; hit = true; kind = 'exact'; matchReasons.push({kind:'exacta', texto:`Coincidencia exacta "${tok}" en ${fieldName}`}); break;}
      }
      if(!hit){
        for(const tok of [...expanded, ...variants]){
          if(tok.length<2) continue;
          if(t.includes(tok)){ w += mult * (IDF[tok] || 1.0) * 1.4; hit = true; kind = 'variant'; matchReasons.push({kind:'variante', texto:`Variante léxica relacionada con la consulta en ${fieldName}`}); break;}
        }
      }
      if(!hit){
        for(const tok of semantic){
          if(tok.length<2) continue;
          if(t.includes(tok)){ w += mult * (SEM[tok] || 0.5); hit = true; kind = 'semantic'; matchReasons.push({kind:'semantico', texto:`Concepto relacionado en ${fieldName}`}); break;}
        }
      }
      if(hit && fieldName && !matchedFields.includes(fieldName)) matchedFields.push(fieldName);
      return {found:hit, weight:w, kind};
    };
    let r;
    if(scope==='todo' || scope==='titulo'){ r = hitT(d.titulo, 16, 'Título'); if(r.found) lexicalScore += r.weight;}
    if(scope==='todo' || scope==='codigo'){ r = hitT(d.codigo, 13, 'Identificador'); if(r.found) lexicalScore += r.weight;}
    if(scope==='todo' || scope==='unidad'){ r = hitT(d.unidad, 6, 'Unidad responsable'); if(r.found) lexicalScore += r.weight;}
    r = hitT(d.tipo, 3.2, 'Tipo documental'); if(r.found) lexicalScore += r.weight;
    if(scope==='todo' || scope==='cuerpo'){
      r = hitT(d.resumen, 7, 'Resumen'); if(r.found) { lexicalScore += r.weight; matchReasons.push({kind:'resumen', texto:'Coincidencia en resumen / metadatos'}); }
      (d.secciones||[]).forEach(s=>{ r = hitT(s, 2.4, 'Secciones'); if(r.found) lexicalScore += r.weight;});
      (d.articulos||[]).forEach((a,idx)=>{
        r = hitT(a, 3.8, 'Contenido');
        if(r.found){
          lexicalScore += r.weight;
          const artRef = `Artículo ${idx+1}`;
          const texto = a.length>210 ? (a.slice(0,210)+'…') : a;
          if(highlightFragments.length<3){
            highlightFragments.push({art:artRef, texto, field:'Contenido', kind:r.kind});
          }
          matchReasons.push({kind:'contenido', texto:`Coincidencia en ${artRef}${r.kind==='semantic'?' · concepto relacionado':r.kind==='variant'?' · variante léxica':''}`});
        }
      });
    }

    // C3 semántico conceptual (sinónimos)
    const c3Hits = new Set();
    Object.keys(C3_SIM_V3).forEach(k=>{
      if(!tokens.some(tok=>k.includes(tok) || tok.includes(k))) return;
      const simbols = C3_SIM_V3[k].split(/\s+/);
      ['titulo','resumen'].forEach(campo=>{
        const txt = String(d[campo]||'').toLowerCase();
        simbols.forEach(sim=>{
          if(sim.length<3) return;
          if(txt.includes(sim)){
            semanticScore += 2.4;
            c3Hits.add(`${campo}:${sim}`);
            if(!matchReasons.some(m=>m.texto && m.texto.includes(sim))) matchReasons.push({kind:'semantico', texto:`Trata conceptos relacionados con "${sim}"`});
          }
        });
      });
      (d.articulos||[]).forEach(a=>{
        const txt = String(a||'').toLowerCase();
        simbols.forEach(sim=>{ if(sim.length>=3 && txt.includes(sim)){ semanticScore += 0.9; c3Hits.add(`contenido:${sim}`);}});
      });
    });
    if(semanticScore>0 && !matchedFields.includes('Conceptos relacionados')) matchedFields.push('Conceptos relacionados');

    // Si NO hay match real, NO inventar fragmentos (punto 238-240 prompt)
    const hayMatchReal = (tokens.length>0 || expanded.length>0) && (lexicalScore + semanticScore + deterministicSignal) > 0.5;
    if(!hayMatchReal){
      // Vaciar highlightFragments (nunca inventar evidencia)
      highlightFragments.length = 0;
      // Dejar marcador "sin evidencia"
      matchReasons.length = 0;
      matchReasons.push({kind:'sin_evidencia', texto:'No se encontró un fragmento textual directo. El documento fue recuperado por similitud conceptual.'});
    }
    if(!hayMatchReal && (tokens.length>0 || expanded.length>0 || hasExplicit)){
      // Si hay consulta significativa, penalizar documentos sin match real (evitar 14 estáticos garbage)
      deterministicSignal = 0;
      lexicalScore = Math.max(0, lexicalScore - 120);
    }

    // ESCENARIO 1 "cómo renunciar"
    const escenario1 = /renunc|retiro acad|desistim|termino anticip|perdida cal|desvincul/i.test(qLower);
    if(escenario1){
      const semanticaRenuncia = /retiro|desist|abandono|termino|desvinc|perdida cal|perdida de calid|no reins|vacante estudi|resolucion 4|convalid|cambio carrer|ingreso especial|postulacion/i;
      ['titulo','resumen'].forEach(c=>{ if(semanticaRenuncia.test(String(d[c]||'').toLowerCase())) semanticScore += 18; });
      (d.articulos||[]).forEach(a=>{ if(semanticaRenuncia.test(String(a||'').toLowerCase())) semanticScore += 9; });
      const dCod = d.codigo||'';
      if(/RE-|DI-|MA-|AC-/.test(dCod) && (d.estado==='Vigente')) semanticScore += 5;
      if(/navidad|fiesta|feriado|cierre admin/.test(String(d.titulo).toLowerCase())){ lexicalScore = Math.max(0, lexicalScore-260); deterministicSignal = 0; semanticScore = Math.max(0, semanticScore-80); }
    }

    // ESCENARIO 2 "reglamento becas postgrado"
    const escenario2 = /beca.*postgrado|postgrado.*beca|reglamento.*postgrado|financ.*doctorad|magister.*beca|anid.*postg/i.test(qLower);
    if(escenario2){
      let peso = 0;
      if(/Reglamento|Normativa/.test(d.tipo)) peso += 20;
      if(/Vicerrectoría (Académica|Investigación)|Postgrado|Investigación|Doctorado|ANID/i.test(d.unidad)) peso += 15;
      if(/doctorado|magister|posgrado|postgrado|b[eé]c|financiam|anid|fondecyt|bicentenari|cr[eé]dit/i.test(String(d.titulo+d.resumen).toLowerCase())) peso += 22;
      (d.articulos||[]).forEach(a=>{ if(/arancel|b[eé]ca|financiam|cuota|doctorado|magister|tesis|avance|programa/.test(String(a).toLowerCase())) peso += 5; });
      lexicalScore += peso;
      if(/navidad|feriado|cambio clim|género|inclusi|convalid/i.test(String(d.titulo).toLowerCase()) && peso<=6){ lexicalScore = Math.max(0, lexicalScore-180); deterministicSignal = 0; }
    }

    // ESCENARIO 3 "RE-001-2024"
    if(hasExplicit && explicitMatch){
      const cod = explicitMatch[0].replace(/[\-–_]/g,'').toLowerCase();
      d.afectaciones && d.afectaciones.forEach(af=>{
        if((af.codigo||'').replace(/[\-–_]/g,'').toLowerCase()===cod){
          deterministicSignal += 260;
          relationStatus = af.relacion || 'Documento relacionado';
          matchReasons.push({kind:'relacion', texto:`Este documento ${(af.relacion||'se relaciona con').toLowerCase()} ${explicitMatch[0]}`});
        }
      });
    }

    // Boost vigencia + consultas
    if(sort==='vigentes' && d.estado==='Vigente') lexicalScore += 32;
    if(d.estado==='Histórico') lexicalScore -= 4;
    const consultasBoost = Math.log10((d.consultas||10)+1);
    const rerankScore = (lexicalScore*0.6) + (deterministicSignal*1.4) + (semanticScore*1.3) + consultasBoost;
    lexicalScore += (d.consultas||0)/40000;
    const total = {
      C0: deterministicSignal,
      C1: lexicalScore,
      C2: lexicalScore*1.08,
      C3: semanticScore,
      C4: deterministicSignal*1.3 + lexicalScore*0.6 + semanticScore*1.25,
      C5: (deterministicSignal*1.3 + lexicalScore*0.6 + semanticScore*1.25) * (1+consultasBoost/10)
    };
    let scoreFinal = total[config] || total.C4;
    if(!matchedFields.length && !c3Hits.size && !hasExplicit && tokens.length>0) scoreFinal *= 0.35;
    if(!hayMatchReal && tokens.length>0 && !hasExplicit) scoreFinal *= 0.12;

    return {
      doc: d,
      scores: total,
      lexicalScore: Math.round(lexicalScore*10)/10,
      semanticScore: Math.round(semanticScore*10)/10,
      deterministicSignal: Math.round(deterministicSignal*10)/10,
      rerankScore: Math.round(rerankScore*10)/10,
      scoreFinal: Math.round(scoreFinal*100)/100,
      matchedFields,
      matchReasons: Array.from(new Set(matchReasons.map(x=>JSON.stringify({kind:x.kind, texto:x.texto})))).map(x=>JSON.parse(x)).slice(0,5),
      highlightFragments: highlightFragments.slice(0,3),
      relationStatus,
      configs: total,
      _terms: { exact: tokens, variant: variants, semantic },
      hayMatchReal
    };
  });

  let list = scored.filter(x=>{
    // Si hay consulta: eliminar documentos sin score mínimo (evita 14 estáticos)
    if(tokens.length>0 || expanded.length>0 || hasExplicit || Object.keys(filters||{}).length>0){
      return x.scoreFinal > 0.08;
    }
    return true; // No hay consulta → dejar para empty state inicial (no se muestra)
  });
  Object.keys(filters||{}).forEach(k=>{
    const vs = Array.isArray(filters[k])?filters[k]:filters[k]?[filters[k]]:[];
    if(!vs.length) return;
    list = list.filter(x=>{
      const d = x.doc;
      if(k==='tipo') return vs.includes(d.tipo);
      if(k==='unidad') return vs.includes(d.unidad);
      if(k==='anio') return vs.includes(String(d.anio));
      if(k==='estado') return vs.includes(d.estado);
      if(k==='disponibilidad') return vs.includes(d.disponibilidad);
      if(k==='coleccion'){ const c = COLECCIONES.find(c=>c.id===filters[k]); return c?c.docs.includes(d.id):true; }
      if(k==='materia') return vs.some(v=>String(d.titulo+' '+d.resumen).toLowerCase().includes(String(v).toLowerCase()));
      if(k==='versiones') return vs.includes('Sí') ? (d.versiones && d.versiones.length>1) : true;
      if(k==='relaciones'){
        const tiene = d.afectaciones && d.afectaciones.length>0;
        return vs.includes('Con relaciones')?tiene:!tiene;
      }
      if(k==='tipoRelacion'){ return (d.afectaciones||[]).some(a=>vs.includes(a.relacion)); }
      return true;
    });
  });

  list.sort((a,b)=>b.scoreFinal - a.scoreFinal || (b.doc.consultas||0)-(a.doc.consultas||0));
  if(sort==='fecha_desc') list.sort((a,b)=>b.doc.fecha.localeCompare(a.doc.fecha));
  else if(sort==='fecha_asc') list.sort((a,b)=>a.doc.fecha.localeCompare(b.doc.fecha));
  else if(sort==='titulo') list.sort((a,b)=>a.doc.titulo.localeCompare(b.doc.titulo));
  else if(sort==='consultas') list.sort((a,b)=>(b.doc.consultas||0)-(a.doc.consultas||0));
  else if(sort==='vigentes') list.sort((a,b)=>((a.doc.estado==='Vigente')===((b.doc.estado==='Vigente'))?0:a.doc.estado==='Vigente'?-1:1));

  const latencyMs = Math.round((performance.now()-tsStart) + 28 + Math.random()*75);
  const termsRelated = relatedTermsFor(q);
  const clarification = findClarification(q);
  const suggestedClarifications = state.search._clarification ? null : clarification;
  const suggestedSpelling = null;
  if(q && !state.search.history.includes(q)){ state.search.history.unshift(q); state.search.history = state.search.history.slice(0,8); saveState(); }

  // Guardar lastResultIds para navegación Anterior/Siguiente en preview drawer
  state.search.lastResultIds = list.map(x=>x.doc.id);

  return {
    results: list,
    count: list.length,
    latencyMs,
    config,
    query: q,
    matchedFieldsGlobal: Array.from(new Set(list.flatMap(x=>x.matchedFields))),
    relatedTerms: termsRelated,
    suggestedClarifications,
    suggestedSpelling,
    tokens,
    allTerms
  };
}
const C3_SIM_V3 = {
  'renuncia':'renunciar retiro desistimiento abandono termino anticipado perdida calidad desvincular',
  'retiro':'renuncia desistimiento terminar vacante',
  'desistimiento':'renuncia retiro abandonar',
  'término':'finalizar concluir renuncia anticipado',
  'desvinculación':'renuncia retiro fin contrato',
  'pérdida':'perder pérdida renuncia calidad',
  'financiamiento':'presupuesto beca crédito financiar',
  'beca':'beneficio financiamiento estudiantil ANID Bicentenario doctorado arancel',
  'postgrado':'posgrado magister doctorado tesis programa investigación anid',
  'doctorado':'posgrado postgrado ANID Fondecyt investigación',
  'presupuesto':'finanzas tesorería glosa gasto ejecutar',
  'admisión':'ingreso postulación PAES PSU PACE cupos'
};

/* =========================================================
   4. ROUTER (hash-based SPA)
   ========================================================= */
function parseHash(){
  const raw = location.hash.replace(/^#/,'') || '/home';
  const [path, qs=''] = raw.split('?');
  const segs = path.split('/').filter(Boolean);
  const query = {};
  new URLSearchParams(qs).forEach((v,k)=>query[k]=v);
  let name='home', params={};
  if(segs[0]==='home' || segs.length===0) name='home';
  else if(segs[0]==='search'){ name='search'; }
  else if(segs[0]==='detail' && segs[1]){ name='detail'; params={id:segs[1]}; }
  else if(segs[0]==='admin'){ name='admin'; }
  else if(segs[0]==='review'){ name='review'; }
  else if(segs[0]==='explore'){ name='explore'; }
  else if(segs[0]==='guide'){ name='guide'; }
  else if(segs[0]==='about'){ name='about'; }
  else { name=segs[0]; }
  return {name, params, query, rawPath: '/' + path};
}
function navigateTo(hash){ if(location.hash===hash){ handleRoute(); } else{ location.hash = hash; } }
function applySearchQueryParams(query){
  if(!query) return;
  if(query.evaluation==='1' || query.evaluation==='true'){ state.search.evaluationMode = true; }
  if(query.q){ state.search.query = query.q; }
  if(query.sort && ORDENES_V3.some(o=>o.v===query.sort)){ state.search.sort = query.sort; }
  if(query.view && TIPOS_VISTA_DOC.some(t=>t.v===query.view)){ state.search.view = query.view; }
  if(query.page){ const p=parseInt(query.page,10); if(p>=1) state.search.page=p; }
  if(query.scope && SCOPES_SEARCH_V3.some(s=>s.v===query.scope)){ state.search.scope = query.scope; }
  if(query.config && /^C[0-5]$/.test(query.config)){ state.search._evalConfig = query.config; }
  saveState();
}
function searchToURL(){
  const p = new URLSearchParams();
  if(state.search.query) p.set('q', state.search.query);
  if(state.search.sort && state.search.sort!=='relevancia') p.set('sort', state.search.sort);
  if(state.search.view && state.search.view!=='rows') p.set('view', state.search.view);
  if(state.search.page && state.search.page>1) p.set('page', String(state.search.page));
  if(state.search.scope && state.search.scope!=='todo') p.set('scope', state.search.scope);
  if(state.search.evaluationMode) p.set('evaluation','1');
  if(state.search._evalConfig) p.set('config', state.search._evalConfig);
  const s = p.toString();
  return s ? `#/search?${s}` : '#/search';
}

/* ---------- Helpers V3: closeSuggestions, doSearchGlobal, openCompareMulti, openDrawer fix ---------- */
function closeSuggestions(){
  try{ const el = $('#s3Suggest'); if(el){ el.hidden = true; } }catch(e){}
}
function doSearchGlobal(newQ){
  const q = (typeof newQ==='string' ? newQ : (document.getElementById('s3Input')?.value || '')).trim();
  if(q && q!==state.search.query && !state.search.trail.some(t=>t.tipo==='consulta' && t.q===q)){
    state.search.trail.push({tipo:'consulta',label:q,ts:Date.now(),q});
  }
  state.search.query = q;
  state.search.page = 1;
  saveState();
  const url = searchToURL();
  if(location.hash!==url) location.hash = url; else handleRoute();
  try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(e){}
}
function renderS3Suggestions(q){
  const box = $('#s3Suggest'); if(!box) return;
  const qq = String(q||'').trim().toLowerCase();
  if(!qq){ closeSuggestions(); return; }
  const cats = [
    {
      titulo:'Consultas sugeridas',
      ic:'<i class="fa-solid fa-lightbulb ic-meta" aria-hidden="true"></i>',
      items: CONSULTAS_SUGERIDAS.filter(cs=>cs.q.toLowerCase().includes(qq)).slice(0,4).map(c=>({label:c.q, kind:'consulta', act:()=>doSearchGlobal(c.q)}))
    },
    {
      titulo:'Títulos de documentos',
      ic:'<i class="fa-solid fa-file-pen ic-meta" aria-hidden="true"></i>',
      items: DOCUMENTOS.filter(d=>d.titulo.toLowerCase().includes(qq)).slice(0,4).map(d=>({label:d.titulo, meta:d.codigo, kind:'titulo', act:()=>doSearchGlobal(d.titulo)}))
    },
    {
      titulo:'Identificadores',
      ic:'<i class="fa-solid fa-id-card ic-meta" aria-hidden="true"></i>',
      items: DOCUMENTOS.filter(d=>d.codigo.toLowerCase().includes(qq)).slice(0,4).map(d=>({label:d.codigo, meta:d.tipo, kind:'id', act:()=>doSearchGlobal(d.codigo)}))
    },
    {
      titulo:'Unidades responsables',
      ic:'<i class="fa-solid fa-building-columns ic-meta" aria-hidden="true"></i>',
      items: UNIDADES.filter(u=>u.toLowerCase().includes(qq)).slice(0,4).map(u=>({label:u, kind:'unidad', act:()=>{ state.search.filters.unidad=[u]; saveState(); doSearchGlobal(state.search.query||u); }}))
    },
    {
      titulo:'Colecciones / Materias',
      ic:'<i class="fa-solid fa-book ic-meta" aria-hidden="true"></i>',
      items: COLECCIONES.filter(c=>c.nombre.toLowerCase().includes(qq)).slice(0,4).map(c=>({label:c.nombre, meta:`${c.count} docs`, kind:'coleccion', act:()=>{ state.search.filters.coleccion=c.id; saveState(); doSearchGlobal(state.search.query||c.nombre); }}))
    },
    {
      titulo:'Recientes',
      ic:'<i class="fa-solid fa-clock-rotate-left ic-meta" aria-hidden="true"></i>',
      items: (state.search.history||[]).filter(h=>h.toLowerCase().includes(qq)).slice(0,4).map(h=>({label:h, kind:'recientes', act:()=>doSearchGlobal(h)}))
    }
  ].filter(c=>c.items.length>0);
  if(!cats.length){ closeSuggestions(); return; }
  window.__s3CachedCats = cats;
  box.innerHTML = cats.map(c=>`
    <div class="sbs-cat">
      <div class="sbs-cat-head"><span class="sbs-cat-ic">${c.ic}</span><span class="sbs-cat-tl">${c.titulo}</span></div>
      <ul class="sbs-list">
        ${c.items.map((it,ii)=>`<li class="sbs-item" role="option" tabindex="-1">
          <button type="button" class="sbs-btn" data-sbscat="${c.titulo}" data-sbsii="${ii}">
            <span class="sbs-lbl">${highlight(it.label, qq||'')}</span>
            ${it.meta?`<span class="sbs-meta cm">${escHTML(it.meta)}</span>`:''}
          </button>
        </li>`).join('')}
      </ul>
    </div>
  `).join('');
  box.hidden = false;
  box.querySelectorAll('.sbs-btn').forEach(b=>{
    b.addEventListener('click', ()=>{
      const cat = (window.__s3CachedCats||[]).find(c=>c.titulo===b.dataset.sbscat);
      const it = cat?.items[parseInt(b.dataset.sbsii,10)];
      if(it){ closeSuggestions(); it.act(); }
    });
  });
}

function openCompareMulti(ids=[]){
  if(!ids.length){ toast('No hay documentos seleccionados.',{kind:'warn',title:'Comparar'}); return; }
  if(ids.length<2){ toast('Seleccione al menos 2 documentos.',{kind:'warn',title:'Comparar'}); return; }
  const docs = ids.map(id=>DOCUMENTOS.find(d=>d.id===id)).filter(Boolean).slice(0,3);
  if(docs.length<2){ toast('Documentos no encontrados.',{kind:'err',title:'Comparar'}); return; }
  const cols = ['Título','Tipo','Unidad','Fecha','Vigencia','Materias','Versiones','Relaciones','Fragmento'];
  const cellVal = (d,k) => {
    switch(k){
      case 'Título': return `<a href="#/detail/${d.id}" class="strong">${escHTML(d.titulo)}</a>`;
      case 'Tipo': return `<span class="type-pill sm" style="background:${colorForTipo(d.tipo)}15;color:${colorForTipo(d.tipo)}">${escHTML(d.tipo)}</span>`;
      case 'Unidad': return escHTML(d.unidad);
      case 'Fecha': return `${fmtDate(d.fecha)} · Año ${d.anio}`;
      case 'Vigencia': return `<span class="status sm ${slug(d.estado)}">${d.estado}</span>`;
      case 'Materias': return (d.secciones||[]).slice(0,3).map(s=>`<span class="dot-tag2">${escHTML(s)}</span>`).join(' ') || '—';
      case 'Versiones': return d.versiones && d.versiones.length>1 ? `${d.versiones.length} versiones (v${d.versiones[d.versiones.length-1].v})` : 'Sin versiones';
      case 'Relaciones': return (d.afectaciones||[]).length ? `${d.afectaciones.length} relaciones` : 'Sin relaciones';
      case 'Fragmento': return `<span class="cm">${escHTML((d.resumen||'').slice(0,120))}${d.resumen&&d.resumen.length>120?'…':''}</span>`;
      default: return '';
    }
  };
  const modal = $('#compareModal'); if(!modal){ toast('Modal no disponible.',{kind:'warn'}); return; }
  $('#compareTitle').textContent = `Comparación múltiple · ${docs.length} documentos`;
  $('#compareGrid').innerHTML = `
    <div class="cmp-wrap">
      <table class="cmp-table v3">
        <thead>
          <tr>
            <th class="cmp-rowh cm">Campo</th>
            ${docs.map(d=>`<th><span class="mono cmp-cod">${escHTML(d.codigo)}</span></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${cols.map(k=>`<tr>
            <th class="cmp-rowh">${escHTML(k)}</th>
            ${docs.map(d=>`<td>${cellVal(d,k)}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(()=> modal.querySelector('[data-close-modal]')?.focus({preventScroll:true}), 30);
  toast(`Comparando ${docs.length} documentos.`,{kind:'info',title:'Comparación'});
}
function handleRoute(){
  const route = parseHash();
  
  if (state.currentRoute && state.currentRoute.name !== 'detail') {
    state.lastListRoute = state.currentRoute;
  }
  
  state.currentRoute = route;
  if(route.name==='search'){
    const prevQ = state.search.query;
    applySearchQueryParams(route.query);
    if(route.query.q && route.query.q !== prevQ){
      if(!state.search.trail.some(t=>t.tipo==='consulta' && t.q===route.query.q)){
        state.search.trail.push({tipo:'consulta',label:route.query.q,ts:Date.now(),q:route.query.q});
      }
    }
  }
  saveState();
  closeSuggestions();
  renderActiveNav(route.name);
  renderCurrentView(route);
  
  // Close mobile nav on route change
  if (window.innerWidth <= 820) {
    const nav = document.getElementById('siteNav');
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      const btn = document.getElementById('menuToggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (typeof toggleRail === 'function') toggleRail(true);
      state.ui.navOpen = false;
      saveState();
    }
  }
  
  try{ document.getElementById('main')?.focus({preventScroll:true}); }catch(e){}
  actualizarBadgePendientes();
}
function renderActiveNav(name){
  document.querySelectorAll('[data-route]').forEach(el=>{
    const r = el.dataset.route;
    let match = false;
    if(name==='home' && r==='home') match=true;
    if(name==='search' && r==='home') match=true; // Search keeps Home active in nav since Search is removed
    if(name==='detail' && r==='home') match=true; // Detail keeps Home active
    if(name==='explore' && r==='explore') match=true;
    if(name==='guide' && r==='guide') match=true;
    if(name==='about' && r==='about') match=true;
    if(name==='admin' && r==='admin') match=true;
    if(name==='review' && r==='review') match=true;
    
    el.classList.toggle('active', match);
    if(el.tagName==='A'){
      if(match){ el.setAttribute('aria-current','page'); }
      else { el.removeAttribute('aria-current'); }
    }
  });
}
function actualizarBadgePendientes(){
  const total = CANDIDATOS.length;
  const decididos = Object.keys(state.review.decisions).filter(k=>{
    const d = state.review.decisions[k];
    return d && (d.decision==='aceptar' || d.decision==='rechazar' || d.decision==='corregir');
  }).length;
  const pend = total - decididos;
  const b = $('#pendingBadge'); if(b){ b.textContent = pend; b.hidden = pend<=0; }
}

/* =========================================================
   5. RENDER MAESTRO
   ========================================================= */
function renderCurrentView(route=state.currentRoute){
  const main = $('#app-view');
  if(!main) return;
  // Al entrar en detail desde search, guardar scroll Y para restaurar
  if(route.name==='search'){
    setTimeout(()=>{
      if(state.search.routeSearchScrollY>0){
        try{ window.scrollTo(0, state.search.routeSearchScrollY); }catch(e){}
      }
    }, 40);
  }
  let html = '';
  switch(route.name){
    case 'home': html = renderHome(); break;
    case 'search':
      saveState();
      html = renderSearch(); break;
    case 'detail':
      state.search.routeSearchScrollY = window.scrollY || 0;
      if(state.search.query){ state.search.openDocs.push(route.params.id); state.search.openDocs = state.search.openDocs.slice(-6); }
      saveState();
      html = renderDetail(route.params.id); break;
    case 'admin': html = renderAdmin(); break;
    case 'review': html = renderReview(); break;
    case 'explore': html = renderExplore(); break;
    case 'guide': html = renderGuide(); break;
    case 'about': html = renderAbout(); break;
    default: html = renderHome();
  }
  main.innerHTML = html;
  // hooks
  switch(route.name){
    case 'home': hookHome(); break;
    case 'search': hookSearch(); break;
    case 'detail': hookDetail(route.params.id); break;
    case 'admin': hookAdmin(); break;
    case 'review': hookReview(); break;
    case 'explore': bindExplore(); break;
    case 'guide': break;
    case 'about': break;
  }
  if(state._pendingFocusSearch){
    state._pendingFocusSearch = false;
    saveState();
    let input = $('#homeSearch');
    if(!input) input = $('#s3Input');
    if(input){ setTimeout(()=>{ input.focus(); input.select(); }, 60); }
  }
  const routeLabels = {
    'home': 'INICIO',
    'search': 'RESULTADOS',
    'detail': 'DOCUMENTO',
    'explore': 'EXPLORAR',
    'guide': 'GUÍA',
    'about': 'ACERCA'
  };
  const pt = document.getElementById('pageTab');
  if(pt) pt.textContent = routeLabels[route.name] || '';

  renderRailTimeline();
  actualizarBadgePendientes();
}

/* =========================================================
   6. RAIL LATERAL · timeline cambios
   ========================================================= */
function renderRailTimeline(){
  const host = $('#railTimeline');
  if(!host) return;
  host.innerHTML = `<h4>Cambios recientes</h4><ul class="rail-timeline">` +
    CAMBIOS_RECIENTES.map(c=>{
      const dn = DOCUMENTOS.find(d=>d.id===c.desde); const dh = DOCUMENTOS.find(d=>d.id===c.hacia);
      return `<li>
        <span class="rt-rel" title="${escHTML(c.relacion)}">${escHTML(c.relacion.slice(0,4))}</span>
        <div>
          <a href="#/detail/${c.hacia}" class="rt-link" data-goto="${c.hacia}">${escHTML(dh?.codigo||c.hacia)}</a>
          <div class="rt-cm">${escHTML(c.detalle.slice(0,58))}${c.detalle.length>58?'…':''}</div>
          <div class="rt-cm2">${escHTML(c.por)} · ${fmtHace(c.fecha)}</div>
        </div>
      </li>`;
    }).join('') + `</ul>`;
  host.querySelectorAll('[data-goto]').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      navigateTo('#/detail/'+a.dataset.goto);
    });
  });
}

/* =========================================================
   7. VISTA A · INICIO / EXPLORACIÓN
   ========================================================= */
function renderHome(){
  const featured = [DOCUMENTOS[0], DOCUMENTOS[1], DOCUMENTOS[2], DOCUMENTOS[3]];
  const unidades = [...new Set(UNIDADES.map(u=>u))];
  const masConsultados = DOCUMENTOS.slice().sort((a,b)=>(b.consultas||0)-(a.consultas||0)).slice(0,10);
  const incorporados = DOCUMENTOS.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,8);
  const relacionBusFrec = [DOCUMENTOS[0], DOCUMENTOS[1], DOCUMENTOS[3], DOCUMENTOS[5], DOCUMENTOS[7], DOCUMENTOS[9]];
  const colsPorMateria = COLECCIONES.slice(0,8);
  const cambiosR = CAMBIOS_RECIENTES.slice(0,6);
  const totalDocs = DOCUMENTOS.length;
  const totalUnidades = UNIDADES.length;
  const vigentesCount = DOCUMENTOS.filter(d => (d.estado || '').toLowerCase() === 'vigente').length;
  const yearMin = Math.min(...DOCUMENTOS.map(d => parseInt((d.fecha||'').slice(0,4)) || 9999));
  const yearMax = Math.max(...DOCUMENTOS.map(d => parseInt((d.fecha||'').slice(0,4)) || 0));
  const advOpen = !!state.search.advancedOpen;
  const chipsSel = state.search.selectedChips || [];

  // Determinar estado inicial de panel de filtros rápidos:
  //   - quickFiltersOpen = null  → nunca interactuado: usar heurística (filtros/chips → abierto, sin filtros → cerrado)
  //   - quickFiltersOpen = true/false  → preferencia explícita del usuario (guardada en sesión): respetarla
  const filtrosActivos = state.search.filters && Object.keys(state.search.filters).some(k => state.search.filters[k] && (Array.isArray(state.search.filters[k]) ? state.search.filters[k].length : true));
  const chipsActivos = chipsSel.length > 0;
  const qfOpen = (state.search.quickFiltersOpen !== null)
    ? !!state.search.quickFiltersOpen
    : (filtrosActivos || chipsActivos);

  // build scope options
  const scopeActual = state.search.scope || 'todo';
  const scopeAct = SCOPES_BUSQUEDA.find(s=>s.v===scopeActual) || SCOPES_BUSQUEDA[0];

  const buildShelf = (id, titulo, subtitulo, itemsHtml, verLink) => `
    <section class="shelf sec" aria-labelledby="shelf-${id}-t">
      <div class="sec-head">
        <div>
          <h2 id="shelf-${id}-t" class="sec-title shelf-title">${titulo}</h2>
          ${subtitulo ? `<p class="sec-sub">${subtitulo}</p>`:''}
        </div>
        <div class="shelf-tools">
          ${verLink?`<a class="sec-link" href="${verLink.href}">${verLink.label} <i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i></a>`:''}
          <div class="shelf-nav" aria-label="Desplazarse por ${titulo}">
            <button class="shelf-btn shelf-prev" aria-label="Anteriores" data-shelf="${id}"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
            <button class="shelf-btn shelf-next" aria-label="Siguientes" data-shelf="${id}"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
          </div>
        </div>
      </div>
      <div class="shelf-track" id="shelf-${id}" tabindex="0" aria-label="Carrusel: ${titulo}. Use flechas izq/der o botones laterales.">
        ${itemsHtml}
      </div>
    </section>`;

  // Compact document surrogate (para estantes horizontales)
  const compactDocCard = (d)=>{
    const col = colorForTipo(d.tipo);
    return `<article class="doc-card-compact" style="--rib:${col}" data-goto="${d.id}" tabindex="0" aria-label="${escHTML(d.codigo)} · ${escHTML(d.titulo)}">
      <div class="dcc-body">
        <div class="dcc-head">
          <span class="dcc-type" style="background:${col}15;color:${col}">${escHTML(d.tipo)}</span>
          <span class="cm dcc-yr">${d.anio}</span>
        </div>
        <div class="dcc-title">${escHTML(d.titulo.length>90?d.titulo.slice(0,90)+'…':d.titulo)}</div>
        <div class="dcc-foot">
          <span class="cm dcc-unit" title="${escHTML(d.unidad)}"><i class="fa-solid fa-building-columns ic-meta" aria-hidden="true"></i> ${escHTML(d.unidad.length>18?d.unidad.slice(0,18)+'…':d.unidad)}</span>
          <span class="cm dcc-q"><i class="fa-solid fa-eye ic-meta" aria-hidden="true"></i> ${d.consultas>=1000?(d.consultas/1000).toFixed(1)+'k':d.consultas}</span>
        </div>
        <span class="dcc-monogram mono" style="background:${col}10;color:${col}">${escHTML(monogramFor(d))}</span>
      </div>
    </article>`;
  };

  // Collection card surrogate (para estantes)
  const collectionCardSmall = (c)=>`
    <a class="col-card-sm" href="#/search?coleccion=${c.id}" tabindex="0" aria-label="Colección: ${escHTML(c.nombre)} · ${c.count} documentos">
      <div class="ccs-pattern ${c.pattern}" style="background:${c.color}"></div>
      <div class="ccs-n" style="background:${c.color}">${c.count}</div>
      <div class="ccs-title">${escHTML(c.nombre.length>30?c.nombre.slice(0,30)+'…':c.nombre)}</div>
      <div class="ccs-desc">${escHTML(c.desc.length>70?c.desc.slice(0,70)+'…':c.desc)}</div>
    </a>`;

  // Change document surrogate (para estante horizontal de cambios)
  const changeCardSmall = (c)=>{
    const dn = DOCUMENTOS.find(d=>d.id===c.desde) || {codigo:c.desde,titulo:c.desde,unidad:''};
    const dh = DOCUMENTOS.find(d=>d.id===c.hacia) || {codigo:c.hacia,titulo:c.hacia,unidad:''};
    const tr = TIPOS_REL_COLOR[c.relacion] || {c:'#64748B',bg:'#F1F5F9',dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>',etiqueta:c.relacion};
    const ec = ESTADOS_REL_COLOR[c.estado] || ESTADOS_REL_COLOR.pendiente;
    return `<article class="change-card-small" tabindex="0" data-change="${c.id}" aria-label="Cambio: ${escHTML(dn.codigo)} ${escHTML(c.relacion)} ${escHTML(dh.codigo)}">
      <div class="ch-row1">
        <div class="ch-card ch-source" title="${escHTML(dn.titulo)}">
          <div class="ch-ic-src"><i class="fa-solid fa-file-lines ic-meta" aria-hidden="true"></i></div>
          <div class="ch-info"><div class="ch-cod mono">${escHTML(dn.codigo)}</div><div class="ch-t">${escHTML(dn.titulo.length>40?dn.titulo.slice(0,40)+'…':dn.titulo)}</div></div>
        </div>
        <div class="ch-rel" style="background:${tr.bg};color:${tr.c}">
          <span class="ch-rel-arrow">${tr.dir}</span>
          <span class="ch-rel-label">${escHTML(c.relacion)}</span>
        </div>
        <div class="ch-card ch-target" title="${escHTML(dh.titulo)}">
          <div class="ch-ic-tgt" style="background:${tr.bg};color:${tr.c}"><i class="fa-solid fa-bullseye ic-meta" aria-hidden="true"></i></div>
          <div class="ch-info"><div class="ch-cod mono">${escHTML(dh.codigo)}</div><div class="ch-t">${escHTML(dh.titulo.length>40?dh.titulo.slice(0,40)+'…':dh.titulo)}</div></div>
        </div>
      </div>
      <div class="ch-row2">
        <span class="ch-st" style="background:${ec.bg};color:${ec.c}"><span style="margin-right:4px">${ec.icon}</span>${escHTML(ec.label)}</span>
        <span class="cm ch-cm">${fmtHace(c.fecha)} · ${escHTML(c.por)}</span>
        <button type="button" class="btn ghost xs ch-review" data-review-ch="${c.id}">Revisar relación</button>
      </div>
    </article>`;
  };

  // Search scope options
  const scopeOptions = SCOPES_BUSQUEDA.map(s=>`
    <button type="button" class="scope-opt ${s.v===scopeActual?'on':''}" data-scope="${s.v}" role="option" aria-selected="${s.v===scopeActual}">
      <span class="so-ic">${s.icon}</span>
      <span class="so-label">${escHTML(s.label)}</span>
    </button>`).join('');
  // Alcance como segmentado CHIPS (arriba del row, reubicado para que no esté DENTRO del input)
  const scopeBar = `
    <div class="hero-scope-bar" role="tablist" aria-label="Alcance de la búsqueda">
      ${SCOPES_BUSQUEDA.map(s=>`
        <button type="button" class="hero-scope-chip ${s.v===scopeActual?'on':''}"
                data-scope="${s.v}" role="tab" aria-selected="${s.v===scopeActual}"
                title="Buscar en: ${escHTML(s.label)}">
          <span class="hsc-ic">${s.icon}</span><span class="hsc-lbl">${escHTML(s.label)}</span>
        </button>`).join('')}
    </div>`;

  // Advanced filter quick chips
  const advFiltros = `
    <div class="adv-grid">
      <label class="adv-group">
        <span class="adv-label">Tipo documento</span>
        <div class="adv-chips">
          ${TIPOS.slice(0,6).map(t=>`<button type="button" class="adv-chip ${state.search.filters.tipo===t?'on':''}" data-f="tipo" data-v="${escHTML(t)}">${escHTML(t)}</button>`).join('')}
        </div>
      </label>
      <label class="adv-group">
        <span class="adv-label">Año</span>
        <div class="adv-chips">
          ${['2024','2023','2022','2021','2020'].map(a=>`<button type="button" class="adv-chip ${state.search.filters.anio===a?'on':''}" data-f="anio" data-v="${a}">${a}</button>`).join('')}
        </div>
      </label>
      <label class="adv-group">
        <span class="adv-label">Estado</span>
        <div class="adv-chips">
          ${ESTADOS.map(e=>`<button type="button" class="adv-chip ${state.search.filters.estado===e?'on':''}" data-f="estado" data-v="${escHTML(e)}">${escHTML(e)}</button>`).join('')}
        </div>
      </label>
    </div>`;

  // ============ RENDER FINAL HOME ============
  return `
  <section class="home-hero search-hero-v2 ${state.search.query?'with-query':'no-query'}">
    <div class="hero-search hero-search-2 ${qfOpen?'qf-panel-open':''}">
      <header class="hs-head">
        <!-- IZQ: KICKER INSTITUCIONAL + NÚMEROS COBERTURA (ideas 1+3) -->
        <div class="hs-head-left">
          <div class="hero-kicker"><span class="hk-pill"><i class="fa-solid fa-landmark-dome ic-meta" aria-hidden="true"></i>Centro de Documentación · Acceso rápido</span></div>
          <div class="hero-coverage">
            <span class="hcv-item"><i class="fa-solid fa-file-lines ic-meta" aria-hidden="true"></i><strong>${totalDocs}</strong><span class="hcv-lbl">documentos</span></span>
            <span class="hcv-dot">·</span>
            <span class="hcv-item"><i class="fa-solid fa-building-columns ic-meta" aria-hidden="true"></i><strong>${totalUnidades}</strong><span class="hcv-lbl">unidades</span></span>
            <span class="hcv-dot">·</span>
            <span class="hcv-item"><i class="fa-solid fa-check-circle ic-meta" aria-hidden="true"></i><strong>${vigentesCount}</strong><span class="hcv-lbl">vigentes</span></span>
            <span class="hcv-dot">·</span>
            <span class="hcv-item hcv-range"><i class="fa-solid fa-calendar-range ic-meta" aria-hidden="true"></i><strong>${yearMin}–${yearMax}</strong></span>
          </div>
        </div>
        <label class="hero-label" for="homeSearch">
          <span class="hl-ic"><i class="fa-solid fa-magnifying-glass ic-meta" aria-hidden="true"></i></span>
          Búsqueda principal · <span class="hl-scope mono">${escHTML(scopeAct.label)}</span>
        </label>
        <div class="hs-head-right">
          <span class="hs-shortcut" aria-label="Pulsa barra diagonal para enfocar la búsqueda">
            <span class="hs-stxt">Pulsa</span>
            <kbd>/</kbd>
            <span class="hs-stxt">para enfocar la búsqueda</span>
          </span>
        </div>
      </header>

      ${scopeBar}

      <div class="hero-search-row hero-search-row-2">
        <!-- FILA 1: lupa + input + clear + GO (bloque superior) -->
        <div class="hsr-top-row">
          <span class="hs-ic hs-ic-big" aria-hidden="true"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></span>
          <input id="homeSearch" class="input home-search-input" type="search"
            placeholder="Ej.: reglamento ingreso PACE 15%, delegación firma Nivel 2, protocolo acompañamiento equidad género…"
            value="${escHTML(state.search.query)}"
            aria-describedby="hero-hint"
            autocomplete="off" aria-label="Búsqueda principal del archivo institucional" />
          <button class="gs-clear hero-clear" id="heroClear" aria-label="Limpiar búsqueda" ${!state.search.query?'hidden':''}><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
          <button id="heroSearchGo" class="btn primary hero-go-btn" type="button">
            <span>Buscar</span>
            <span class="kbd">↵</span>
          </button>
        </div>
      </div>

      <div class="gs-suggestions" id="gsSuggestions" hidden></div>

      <div class="quick-filter-divider" role="separator" aria-orientation="horizontal">
        <button type="button" class="qf-toggle" id="qfToggle"
          aria-expanded="${qfOpen}"
          aria-controls="quickFiltersPanel"
          aria-label="${qfOpen?'Ocultar filtros rápidos':'Mostrar filtros rápidos'}">
          <i class="fa-solid fa-chevron-${qfOpen?'up':'down'} ic-meta" aria-hidden="true"></i>
        </button>
      </div>

      <div id="quickFiltersPanel" class="quick-filters-panel ${qfOpen?'open':''}" aria-label="Filtros rápidos" ${qfOpen?'':'hidden'}>
        <div id="advFilters">${advFiltros}</div>

        <div class="hs-chips-row">
          <span class="cm hsc-label">Chips temáticos:</span>
          <div class="chips-tematicos" role="listbox" aria-multiselectable="true" aria-label="Chips temáticos rápidos">
            ${CHIPS_TEMATICOS.map(ch=>{
              const on = chipsSel.includes(ch.label);
              return `<button type="button" class="chip-t ${on?'on':''}" role="option" aria-selected="${on}" data-chip-label="${escHTML(ch.label)}" data-chip-q="${escHTML(ch.q)}">
                <span class="chip-t-check">${on?'<i class="fa-solid fa-check ic-meta" aria-hidden="true"></i>':'<i class="fa-solid fa-plus ic-meta" aria-hidden="true"></i>'}</span>${escHTML(ch.label)}
              </button>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- FOOTER DEL HERO (.hero-search) — ejemplos de búsqueda AQUÍ, como footer del bloque hero
           DISEÑO RECUPERADO: layout clásico, label 'Ejemplos:' + pills hsq-pill pequeñas
           (centrado, blanco, radius 999, border rule, hover accent) como trabajamos desde el inicio -->
      <footer class="hero-search-footer" aria-label="Ejemplos de búsqueda">
        <div class="hsf-row-inline">
          <span class="cm hsf-label-inline hsq-label">Ejemplos:</span>
          <div class="hs-pills-group">
            ${CONSULTAS_SUGERIDAS.slice(0,4).map(s=>`<button type="button" class="hsq-pill hsf-pill hed-pill" data-sq="${escHTML(s.q)}" data-sscope="${s.scope}">${escHTML(s.q.length>70?s.q.slice(0,70)+'…':s.q)}</button>`).join('')}
          </div>
          <span class="cm hsf-hint-inline">prueba un clic para autocompletar</span>
        </div>
      </footer>

    </div>

    <!-- 
    <div class="hero-stats hs-stats-v2" aria-label="Indicadores generales del archivo">
      <div class="stat stat2">
        <div class="stat-icon" style="background:#2A446312;color:#2A4463"><i class="fa-solid fa-book ic-meta" aria-hidden="true"></i></div>
        <div class="stat-info"><div class="stat-n2">${DOCUMENTOS.length}</div><div class="stat-t2">documentos indexados</div></div>
        <div class="stat-foot cm">${DOCUMENTOS.filter(d=>d.estado==='Vigente').length} vigentes · ${DOCUMENTOS.filter(d=>d.estado==='Histórico').length} históricos</div>
      </div>
      <div class="stat stat2">
        <div class="stat-icon" style="background:#B95A3B12;color:#B95A3B"><i class="fa-solid fa-folder-tree ic-meta" aria-hidden="true"></i></div>
        <div class="stat-info"><div class="stat-n2">${COLECCIONES.length}</div><div class="stat-t2">colecciones curadas</div></div>
        <div class="stat-foot cm">${COLECCIONES.reduce((s,c)=>s+(c.count||0),0)} documentos acopiados</div>
      </div>
      <div class="stat stat2">
        <div class="stat-icon" style="background:#3F6B4A12;color:#3F6B4A"><i class="fa-solid fa-building-columns ic-meta" aria-hidden="true"></i></div>
        <div class="stat-info"><div class="stat-n2">${UNIDADES.length}</div><div class="stat-t2">unidades responsables</div></div>
        <div class="stat-foot cm">Vicerrectorías · Facultades · Direcciones</div>
      </div>
      <div class="stat stat2">
        <div class="stat-icon" style="background:#5E426812;color:#5E4268"><i class="fa-solid fa-link ic-meta" aria-hidden="true"></i></div>
        <div class="stat-info"><div class="stat-n2">${CAMBIOS_RECIENTES.length}</div><div class="stat-t2">relaciones / afectaciones</div></div>
        <div class="stat-foot cm">${CAMBIOS_RECIENTES.filter(x=>x.estado==='pendiente').length} pendientes de revisión humana</div>
      </div>
    </div>
    !>
  </section>

  <!-- Destacados: Tarjetas editoriales grandes con doblez de hoja individual -->
  <section aria-labelledby="destacados-titulo" class="sec">
    <div class="sec-head">
      <div>
        <h2 id="destacados-titulo" class="sec-title">Documentos destacados</h2>
      </div>
      </div>
    <div class="featured-grid featured-grid-v2">
      ${featured.map(d=>{
        const col = colorForTipo(d.tipo);
        return `<article class="doc-featured doc-featured-v2 paper-document-card" style="--rib:${col}" tabindex="0" data-goto="${d.id}">
          <span class="paper-document-card__fold" aria-hidden="true"></span>
          <div class="doc-featured-body">
            <div class="doc-featured-head">
              <span class="type-pill" style="background:${col}11;color:${col}">${escHTML(d.tipo)}</span>
              <span class="cm mono df-cod">${escHTML(d.codigo)}</span>
              <span class="status ${slug(d.estado)}">${d.estado}</span>
            </div>

            <h3 class="doc-featured-title">${escHTML(d.titulo)}</h3>

            <p class="doc-featured-sum">${escHTML(d.resumen.slice(0,200))}${d.resumen.length>200?'…':''}</p>

            <div class="df-meta">
              <span class="df-meta-unit">
                <i class="fa-solid fa-building-columns ic-meta" aria-hidden="true"></i>
                <span>${escHTML(d.unidad)}</span>
              </span>
              <span class="df-meta-sep" aria-hidden="true"></span>
              <span class="df-meta-date">
                <i class="fa-solid fa-calendar-days ic-meta" aria-hidden="true"></i>
                <time datetime="${d.fecha}">${fmtDate(d.fecha)} · ${d.anio}</time>
              </span>
            </div>

            <div class="doc-featured-foot df-foot">
              <span class="doc-featured-cta">Abrir documento <i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i></span>
              <span class="cm df-count">${(d.articulos||[]).length} artículos · ${(d.secciones||[]).length} secciones</span>
            </div>
          </div>
        </article>`;
      }).join('')}
    </div>
  </section>

  <!-- Colecciones por materia como carpetas de expediente -->
  <section aria-labelledby="materias-titulo" class="sec subjects-section">
    <div class="sec-head subjects-head">
      <div class="subjects-head-left">
        <h2 id="materias-titulo" class="sec-title">Colecciones por materia</h2>
        <p class="sec-sub">Agrupaciones temáticas curadas. Cada carpeta conduce a la búsqueda filtrada correspondiente.</p>
      </div>
      ${(() => {
        const TOTAL = COLECCIONES.length;
        const VISIBLES_INICIAL = Math.min(5, TOTAL);
        const needsToggle = TOTAL > VISIBLES_INICIAL;
        const expanded = !!state.search.homeCollectionsExpanded;
        if (!needsToggle) return '';
        const text = expanded ? 'Ocultar materias' : 'Mostrar todas las materias';
        return `<div class="subjects-head-right">
          <button type="button" class="subjects-toggle" id="subjectsToggleBtn"
            aria-expanded="${expanded}"
            aria-controls="subjectsExpandPanel"
            aria-label="${text}">
            <span class="st-text">${text}</span>
            <span class="st-circle"><i class="fa-solid fa-chevron-${expanded ? 'up' : 'down'} ic-meta" aria-hidden="true"></i></span>
          </button>
        </div>`;
      })()}
    </div>
    <div id="subjectsExpandPanel" class="subjects-grid" role="list">
      ${(() => {
        const TOTAL = COLECCIONES.length;
        const VISIBLES_INICIAL = Math.min(5, TOTAL);
        const expanded = !!state.search.homeCollectionsExpanded;
        const list = expanded ? COLECCIONES : COLECCIONES.slice(0, VISIBLES_INICIAL);
        return list.map((c, i) => `
          <a class="matter-folder" href="#/search?coleccion=${encodeURIComponent(c.id)}"
             tabindex="0" role="listitem"
             style="--matter-accent:${escHTML(c.color)};--papers-count:${Math.min(3, Math.max(1, Math.ceil(c.count / 5)))}"
             aria-label="Explorar ${escHTML(c.nombre)}, ${c.count} documentos">
            <span class="matter-folder__back" aria-hidden="true"></span>
            <span class="matter-folder__papers" aria-hidden="true">
              <span class="matter-folder__paper matter-folder__paper--1"></span>
              <span class="matter-folder__paper matter-folder__paper--2"></span>
              <span class="matter-folder__paper matter-folder__paper--3" style="${c.count > 9 ? '' : 'display:none'}"></span>
            </span>
            <span class="matter-folder__front">
              <h3 class="matter-folder__title">
                <span class="matter-folder__marker" aria-hidden="true"></span>
                ${escHTML(c.nombre)}
              </h3>
              <p class="matter-folder__description">${escHTML(c.desc)}</p>
              <div class="matter-folder__bottom">
                <span class="matter-folder__doc-count">${c.count} documentos</span>
                <span class="matter-folder__action" aria-hidden="true">
                  Explorar carpeta <i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>
                </span>
              </div>
            </span>
          </a>
        `).join('');
      })()}
    </div>
  </section>
  `;
}
function hookHome(){
  const input = $('#homeSearch');
  const go = $('#heroSearchGo');
  const clearBtn = $('#heroClear');
  const scopeBtn = $('#scopeBtn');
  const scopeMenu = $('#scopeMenu');
  const qfToggle = $('#qfToggle');

  // ========== BÚSQUEDA SCOPE-AWARE ==========
  const doSearch = (qOverride=null, scopeOverride=null)=>{
    const q = (qOverride !== null ? qOverride : (input?.value || '')).trim();
    const scope = scopeOverride || state.search.scope || 'todo';
    if(!q){ toast('Ingrese un término para buscar.',{kind:'warn',title:'Búsqueda'}); return; }
    state.search.query = q;
    state.search.scope = scope;
    saveState();
    closeSuggestions();
    const params = new URLSearchParams();
    params.set('q', q);
    if(scope!=='todo') params.set('scope', scope);
    navigateTo('#/search?'+params.toString());
  };

  // ========== INPUT PRINCIPAL ==========
  if(input){
    input.addEventListener('focus', ()=>{
      if(input.value) renderSuggestions(input.value);
    });
    input.addEventListener('blur', ()=>{
      setTimeout(()=>{ closeSuggestions(); scopeMenu?.setAttribute('hidden',''); }, 160);
    });
    input.addEventListener('input', ()=>{
      const v = input.value.trim();
      if(clearBtn) clearBtn.hidden = !v;
      renderSuggestions(input.value);
    });
    input.addEventListener('keydown', e=>{
      const rows = $$('#gsSuggestions .gs-sugg-row');
      if(e.key==='ArrowDown' && e.altKey){
        // navegación sugerencias
      } else if(e.key==='ArrowDown'){
        e.preventDefault();
        if(!rows.length) return;
        gsActiveIdx = (gsActiveIdx+1) % rows.length;
        updateGsActive();
      } else if(e.key==='ArrowUp'){
        e.preventDefault();
        if(!rows.length) return;
        gsActiveIdx = (gsActiveIdx-1+rows.length) % rows.length;
        updateGsActive();
      } else if(e.key==='Escape'){
        closeSuggestions();
        scopeMenu?.setAttribute('hidden','');
      } else if(e.key==='Enter'){
        if(gsActiveIdx>=0){
          e.preventDefault();
          openDetailFromSuggestion();
        } else {
          e.preventDefault();
          doSearch();
        }
      }
    });
    // focus inicial
    if(!state.search.query){ setTimeout(()=>input.focus({preventScroll:true}), 50); }
  }
  clearBtn?.addEventListener('click', ()=>{
    if(input){ input.value=''; input.focus(); }
    if(clearBtn) clearBtn.hidden=true;
    state.search.query = ''; saveState();
    closeSuggestions();
    renderCurrentView(state.currentRoute);
  });
  go?.addEventListener('click', ()=>doSearch());

  // ========== MENÚ DE ALCANCE ==========
  // Handler común para chips de alcance (nuevo modelo) y scope-opt antiguos por compatibilidad
  const applyScope = (sc)=>{
    if(!sc) return;
    state.search.scope = sc; saveState();
    renderCurrentView(state.currentRoute);
    const found = SCOPES_BUSQUEDA.find(s=>s.v===sc);
    toast(`Alcance cambiado a: ${found?.label || sc}`, {kind:'info', title:'Búsqueda', timeout:1600});
    // Mantener foco en el input después de re-render
    requestAnimationFrame(()=>{ const i = document.getElementById('homeSearch'); if(i){ i.focus(); i.setSelectionRange(i.value.length, i.value.length); } });
  };
  $$('.hero-scope-chip, .scope-opt').forEach(opt=>{
    opt.addEventListener('click', ()=> applyScope(opt.dataset.scope));
  });
  // Eliminado: handler scope-btn / scope-menu / clase .scope-open (ahora es segmentado)

  // ========== PANEL FILTROS RÁPIDOS toggle ==========
  qfToggle?.addEventListener('click', ()=>{
    state.search.quickFiltersOpen = !state.search.quickFiltersOpen;
    saveState();
    renderCurrentView(state.currentRoute);
  });

  // ========== EXPANSIÓN COLECCIONES POR MATERIA ==========
  const subjToggle = document.getElementById('subjectsToggleBtn');
  if (subjToggle && !subjToggle.__boundSubj) {
    subjToggle.__boundSubj = true;
    subjToggle.addEventListener('click', () => {
      state.search.homeCollectionsExpanded = !state.search.homeCollectionsExpanded;
      saveState();
      renderCurrentView(state.currentRoute);
      // Mantener foco sobre el botón recién renderizado
      requestAnimationFrame(() => {
        const nb = document.getElementById('subjectsToggleBtn');
        if (nb) nb.focus({ preventScroll: true });
      });
    });
  }

  // adv chips (filtros rápidos tipo/anio/estado)
  $$('.adv-chip').forEach(ch=>{
    ch.addEventListener('click', ()=>{
      const f = ch.dataset.f;
      const v = ch.dataset.v;
      if(!state.search.filters) state.search.filters = {};
      if(state.search.filters[f] === v){ delete state.search.filters[f]; }
      else { state.search.filters[f] = v; }
      saveState();
      renderCurrentView(state.currentRoute);
    });
  });

  // ========== CHIPS TEMÁTICOS ==========
  if(!state.search.selectedChips) state.search.selectedChips = [];
  $$('.chip-t').forEach(ct=>{
    ct.addEventListener('click', ()=>{
      const label = ct.dataset.chipLabel;
      const q = ct.dataset.chipQ;
      const idx = state.search.selectedChips.indexOf(label);
      if(idx>=0){ state.search.selectedChips.splice(idx,1); }
      else { state.search.selectedChips.push(label); }
      saveState();
      // si se seleccionó y no hay query, usar la q del chip
      if(idx<0 && !state.search.query){
        doSearch(q);
        return;
      }
      renderCurrentView(state.currentRoute);
    });
  });

  // ========== PÍLDORAS DE CONSULTAS SUGERIDAS (hsq-pill legacy + hed-pill nuevo) ==========
  $$('.hsq-pill, .hed-pill').forEach(p=>{
    p.addEventListener('click', ()=>{
      const q = p.dataset.sq;
      const sco = p.dataset.sscope || 'todo';
      if(input){ input.value = q; }
      doSearch(q, sco);
    });
  });

  // ========== ESTANTES / SHELVES ==========
  const hookShelvesLocal = ()=>{
    const SHELF_STEP = 420;
    $$('.shelf-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.shelf;
        const track = document.getElementById('shelf-'+id);
        if(!track) return;
        const dir = btn.classList.contains('shelf-next') ? 1 : -1;
        track.scrollBy({left: SHELF_STEP*dir, behavior:'smooth'});
      });
    });
    $$('.shelf-track').forEach(track=>{
      track.addEventListener('keydown', e=>{
        if(e.key==='ArrowRight'){ e.preventDefault(); track.scrollBy({left:SHELF_STEP, behavior:'smooth'}); }
        else if(e.key==='ArrowLeft'){ e.preventDefault(); track.scrollBy({left:-SHELF_STEP, behavior:'smooth'}); }
      });
    });
  };
  hookShelvesLocal();

  // ========== ACCIONES DE TARJETAS ==========
  // Navegación a detalle
  const gotoHandlers = (sel)=>{
    $$(sel).forEach(el=>{
      const act = ()=>{ if(el.dataset.goto) navigateTo('#/detail/'+el.dataset.goto); };
      el.addEventListener('click', act);
      el.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); act(); } });
    });
  };
  gotoHandlers('.doc-featured-v2');
  gotoHandlers('.doc-card-compact');
  $$('[data-goto]').forEach(a=>{
    if(a.tagName==='A') return; // los enlaces <a> ya navegan solos
    a.addEventListener('click', ()=>navigateTo('#/detail/'+a.dataset.goto));
  });

  // Revisar relación (chico y full)
  const goReview = (changeId)=>{
    state.review._focusChange = changeId;
    saveState();
    navigateTo('#/review');
  };
  $$('[data-review-ch]').forEach(b=>b.addEventListener('click', ()=>goReview(b.dataset.reviewCh)));
  $$('[data-review-full]').forEach(b=>b.addEventListener('click', ()=>goReview(b.dataset.reviewFull)));

  // Comparar documentos (full rows)
  $$('[data-compare]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const cid = b.dataset.compare;
      // buscar en CAMBIOS_RECIENTES (id)
      let c = CAMBIOS_RECIENTES.find(x=>x.id===cid);
      if(!c){
        // también buscar por candidatos (si tiene id de candidato)
        const cand = CANDIDATOS.find(x=>x.id===cid);
        if(cand){ openCompare(cand.docNuevoId, cand.docCandId, cand.id); return; }
        // fallback: es un id de documento, comparar con d001
        openCompare('d001', cid, null);
        return;
      }
      openCompare(c.desde, c.hacia, c.id);
    });
  });

  // actualizar badge del nav
  const p = state.review.progress || {pendientes:0};
  const badge = $('#pendingBadge');
  if(badge){ badge.textContent = String(p.pendientes||CAMBIOS_RECIENTES.filter(x=>x.estado==='pendiente').length); }
}

/* =========================================================
   8. VISTA B · RESULTADOS BÚSQUEDA
   ========================================================= */
function getDocsSearch(){
  const cfg = state.search._evalConfig || (state.search.evaluationMode ? state.search._evalConfig : undefined);
  const resp = searchDocuments(state.search.query, state.search.filters, state.search.sort, cfg || 'C4');
  return resp;
}

function renderExplore() {
  const docTypes = {};
  const unidades = {};
  
  DOCUMENTOS.forEach(d => {
    if (!docTypes[d.tipo]) docTypes[d.tipo] = 0;
    docTypes[d.tipo]++;
    if (!unidades[d.unidad]) unidades[d.unidad] = 0;
    unidades[d.unidad]++;
  });

  const typesHtml = Object.keys(docTypes).sort().map(t => `
    <a href="#/search?tipo=${encodeURIComponent(t)}" class="card rel-card" style="text-decoration:none; display:flex; justify-content:space-between; align-items:center;">
      <span style="font-weight:600; color:var(--ink)">${escHTML(t)}</span>
      <span class="badge" style="background:var(--bg-paper); color:var(--ink-light)">${docTypes[t]}</span>
    </a>
  `).join('');

  const unidadesHtml = Object.keys(unidades).sort().map(u => `
    <a href="#/search?unidad=${encodeURIComponent(u)}" class="card rel-card" style="text-decoration:none; display:flex; justify-content:space-between; align-items:center;">
      <span style="font-weight:600; color:var(--ink)">${escHTML(u)}</span>
      <span class="badge" style="background:var(--bg-paper); color:var(--ink-light)">${unidades[u]}</span>
    </a>
  `).join('');

  const collectionsHtml = COLECCIONES.map(c => `
    <a href="#/search?coleccion=${encodeURIComponent(c.nombre)}" class="col-card ${c.pattern}" style="--cc:${c.color}; text-decoration:none;">
      <div class="col-card-body">
        <h3>${escHTML(c.nombre)}</h3>
        <p>${escHTML(c.desc)}</p>
      </div>
    </a>
  `).join('');

  const recentDocs = [...DOCUMENTOS].sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 4);
  const recentHtml = recentDocs.map(d => typeof compactDocCard === 'function' ? compactDocCard(d) : '').join('');

  return `
  <header class="page-head">
    <div class="ph-row">
      <div>
        <h1 style="margin:0; font-size:24px; color:var(--ink); font-family:var(--font-serif)">Explorar</h1>
        <p style="margin:8px 0 0 0; color:var(--ink-light); font-size:15px;">Navegue por el índice documental institucional a través de distintas categorías.</p>
      </div>
    </div>
  </header>
  <div class="sec">
    <h2 class="sec-title">Por tipo documental</h2>
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:16px;">
      ${typesHtml}
    </div>
  </div>
  <div class="sec">
    <h2 class="sec-title">Por unidad responsable</h2>
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:16px;">
      ${unidadesHtml}
    </div>
  </div>
  <div class="sec">
    <h2 class="sec-title">Colecciones temáticas</h2>
    <div class="col-grid">
      ${collectionsHtml}
    </div>
  </div>
  <div class="sec" style="margin-bottom:64px;">
    <h2 class="sec-title">Incorporados recientemente</h2>
    <div style="display:grid; gap:16px; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));">
      ${recentHtml}
    </div>
  </div>
  `;
}

function bindExplore() {
  window.scrollTo({top:0});
}

function renderGuide() {
  return `
  <header class="page-head">
    <div class="ph-row">
      <div>
        <h1 style="margin:0; font-size:24px; color:var(--ink); font-family:var(--font-serif)">Guía de búsqueda</h1>
        <p style="margin:8px 0 0 0; color:var(--ink-light); font-size:15px;">Instrucciones y ejemplos prácticos para utilizar el archivo documental.</p>
      </div>
    </div>
  </header>
  
  <div class="guide-content" style="max-width:800px; margin-bottom:64px;">
    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Qué se puede buscar</h2>
      <p style="margin-bottom:16px;">El archivo permite encontrar documentación institucional oficial, incluyendo reglamentos, resoluciones, protocolos, circulares, manuales y convenios. Todos los documentos están indexados y clasificados por tipo, año, estado y unidad responsable.</p>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Formas de buscar</h2>
      <ul style="padding-left:20px; margin-bottom:24px;">
        <li style="margin-bottom:16px;"><strong>Por tema:</strong> Escriba conceptos generales. <br>
          <a href="#/search?q=equidad+de+genero" class="btn primary sm" style="margin-top:8px; display:inline-flex;">Probar esta búsqueda</a>
        </li>
        <li style="margin-bottom:16px;"><strong>Por título:</strong> Busque palabras exactas del título del documento. <br>
          <a href="#/search?q=reglamento+de+ingreso" class="btn primary sm" style="margin-top:8px; display:inline-flex;">Probar esta búsqueda</a>
        </li>
        <li style="margin-bottom:16px;"><strong>Por identificador documental:</strong> Si conoce el código (ej. RE-001-2024). <br>
          <a href="#/search?q=RE-001-2024" class="btn primary sm" style="margin-top:8px; display:inline-flex;">Probar esta búsqueda</a>
        </li>
        <li style="margin-bottom:16px;"><strong>Por unidad responsable:</strong> Busque el nombre de la unidad emisora. <br>
          <a href="#/search?q=vicerrectoria+academica" class="btn primary sm" style="margin-top:8px; display:inline-flex;">Probar esta búsqueda</a>
        </li>
      </ul>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Uso de filtros</h2>
      <p style="margin-bottom:16px;">Una vez realizada una búsqueda, puede refinar los resultados utilizando los filtros laterales:</p>
      <ul style="padding-left:20px; margin-bottom:16px;">
        <li style="margin-bottom:8px;"><strong>Tipo documental:</strong> Filtra entre Reglamentos, Circulares, etc.</li>
        <li style="margin-bottom:8px;"><strong>Unidad responsable:</strong> Limita los resultados a los emitidos por una unidad específica.</li>
        <li style="margin-bottom:8px;"><strong>Estado documental:</strong> Permite ver solo documentos vigentes, históricos o en revisión.</li>
        <li style="margin-bottom:8px;"><strong>Año:</strong> Acota la búsqueda a un rango temporal específico de emisión.</li>
      </ul>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Interpretación de los resultados</h2>
      <p style="margin-bottom:16px;">Cada resultado de búsqueda muestra la siguiente información:</p>
      <ul style="padding-left:20px; margin-bottom:16px;">
        <li style="margin-bottom:8px;"><strong>Título e Identificador:</strong> Nombre oficial y código único del documento.</li>
        <li style="margin-bottom:8px;"><strong>Fragmento relevante:</strong> Una sección del texto donde se encontraron las palabras buscadas.</li>
        <li style="margin-bottom:8px;"><strong>Metadatos:</strong> Fecha, unidad emisora y cantidad de consultas.</li>
        <li style="margin-bottom:8px;"><strong>Estado documental:</strong> Una etiqueta visual (Vigente, Histórico, En revisión).</li>
      </ul>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Estados y relaciones documentales</h2>
      <p style="margin-bottom:16px;">Los documentos pueden estar interconectados. El sistema indica estas relaciones de la siguiente manera:</p>
      <ul style="padding-left:20px; margin-bottom:16px;">
        <li style="margin-bottom:8px;"><strong>Vigente / Histórico:</strong> Indica si el documento está actualmente en aplicación o ha sido reemplazado/derogado.</li>
        <li style="margin-bottom:8px;"><strong>Documento relacionado:</strong> Vínculos a otros documentos que complementan o son mencionados.</li>
        <li style="margin-bottom:8px;"><strong>Modifica / Reemplaza:</strong> Relaciones explícitas donde un documento altera normativamente a otro.</li>
        <li style="margin-bottom:8px; color:var(--ink-light);"><em>Nota:</em> Una "relación validada" ha sido confirmada administrativamente, mientras que una "relación sugerida" es identificada automáticamente por el sistema y requiere confirmación. El estado mostrado en este prototipo es referencial y no determina jurídicamente la vigencia de un documento.</li>
      </ul>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Cuando no existen resultados</h2>
      <p style="margin-bottom:16px;">Si su búsqueda no arroja resultados, le recomendamos:</p>
      <ul style="padding-left:20px; margin-bottom:16px;">
        <li style="margin-bottom:8px;">Revisar la ortografía de los términos.</li>
        <li style="margin-bottom:8px;">Utilizar menos palabras o conceptos más generales.</li>
        <li style="margin-bottom:8px;">Quitar algunos filtros aplicados que puedan ser muy restrictivos.</li>
        <li style="margin-bottom:8px;">Probar con conceptos relacionados o sinónimos.</li>
        <li style="margin-bottom:8px;">Si conoce el código exacto, busque utilizando únicamente ese identificador.</li>
      </ul>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Glosario breve</h2>
      <dl>
        <dt style="font-weight:600; margin-top:16px;">Reglamento</dt>
        <dd style="margin-left:0; color:var(--ink-light); margin-bottom:8px;">Norma de carácter general y permanente que regula procesos institucionales.</dd>
        <dt style="font-weight:600; margin-top:16px;">Resolución</dt>
        <dd style="margin-left:0; color:var(--ink-light); margin-bottom:8px;">Acto administrativo que resuelve materias específicas o aplica normativas generales.</dd>
        <dt style="font-weight:600; margin-top:16px;">Circular</dt>
        <dd style="margin-left:0; color:var(--ink-light); margin-bottom:8px;">Comunicación interna para transmitir instrucciones o directrices operativas.</dd>
        <dt style="font-weight:600; margin-top:16px;">Vigencia</dt>
        <dd style="margin-left:0; color:var(--ink-light); margin-bottom:8px;">Estado que indica que un documento se encuentra actualmente en aplicación y validez.</dd>
        <dt style="font-weight:600; margin-top:16px;">Derogación</dt>
        <dd style="margin-left:0; color:var(--ink-light); margin-bottom:8px;">Anulación o revocación total o parcial de una norma por un documento posterior.</dd>
        <dt style="font-weight:600; margin-top:16px;">Documento sucesor</dt>
        <dd style="margin-left:0; color:var(--ink-light); margin-bottom:8px;">Nuevo documento que reemplaza la función y el contenido de uno histórico.</dd>
      </dl>
    </section>
  </div>
  `;
}

function renderAbout() {
  const docCount = DOCUMENTOS.length;
  const dates = DOCUMENTOS.map(d => parseInt(String(d.fecha).split('-')[0])).filter(y => !isNaN(y));
  const minYear = Math.min(...dates);
  const maxYear = Math.max(...dates);

  return `
  <header class="page-head">
    <div class="ph-row">
      <div>
        <h1 style="margin:0; font-size:24px; color:var(--ink); font-family:var(--font-serif)">Acerca del archivo</h1>
        <p style="margin:8px 0 0 0; color:var(--ink-light); font-size:15px;">Información sobre este prototipo, su cobertura y propósito.</p>
      </div>
    </div>
  </header>
  
  <div class="about-content" style="max-width:800px; margin-bottom:64px;">
    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Propósito</h2>
      <p style="margin-bottom:16px;">Este sitio busca facilitar el acceso, consulta y recuperación de la documentación institucional universitaria. Proporciona una interfaz de búsqueda unificada para localizar normativas, acuerdos y resoluciones de forma eficiente, promoviendo la transparencia y el conocimiento organizacional.</p>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Contenido del archivo</h2>
      <p style="margin-bottom:16px;">El índice actual incluye documentos de los siguientes tipos:</p>
      <ul style="padding-left:20px; margin-bottom:16px;">
        <li style="margin-bottom:4px;">Reglamentos</li>
        <li style="margin-bottom:4px;">Resoluciones</li>
        <li style="margin-bottom:4px;">Circulares</li>
        <li style="margin-bottom:4px;">Acuerdos</li>
        <li style="margin-bottom:4px;">Convenios</li>
        <li style="margin-bottom:4px;">Normativas</li>
      </ul>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Fuentes documentales</h2>
      <p style="margin-bottom:16px;">La información ha sido recopilada a partir de resoluciones emitidas por la Rectoría, acuerdos del Consejo Universitario y disposiciones de las diferentes Vicerrectorías y Facultades institucionales.</p>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Cobertura</h2>
      <p style="margin-bottom:16px;">El archivo indexa actualmente un total de <strong>${docCount} documentos</strong>, abarcando publicaciones realizadas entre los años <strong>${minYear} y ${maxYear}</strong>.</p>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Procedencia</h2>
      <p style="margin-bottom:16px;">Los documentos deben conservar un enlace hacia su publicación o archivo institucional original cuando esté disponible. Este buscador opera como un índice de acceso y no como el repositorio primario o legal de conservación.</p>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Limitaciones</h2>
      <ul style="padding-left:20px; margin-bottom:16px;">
        <li style="margin-bottom:8px;">El prototipo puede utilizar datos demostrativos y simulados para ilustrar funcionalidades de búsqueda.</li>
        <li style="margin-bottom:8px;">La colección puede no representar la totalidad de la documentación institucional existente.</li>
        <li style="margin-bottom:8px;">El estado mostrado (vigencia) no sustituye la revisión de la fuente oficial o del área jurídica pertinente.</li>
        <li style="margin-bottom:8px;">Las relaciones documentales sugeridas por el sistema necesitan validación humana antes de considerarse definitivas.</li>
      </ul>
    </section>

    <section class="sec">
      <h2 style="font-family:var(--font-serif); color:var(--accent); margin-bottom:16px; font-size:18px;">Contexto académico</h2>
      <p style="margin-bottom:16px;">Este sistema corresponde a un prototipo desarrollado en el contexto de un Trabajo de Graduación del Magíster en Ingeniería Informática. Su objetivo principal es evaluar estrategias de recuperación de información, interfaces de búsqueda y accesibilidad aplicadas a corpus normativos institucionales.</p>
    </section>
  </div>
  `;
}

function renderSearch(){
  const q = state.search.query || '';
  const cfg = state.search.evaluationMode ? (state.search._evalConfig || 'C4') : 'C4';
  const sr = searchDocuments(q, state.search.filters, state.search.sort, cfg);
  const arr = sr.results;
  const NIVEL_INST = ['Institucional','Facultad','Unidad','Programa'];
  const pageSize = 5;
  const pages = Math.max(1, Math.ceil(arr.length / pageSize));
  if(state.search.page<1) state.search.page = 1;
  if(state.search.page>pages) state.search.page = pages;
  const start = (state.search.page-1)*pageSize;
  const slice = arr.slice(start, start+pageSize);
  const empty = arr.length===0 && q;
  const scope = state.search.scope || 'todo';
  const advCollapsed = !!state.search.advancedOpen===false ? false : true;
  const scopeL = SCOPES_SEARCH_V3.find(s=>s.v===scope) || SCOPES_SEARCH_V3[0];
  const savedIds = state.search.savedDocs||[];
  const showExpl = !!state.search.showExploracion;
  const evMode = !!state.search.evaluationMode;
  const previewId = state.search.previewDocId;
  const prevDoc = previewId ? DOCUMENTOS.find(d=>d.id===previewId) : null;
  const prevSR = previewId ? sr.results.find(x=>x.doc.id===previewId) : null;
  const viewRows = state.search.view!=='cards';
  const facetGroupV3 = (key, titulo, opts, extras={})=>{
    const collapsed = !!state.search._collapsed[key];
    const vals = (Array.isArray(state.search.filters[key])?state.search.filters[key]:state.search.filters[key]?[state.search.filters[key]]:[]);
    const maxInit = extras.maxShow || 6;
    const visible = opts.slice(0,maxInit);
    const resto = opts.slice(maxInit);
    return `<div class="facet-group v3" data-facet="${key}">
      <div class="fg-head">
        <button type="button" class="facet-head" aria-expanded="${!collapsed}" aria-controls="facet-${key}">
          <span>${escHTML(titulo)}</span>
          <span class="chev ${collapsed?' col':''}"></span>
        </button>
        <div class="fg-tools">
          ${vals.length?`<button type="button" class="link sm fg-clear" data-fgclear="${key}" title="Limpiar grupo"><i class="fa-solid fa-xmark ic-meta" aria-hidden="true"></i></button>`:''}
        </div>
      </div>
      ${extras.search ? `<div class="fg-search"><input class="input xs" type="text" placeholder="Buscar…" data-fgsearch="${key}"/></div>`:''}
      <div id="facet-${key}" class="facet-body" ${collapsed?'hidden':''}>
        <div class="facet-opts v3">
          ${visible.map((o,i)=>{
            const checked = vals.includes(o.v);
            const fid = `f-${key}-${slug(String(o.v))}-${i}`;
            return `<label class="facet-opt" for="${fid}"><input type="checkbox" id="${fid}" data-fv="${key}" value="${escHTML(o.v)}" ${checked?'checked':''}/><span class="fo-lbl">${escHTML(o.t||o.v)}</span><span class="fn">${o.n}</span></label>`;
          }).join('')}
          ${resto.length?`<div class="fg-more"><button type="button" class="link sm" data-fgmore="${key}" data-expanded="0">Mostrar ${resto.length} más</button></div><div class="fg-more-opts" hidden>${resto.map((o,i)=>{
            const checked = vals.includes(o.v);
            const fid = `f-${key}-more-${slug(String(o.v))}-${i}`;
            return `<label class="facet-opt" for="${fid}"><input type="checkbox" id="${fid}" data-fv="${key}" value="${escHTML(o.v)}" ${checked?'checked':''}/><span class="fo-lbl">${escHTML(o.t||o.v)}</span><span class="fn">${o.n}</span></label>`;
          }).join('')}</div>`:''}
        </div>
      </div>
    </div>`;
  };
  const facets = `
    ${facetGroupV3('tipo','Tipo documental', TIPOS.map(t=>({v:t,t,n:DOCUMENTOS.filter(d=>d.tipo===t).length})))}
    ${facetGroupV3('unidad','Unidad responsable', UNIDADES.slice().sort().map(u=>({v:u,t:u,n:DOCUMENTOS.filter(d=>d.unidad===u).length})),{search:true,maxShow:5})}
    ${facetGroupV3('anio','Año normativo', [...new Set(DOCUMENTOS.map(d=>String(d.anio)))].sort((a,b)=>b.localeCompare(a)).map(a=>({v:a,t:a,n:DOCUMENTOS.filter(d=>String(d.anio)===a).length})))}
    ${facetGroupV3('estado','Estado documental', ESTADOS.map(e=>({v:e,t:e,n:DOCUMENTOS.filter(d=>d.estado===e).length})))}
    ${facetGroupV3('materia','Materia / Colección', COLECCIONES.map(c=>({v:c.id,t:c.nombre,n:c.count})),{maxShow:4})}
    ${facetGroupV3('nivel','Nivel institucional', NIVEL_INST.map(n=>({v:n,t:n,n:Math.round(2+n.length*4)})))}
    ${facetGroupV3('versiones','Con versiones', [{v:'Sí',t:'Tiene historial versiones',n:DOCUMENTOS.filter(d=>d.versiones&&d.versiones.length>1).length}])}
    ${facetGroupV3('relaciones','Con relaciones documentales', [{v:'Con relaciones',t:'Cita / modifica / afecta',n:DOCUMENTOS.filter(d=>d.afectaciones&&d.afectaciones.length>0).length}])}
    ${facetGroupV3('tipoRelacion','Tipo de relación validada', RELACIONES_FILTRO.map(r=>({v:r,t:r,n:DOCUMENTOS.filter(d=>(d.afectaciones||[]).some(a=>a.relacion===r)).length})))}
    ${facetGroupV3('disponibilidad','Disponibilidad / Acceso', ACCESOS.map(a=>({v:a,t:a,n:DOCUMENTOS.filter(d=>d.disponibilidad===a).length})))}
  `;
  const chipsHost = (()=>{
    const items = [];
    const f = state.search.filters; Object.keys(f).forEach(k=>{
      const vs = Array.isArray(f[k])?f[k]:[f[k]];
      vs.forEach(v=>{ if(v) items.push({k,v,label:`${k}: ${v}`}); });
    });
    (state.search.expandedTerms||[]).forEach(t=>items.push({k:'__term',v:t,label:`Buscando también: ${t}`}));
    if(!items.length && !q) return '';
    return `<div class="chips-host v3" aria-label="Filtros activos">
      ${q?`<span class="chip q-chip"><span class="cm cm">Consulta</span>${escHTML(q)}<button class="chip-x" data-chip-clearq aria-label="Limpiar consulta"><i class="fa-solid fa-xmark ic-meta" aria-hidden="true"></i></button></span>`:''}
      ${items.map((it,i)=>`<span class="chip ${it.k==='__term'?'term-chip':''}">${escHTML(it.label)}<button class="chip-x" data-chip-idx="${i}" aria-label="Quitar filtro ${escHTML(it.label)}"><i class="fa-solid fa-xmark ic-meta" aria-hidden="true"></i></button></span>`).join('')}
      ${items.length||q?`<button class="chip-link" data-clear-chips type="button">Limpiar todo</button>`:''}
    </div>`;
  })();

  // ============ RUTA DE EXPLORACIÓN (berrypicking============
  const trailHtml = (state.search.trail && state.search.trail.length) ? `
  <div class="trail-wrap v3" aria-label="Ruta de exploración · berrypicking">
    <div class="trail-head"><span class="trail-lbl">Ruta de exploración</span>
      <button type="button" class="link sm" data-trail-toggle>${showExpl?'Contraer <i class="fa-solid fa-chevron-down ic-meta" aria-hidden="true"></i>':'Ampliar <i class="fa-solid fa-chevron-up ic-meta" aria-hidden="true"></i>'}</button>
    </div>
    <ol class="trail-list">
      ${state.search.trail.map((t,i)=>`<li class="trail-item ${t.tipo}">
        <span class="trail-ic">${t.tipo==='consulta'?'<i class="fa-solid fa-magnifying-glass ic-meta" aria-hidden="true"></i>':t.tipo==='filtro'?'<i class="fa-solid fa-sliders ic-meta" aria-hidden="true"></i>':'<i class="fa-solid fa-file-lines ic-meta" aria-hidden="true"></i>'}</span>
        <button type="button" class="trail-lbl" data-trailst="${i}" title="Volver a esta etapa">${escHTML(t.label)}</button>
        ${i<state.search.trail.length-1?'<span class="trail-sep"><i class="fa-solid fa-chevron-right ic-meta" aria-hidden="true"></i></span>':''}
        ${i===state.search.trail.length-1?`<button type="button" class="trail-x" title="Eliminar paso" data-trailrm="${i}"><i class="fa-solid fa-xmark ic-meta" aria-hidden="true"></i></button>`:''}
      </li>`).join('')}
    </ol>
  </div>` : '';

  // ============ CLARIFICACIÓN AMBIGUA ==============
  const clarHtml = sr.suggestedClarifications ? `
  <div class="clar-box v3" role="region" aria-label="Aclaración de consulta">
    <div class="clar-ic"><i class="fa-solid fa-lightbulb ic-meta" aria-hidden="true"></i></div>
    <div class="clar-body">
      <div class="clar-q">¿A qué tipo de renuncia te refieres?</div>
      <div class="clar-opts">${sr.suggestedClarifications.map(c=>`
        <button type="button" class="clar-opt" data-clarv="${c.v}" data-clarq="${escHTML(c.q||q||'todos')}">${escHTML(c.l)}</button>`).join('')}
      </div>
    </div>
    <button type="button" class="link sm" data-clarskip>Seguir sin aclaración</button>
  </div>` : '';

  // ============ EXPANSIÓN DE TÉRMINOS =============
  const relatedTermsBox = sr.relatedTerms && sr.relatedTerms.length ? `
  <div class="relterms v3">
    <div class="rt-head"><span class="rt-lbl">También podrías buscar · Conceptos relacionados</span>
    ${state.search.expandedTerms.length ? `<span class="cm">Buscando también: <b>${state.search.expandedTerms.map(t=>`<span class="rt-act">${escHTML(t)}</span><button type="button" class="rt-x" data-rmx="${escHTML(t)}"><i class="fa-solid fa-xmark ic-meta" aria-hidden="true"></i></button>`).join(', ')}</b></span>` : ''}
    </div>
    <div class="rt-chips">
      ${sr.relatedTerms.slice(0,10).map(t=>{
        const on = (state.search.expandedTerms||[]).includes(t);
        return `<button type="button" class="rt-chip ${on?'on':''}" data-rt="${escHTML(t)}">${on?'<i class="fa-solid fa-check ic-meta" aria-hidden="true"></i> ':''}${escHTML(t)}</button>`;
      }).join('')}
    </div>
  </div>` : '';

  // ============ RESULTADOS FILAS DENSAS ============
  function rowResultV3(item, rank){
    const d = item.doc;
    const terms = sr.allTerms||[];
    const whyOpen = state.search.whyOpenDocId===d.id;
    const saved = savedIds.includes(d.id);
    return `<article class="srow v3" tabindex="0" data-srg="${d.id}">
      <div class="sr-left">
        <div class="sr-mono2" style="background:${colorForTipo(d.tipo)}15;color:${colorForTipo(d.tipo)}" aria-hidden="true">
          <div class="sr-rank mono">#${rank+start+1}</div>
          <div class="sr-mono txt">${monogramFor(d)}</div>
        </div>
      </div>
      <div class="sr-body">
        <div class="sr-headmeta">
          <span class="type-pill sm" style="background:${colorForTipo(d.tipo)}15;color:${colorForTipo(d.tipo)}">${escHTML(d.tipo)}</span>
          <span class="mono sr-cod">${escHTML(d.codigo)}</span>
          <span class="status sm ${slug(d.estado)}">${d.estado}</span>
          <span class="sr-ofi" title="Documento oficial USACH"><i class="fa-solid fa-check ic-meta" aria-hidden="true"></i> Oficial</span>
          <span class="sr-ver cm">${d.versiones && d.versiones.length>1?`· ${d.versiones.length} versiones`:''}</span>
          <span class="sr-rel cm">${(d.afectaciones||[]).length?`· ${d.afectaciones.length} relaciones`:''}</span>
        </div>
        <h3 class="sr-title">
          <a href="#/detail/${d.id}" data-goto="${d.id}" class="sr-tit-a">${highlightMulti(d.titulo, terms||[])}</a>
        </h3>
        <div class="sr-sub cm">
          <span><i class="fa-solid fa-building-columns ic-meta" aria-hidden="true"></i> ${escHTML(d.unidad.length>34?d.unidad.slice(0,34)+'…':d.unidad)}</span>
          <span>·</span>
          <span><i class="fa-solid fa-calendar-days ic-meta" aria-hidden="true"></i> ${fmtDate(d.fecha)} · Año ${d.anio}</span>
          <span>·</span>
          <span><i class="fa-solid fa-eye ic-meta" aria-hidden="true"></i> ${(d.consultas||0).toLocaleString('es-CL')} consultas</span>
        </div>
        <div class="sr-frag">
          ${(item.highlightFragments && item.highlightFragments.length ? `<div class="srf-list">
            ${item.highlightFragments.map(f=>`<div class="srf-item"><span class="srf-art mono cm">${f.art}</span><span class="srf-txt">“${highlightMulti(f.texto, terms||[])}${f.texto.length>=210?'…':''}”</span></div>`).join('')}
          </div>` : `<div class="srf-res"><p class="sr-sum">${highlightMulti(d.resumen.slice(0,240), terms||[])}${d.resumen.length>240?'…':''}</p></div>`)}
        </div>
        <div class="sr-tags2">
          ${(d.secciones||[]).slice(0,4).map(s=>`<span class="dot-tag2">${escHTML(s)}</span>`).join('')}
          ${item.matchedFields && item.matchedFields.length?item.matchedFields.slice(0,4).map(m=>`<span class="mf-tag">${escHTML(m)}</span>`).join(''):''}
        </div>

        <details class="sr-why ${whyOpen?'open':''}" ${whyOpen?'open':''}>
          <summary data-why="${d.id}">
            <span>¿Por qué aparece este resultado?</span>
          </summary>
          <div class="sr-why-body">
            <ul class="why-list">
              ${item.matchReasons && item.matchReasons.length ? item.matchReasons.map(mr=>`<li class="why-item ${mr.kind||''}"><span class="why-bul"></span>${escHTML(mr.texto)}</li>`).join('') : `<li class="why-item"><span class="why-bul"></span>Coincidencia por términos en título o contenido.</li>`}
              ${item.relationStatus ? `<li class="why-item relacion"><span class="why-bul"></span>Documento ${escHTML(item.relationStatus.toLowerCase())}</li>` : ''}
              ${d.estado==='Vigente'?`<li class="why-item vigente"><span class="why-bul"></span>Corresponde a una versión vigente del reglamento.</li>`:''}
            </ul>
            ${evMode ? `<div class="eval-scores cm"><span>C0:${item.deterministicSignal}</span><span>C1:${item.lexicalScore}</span><span>C2:${(item.lexicalScore*1.08).toFixed(1)}</span><span>C3:${item.semanticScore}</span><span>C4:${item.scoreFinal}</span></div>` : ''}
          </div>
        </details>

        <div class="sr-ctas">
          <button type="button" class="btn ghost sm" data-srpreview="${d.id}" title="Vista rápida sin abandonar resultados">Vista rápida</button>
          <button type="button" class="btn ghost sm ${saved?'on':''}" data-save="${d.id}" title="Guardar para comparar">${saved?'<i class="fa-solid fa-check ic-meta" aria-hidden="true"></i> Guardado':'<i class="fa-regular fa-star ic-meta" aria-hidden="true"></i> Guardar'}</button>
          <button type="button" class="link sm" data-srcomp="${d.id}">Comparar…</button>
          <button type="button" class="link sm" data-srsim="${d.id}">Documentos similares</button>
          <button type="button" class="link sm" data-srrel="${d.id}">Relacionados</button>
          <button type="button" class="link sm" data-srunidad="${escHTML(d.unidad)}">Misma unidad</button>
          <button type="button" class="link sm" data-srstart="${d.id}" title="Usar como punto de partida de una nueva etapa"><i class="fa-solid fa-bullseye ic-meta" aria-hidden="true"></i> Punto partida</button>
        </div>
      </div>
      <div class="sr-right">
        <button type="button" class="btn primary sm" data-goto-btn="${d.id}">Abrir <i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i></button>
      </div>
    </article>`;
  }

  const results = (!q && arr.length===0 ? `
    <div class="empty-state v3">
      <div class="empty-ic" aria-hidden="true"><i class="fa-solid fa-magnifying-glass ic-meta" aria-hidden="true"></i></div>
      <h3>Comience escribiendo una consulta</h3>
      <p class="cm">Escriba un código, título, concepto o unidad en el buscador superior. También puede navegar por los estantes del home, las colecciones, o explorar los filtros de la izquierda.</p>
      <div class="empty-actions">
        ${CONSULTAS_SUGERIDAS.slice(0,5).map(s=>`<a href="#/search?q=${encodeURIComponent(s.q)}" class="btn ghost">${escHTML(s.q)}</a>`).join('')}
      </div>
    </div>`
  : empty ? `
    <div class="empty-state v3 nores">
      <div class="empty-ic" aria-hidden="true"><i class="fa-solid fa-circle-slash ic-meta" aria-hidden="true"></i></div>
      <h3>No se encontraron documentos</h3>
      <p class="cm">Pruebe quitando filtros muy restrictivos, revisando la escritura, o expandiendo con conceptos relacionados.</p>
      <div class="empty-actions">
        <button type="button" class="btn primary" data-empty-clear>Quitar filtros</button>
        ${sr.relatedTerms && sr.relatedTerms.slice(0,4).map(t=>`<button type="button" class="btn ghost" data-emptyadd="${escHTML(t)}">Buscar: “${escHTML(t)}”</button>`).join('')}
        <a href="#/search?q=reglamento" class="btn ghost">Buscar “reglamento”</a>
      </div>
    </div>`
  : (
    state.search.view==='cards' ? (
      `<div class="cards-grid v3">${slice.map((it,i)=>`<div class="s-card v3" tabindex="0" data-goto="${it.doc.id}" style="--ribc:${colorForTipo(it.doc.tipo)}">
        <div class="sc-body">
          <div class="sc-top">
            <span class="type-pill sm" style="background:${colorForTipo(it.doc.tipo)}15;color:${colorForTipo(it.doc.tipo)}">${escHTML(it.doc.tipo)}</span>
            <span class="mono sc-cod">${escHTML(it.doc.codigo)}</span>
            <span class="status sm ${slug(it.doc.estado)}">${it.doc.estado}</span>
          </div>
          <h3 class="sc-title">${highlightMulti(it.doc.titulo, sr.allTerms||[])}</h3>
          <p class="sc-sum">${highlightMulti(it.doc.resumen.slice(0,160), sr.allTerms||[])}${it.doc.resumen.length>160?'…':''}</p>
          <div class="sc-meta">
            <span><i class="fa-solid fa-building-columns ic-meta" aria-hidden="true"></i> ${escHTML(it.doc.unidad.length>22?it.doc.unidad.slice(0,22)+'…':it.doc.unidad)}</span>
            <span><i class="fa-solid fa-calendar-days ic-meta" aria-hidden="true"></i> ${fmtDate(it.doc.fecha)}</span>
            <span><i class="fa-solid fa-eye ic-meta" aria-hidden="true"></i> ${(it.doc.consultas/1000).toFixed(1)}k</span>
          </div>
          ${it.highlightFragments && it.highlightFragments.length ? `<div class="sc-frag"><blockquote>“${highlightMulti(it.highlightFragments[0].texto.slice(0,110),sr.allTerms||[])}${it.highlightFragments[0].texto.length>110?'…':''}”</blockquote><span class="mono cm sc-frag-art">${escHTML(it.highlightFragments[0].art)}</span></div>`:''}
          <div class="sc-ctas">
            <button type="button" class="btn ghost xs" data-srpreview="${it.doc.id}">Vista rápida</button>
            <button type="button" class="btn ghost xs" data-save="${it.doc.id}">${savedIds.includes(it.doc.id)?'<i class="fa-solid fa-check ic-meta" aria-hidden="true"></i> Guardado':'<i class="fa-regular fa-star ic-meta" aria-hidden="true"></i> Guardar'}</button>
          </div>
        </div>
      </div>`).join('')}
      </div>`)
    : (
      `<div class="srows v3">
        ${slice.map((it,i)=>rowResultV3(it,i)).join('')}
      </div>`
    )
  ));

  const pager = (pages<=1) ? '' : `
    <nav class="pager v3" aria-label="Paginación de resultados">
      <button type="button" class="pg-btn" data-pg="${state.search.page-1}" ${state.search.page<=1?'disabled':''}><i class="fa-solid fa-chevron-left ic-meta" aria-hidden="true"></i> Anterior</button>
      <div class="pg-pages">${Array.from({length:pages},(_,i)=>i+1).map(p=>`<button type="button" class="pg-btn ${p===state.search.page?'cur':''}" data-pg="${p}" ${p===state.search.page?'aria-current="page"':''}>${p}</button>`).join('')}</div>
      <button type="button" class="pg-btn" data-pg="${state.search.page+1}" ${state.search.page>=pages?'disabled':''}>Siguiente <i class="fa-solid fa-chevron-right ic-meta" aria-hidden="true"></i></button>
    </nav>`;

  // =============== BANDEJA DE GUARDADOS =============
  const saveTray = savedIds.length ? `
  <div class="save-tray v3" aria-live="polite">
    <div class="st-left">
      <span class="st-ic"><i class="fa-regular fa-star ic-meta" aria-hidden="true"></i></span>
      <span><strong id="st-count">${savedIds.length}</strong> documento${savedIds.length===1?'':'s'} guardado${savedIds.length===1?'':'s'}
      </span>
    </div>
    <div class="st-docs">
      ${savedIds.slice(0,5).map(id=>{ const d = DOCUMENTOS.find(x=>x.id===id); if(!d) return''; return `<span class="st-chip" title="${escHTML(d.titulo)}"><span class="st-mono">${escHTML(d.codigo)}</span><button class="st-x" data-strmv="${id}" title="Quitar"><i class="fa-solid fa-xmark ic-meta" aria-hidden="true"></i></button></span>`;}).join('')}
    </div>
    <div class="st-ctas">
      <button type="button" class="link sm" data-stview>Ver selección</button>
      <button type="button" class="btn primary xs" data-stcompare ${savedIds.length<2?'disabled':''}${savedIds.length>3?'disabled title="Máximo 3 documentos para comparar"':''}><i class="fa-solid fa-left-right ic-meta" aria-hidden="true"></i> Comparar ${savedIds.length}</button>
      <button type="button" class="link sm danger" data-stclear>Limpiar</button>
    </div>
  </div>` : '';

  // =============== MODO EVALUACIÓN ==============
  const evalPanel = evMode ? `
  <div class="eval-panel v3" aria-label="Modo de evaluación TG">
    <div class="ep-head">
      <h3><i class="fa-solid fa-flask-vial ic-meta" aria-hidden="true"></i> Modo de evaluación (solo para desarrollo TG)</h3>
      <div class="ep-right">
        <span class="cm">Tiempo: <b>${sr.latencyMs}ms</b></span>
        <button type="button" class="link sm" data-eval-off>Salir</button>
      </div>
    </div>
    <div class="ep-configs" role="radiogroup" aria-label="Configuración de recuperación">
      ${['C0','C1','C2','C3','C4','C5'].map(c=>{
        const cur = (state.search._evalConfig||'C4')===c;
        return `<label class="ep-cfg ${cur?'on':''}"><input type="radio" name="cfg" data-evalcfg="${c}" ${cur?'checked':''}/><span class="ep-cl">${c}</span><span class="cm">${c==='C0'?'Explícitas y reglas':c==='C1'?'BM25 léxico':c==='C2'?'BM25F ponderado':c==='C3'?'Denso embeddings':c==='C4'?'Híbrida C0+C1+C3':'Híbrida + reranking'}</span></label>`;
      }).join('')}
    </div>
    ${q && arr.length ? `<div class="ep-cmps">
      <h4 class="ep-h">Comparación de rankings lado a lado (top 6)</h4>
      <div class="ep-cmp-grid">
        ${['C0','C1','C2','C3','C4','C5'].map(config=>{
          const res = searchDocuments(q, state.search.filters, 'relevancia', config).results.slice(0,6);
          return `<div class="ep-col">
            <div class="ep-col-head">${config}</div>
            <ol>${res.map((x,i)=>`<li class="ep-rank"><span class="ep-n">${i+1}</span><span class="ep-t">${escHTML(x.doc.titulo.length>42?x.doc.titulo.slice(0,42)+'…':x.doc.titulo)}</span><span class="ep-s mono cm">${x.scores[config].toFixed(1)}</span></li>`).join('')}</ol>
          </div>`;
        }).join('')}
      </div>
    </div>`:''}
  </div>` : '';

  // =============== DRAWER VISTA RÁPIDA =============
  const previewDrawer = prevDoc ? (()=>{
    const ids = state.search.lastResultIds && state.search.lastResultIds.length ? state.search.lastResultIds : [];
    let pIdx = ids.indexOf(prevDoc.id); if(pIdx<0) pIdx = state.search.lastPreviewIndex>=0 ? state.search.lastPreviewIndex : 0;
    const N = sr.count>0 ? sr.count : ids.length || 1;
    const canPrev = pIdx>0; const canNext = pIdx<(ids.length-1);
    const validas = (prevDoc.afectaciones||[]).filter(a=> (a.estado||'pendiente')==='validado');
    const pendientes = (prevDoc.afectaciones||[]).filter(a=> (a.estado||'pendiente')!=='validado');
    const fragsOk = prevSR && Array.isArray(prevSR.highlightFragments) && prevSR.highlightFragments.length;
    const sinEvidencia = prevSR && prevSR.matchReasons && prevSR.matchReasons.some(r=>r && r.kind==='sin_evidencia');
    return `
  <div class="drawer-mask" data-drwprclose></div>
  <aside class="preview-draw v3" role="dialog" aria-labelledby="pr-title" aria-modal="true" aria-label="Vista rápida de documento">
    <div class="pr-head-sticky">
      <div class="pr-nav">
        <div class="pr-pos cm" aria-live="polite">Resultado <b>${Math.min(N,pIdx+1)}</b> de <b>${N}</b></div>
        <div class="pr-nav-ctas">
          <button type="button" class="icon-btn sm" data-prprev aria-label="Resultado anterior" ${canPrev?'':'disabled'} title="Anterior (tecla flecha izquierda)"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
          <button type="button" class="icon-btn sm" data-prnext aria-label="Resultado siguiente" ${canNext?'':'disabled'} title="Siguiente (tecla flecha derecha)"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
          <button type="button" class="icon-btn" data-drwprclose aria-label="Cerrar vista rápida (Esc)"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        </div>
      </div>
      <div class="pr-head">
        <div class="pr-t">
          <span class="type-pill sm" style="background:${colorForTipo(prevDoc.tipo)}15;color:${colorForTipo(prevDoc.tipo)}">${escHTML(prevDoc.tipo)}</span>
          <span class="mono">${escHTML(prevDoc.codigo)}</span>
          <span class="status sm ${slug(prevDoc.estado)}">${prevDoc.estado}</span>
        </div>
      </div>
    </div>
    <div class="pr-scroll">
      <h3 id="pr-title" class="pr-title">${highlightMulti(prevDoc.titulo, sr.allTerms||[])}</h3>
      <div class="pr-meta cm"><i class="fa-solid fa-building-columns ic-meta" aria-hidden="true"></i> ${escHTML(prevDoc.unidad)} · <i class="fa-solid fa-calendar-days ic-meta" aria-hidden="true"></i> ${fmtDate(prevDoc.fecha)} · <i class="fa-solid fa-eye ic-meta" aria-hidden="true"></i> ${(prevDoc.consultas||0).toLocaleString('es-CL')}</div>
      <div class="pr-res">
        <h4 class="pr-h">Resumen</h4>
        <p>${escHTML(prevDoc.resumen)}</p>
      </div>
      <div class="pr-frags">
        <h4 class="pr-h">Fragmentos relevantes</h4>
        ${fragsOk ? prevSR.highlightFragments.map(hf=>`<div class="pr-frag">
          <div class="srf-art mono cm">${hf.art||''} ${hf.campo?`<span class="tag-cat cm" style="margin-left:6px">Coincidencia en ${escHTML(hf.campo)}</span>`:''}</div>
          <blockquote class="pr-fq">“${highlightMulti(hf.texto,sr.allTerms||[], {exact:true,variant:true,semantic:true})}”</blockquote>
          ${hf.motivo?`<div class="cm pr-frag-reason"><span class="tag-cat tag-new">${escHTML(hf.motivo)}</span></div>`:''}
        </div>`).join('')
        : (sinEvidencia ? `<div class="cm sin-evidencia"><span class="tag-cat tag-warn">Sin evidencia textual</span><p>No se encontró un fragmento textual directo. El documento fue recuperado por similitud conceptual o coincidencia en metadatos.</p></div>` : `<p class="cm">Sin fragmentos precargados.</p>`)}
      </div>
      <div class="pr-versions">
        <h4 class="pr-h">Versiones</h4>
        <ul>${prevDoc.versiones && prevDoc.versiones.length ? prevDoc.versiones.slice().reverse().map((v,i)=>`<li class="pr-ver ${i===0?'cur':''}"><span>v${escHTML(v.v)}</span><span class="cm">${fmtDate(v.fecha)}</span><span class="cm">${escHTML(v.nota)}</span>${i===0?'<span class="tag-cat tag-new">Actual</span>':''}</li>`).join('') : `<li class="cm">Sin versiones</li>`}</ul>
      </div>
      <div class="pr-relations">
        <h4 class="pr-h">Afectaciones y relaciones</h4>
        ${validas.length || pendientes.length ? `<ul>
          ${validas.map(a=>{
            const otro = DOCUMENTOS.find(d=>d.codigo===a.codigo);
            return `<li class="pr-rel-item">
              <span class="tag-cat tag-ok">${escHTML(a.relacion)} · Validada</span>
              <div class="pr-rel-main">
                <b>${escHTML(a.codigo)}</b> · ${escHTML(a.descripcion||'')}
                ${otro ? `<span class="cm">· ${escHTML(otro.unidad||'')} · ${otro.anio||''}</span>` : ''}
              </div>
            </li>`;
          }).join('')}
          ${pendientes.map(a=>{
            const otro = DOCUMENTOS.find(d=>d.codigo===a.codigo);
            return `<li class="pr-rel-item">
              <span class="tag-cat tag-warn">Posible ${escHTML(a.relacion)} · Pendiente validación humana</span>
              <div class="pr-rel-main">
                <b>${escHTML(a.codigo)}</b> · ${escHTML(a.descripcion||'')}
                ${otro ? `<span class="cm">· ${escHTML(otro.unidad||'')} · ${otro.anio||''}</span>` : ''}
              </div>
              <div class="cm pr-rel-note">Relación sugerida · aun no confirmada por el área encargada.</div>
            </li>`;
          }).join('')}
        </ul>` : `<p class="cm">Este documento no registra relaciones documentales validadas.</p>`}
      </div>
    </div>
    <div class="pr-ctas-sticky">
      <a href="#/detail/${prevDoc.id}" class="btn primary">Abrir documento completo <i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i></a>
      <button type="button" class="btn ghost" data-srstart="${prevDoc.id}"><i class="fa-solid fa-bullseye ic-meta" aria-hidden="true"></i> Punto de partida</button>
      <button type="button" class="btn ghost" data-srcomp="${prevDoc.id}"><i class="fa-solid fa-left-right ic-meta" aria-hidden="true"></i> Añadir a comparar</button>
      <button type="button" class="btn ghost ${savedIds.includes(prevDoc.id)?'on':''}" data-save="${prevDoc.id}">${savedIds.includes(prevDoc.id)?'<i class="fa-solid fa-check ic-meta" aria-hidden="true"></i> Guardado':'<i class="fa-regular fa-star ic-meta" aria-hidden="true"></i> Guardar'}</button>
    </div>
  </aside>`;})() : '';

  // ============================ PANEL "MI EXPLORACIÓN" =========================
  const miExploracion = !q && !arr.length && !state.search.trail.length ? '' : (()=>{
    const openDocsUniq = [...new Set(state.search.openDocs||[])];
    const comparedUniq = [...new Set(state.search.comparedDocs||[])];
    return `<details class="mi-exploracion v3 ${showExpl?'open':''}" ${showExpl?'open':''}>
      <summary data-miexp>
        <span><i class="fa-solid fa-compass ic-meta" aria-hidden="true"></i> Mi exploración</span>
        <span class="cm">${state.search.trail.length} pasos · ${openDocsUniq.length} abiertos · ${savedIds.length} guardados</span>
      </summary>
      <div class="mi-body">
        <div class="mi-col">
          <h5>Consultas realizadas</h5>
          <ol class="mi-list">
            ${(state.search.history||[]).slice(0,6).map(h=>`<li><button type="button" class="mi-hist" data-miq="${escHTML(h)}">${escHTML(h.length>42?h.slice(0,42)+'…':h)}</button></li>`).join('') || `<li class="cm">Sin historial.</li>`}
          </ol>
        </div>
        <div class="mi-col">
          <h5>Filtros aplicados</h5>
          <div class="chips-host xs">${chipsHost || `<span class="cm">—</span>`}</div>
        </div>
        <div class="mi-col">
          <h5>Documentos abiertos</h5>
          <ol class="mi-list">${openDocsUniq.map(id=>{const d=DOCUMENTOS.find(x=>x.id===id); return d?`<li><a href="#/detail/${d.id}" class="mi-doc"><span class="mono">${escHTML(d.codigo)}</span> ${escHTML(d.titulo.length>36?d.titulo.slice(0,36)+'…':d.titulo)}</a></li>`:'';}).join('') || `<li class="cm">Aún no abriste documentos.</li>`}</ol>
          <h5 style="margin-top:14px">Guardados (${savedIds.length})</h5>
          <ol class="mi-list">${savedIds.map(id=>{const d=DOCUMENTOS.find(x=>x.id===id); return d?`<li><a href="#/detail/${d.id}" class="mi-doc"><span class="mono">${escHTML(d.codigo)}</span> ${escHTML(d.titulo.length>36?d.titulo.slice(0,36)+'…':d.titulo)}</a></li>`:'';}).join('') || `<li class="cm">Sin guardados.</li>`}</ol>
          <h5 style="margin-top:14px">Comparación (${comparedUniq.length})</h5>
          <div class="cm">${comparedUniq.length ? comparedUniq.join(', ') : 'Ninguno'}</div>
        </div>
        <div class="mi-col mi-actions">
          <button type="button" class="btn ghost sm" data-miclear>Limpiar sesión</button>
          <a href="#/home" class="btn ghost sm">Volver al inicio</a>
        </div>
      </div>
    </details>`;
  })();

  const sortHtml = `
  <div class="srtop v3" aria-label="Cabecera de resultados">
    <div class="srtop-l">
      <h2 class="sr-count">
        <span class="sr-num">${sr.count}</span>
        <span class="sr-label">${sr.count===1?'resultado':'resultados'}</span>
        ${q ? `<span class="cm">para <b>“${escHTML(q)}”</b></span>`:''}
        <span class="cm sr-tiempo">· ${sr.latencyMs}ms</span>
      </h2>
      ${sr.matchedFieldsGlobal && sr.matchedFieldsGlobal.length ? `<div class="mfg-tags cm">Coincide en: ${sr.matchedFieldsGlobal.slice(0,5).map(m=>`<span class="mf-tag">${escHTML(m)}</span>`).join('')}</div>` : ''}
    </div>
    <div class="srtop-r">
      <button type="button" class="btn ghost sm" data-save-search title="Guardar esta búsqueda como bookmark">Guardar búsqueda</button>
      <button type="button" class="btn ghost sm" data-within title="Buscar dentro de estos resultados"><i class="fa-solid fa-corner-down-left ic-meta" aria-hidden="true"></i></button>
      <label class="field sm srtop-sort">
        <span>Orden</span>
        <select data-sortv3 aria-label="Ordenar resultados">
          ${ORDENES_V3.map(o=>`<option value="${o.v}" ${state.search.sort===o.v?'selected':''}>${o.l}</option>`).join('')}
        </select>
      </label>
      <div class="view-toggle v3" role="group" aria-label="Cambiar vista">
        ${TIPOS_VISTA_DOC.map(t=>`<button type="button" class="vt-btn v3 ${state.search.view===t.v?'on':''}" data-view="${t.v}" aria-pressed="${state.search.view===t.v}" title="${t.d}">
          ${t.v==='rows'?'<i class="fa-solid fa-table-list ic-meta" aria-hidden="true"></i> Filas':'<i class="fa-solid fa-grip ic-meta" aria-hidden="true"></i> Tarjetas'}
        </button>`).join('')}
      </div>
      ${(()=>{
        const f = state.search.filters||{}; let n = 0;
        Object.keys(f).forEach(k=>{ if(Array.isArray(f[k])) n+= f[k].length; else if(f[k]) n+=1; });
        n += (state.search.expandedTerms||[]).length + (state.search.selectedChips||[]).length;
        return `<button type="button" class="btn ghost sm" data-open-fdrawer aria-haspopup="dialog" title="Abrir panel de filtros">${n>0?`Filtros (${n})`:'Filtros'}</button>`;
      })()}
    </div>
  </div>`;

  const mainResults = `
    <div id="search-bar-ph"></div>
    <section class="search-bar v3 sticky-search ${state.search.stickyCompact?'compact':''}" id="searchBarV3" aria-label="Buscador persistente">
      <div class="sb-inner">
        <div class="sb-row">
          <div class="scope-wrap v3">
            <button type="button" class="scope-btn v3" id="s3ScopeBtn" aria-haspopup="listbox" aria-expanded="false">
              <span class="sc-ic"><i class="fa-solid fa-magnifying-glass ic-meta" aria-hidden="true"></i></span>
              <span class="sc-label">${scopeL.l}</span>
              <span class="chev down"></span>
            </button>
            <ul class="scope-menu" id="s3ScopeMenu" role="listbox" hidden>
              ${SCOPES_SEARCH_V3.map(s=>`<li role="option" data-scope3="${s.v}" class="${s.v===scope?'on':''}"><span class="sc-ic-sm">${s.i}</span><div><b>${s.l}</b><div class="cm">${s.d}</div></div></li>`).join('')}
            </ul>
          </div>
          <div class="sb-inputwrap">
            <input class="input big v3" id="s3Input" type="text" placeholder="Buscar por código, título, concepto o unidad…" value="${escHTML(q)}" aria-label="Búsqueda documental persistente"/>
            ${q?`<button type="button" class="sb-clear" id="s3Clear" aria-label="Limpiar consulta"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`:''}
          </div>
          <button type="button" class="btn primary v3" id="s3Do">Buscar</button>
          <button type="button" class="btn ghost v3 advtog" id="s3AdvTog" aria-expanded="${!advCollapsed}">${advCollapsed?'Mostrar filtros rápidos':'Ocultar filtros rápidos'}</button>
          <button type="button" class="btn ghost v3" id="s3AdvLink">Búsqueda avanzada…</button>
        </div>
        <div class="sb-row2" ${advCollapsed?'hidden':''}>
          ${['Vigente','Histórico','2024','2023','Postgrado','Pregrado','Finanzas','Investigación'].map(l=>{
            const on = (state.search.selectedChips||[]).includes(l);
            return `<button type="button" class="adv-chip v3 ${on?'on':''}" data-advchip3="${escHTML(l)}"><span class="a-dot"></span>${escHTML(l)}</button>`;
          }).join('')}
        </div>
        <div class="sb-row3">
          <span class="cm sb-recents">Recientes:</span>
          ${(state.search.history||[]).slice(0,5).map(h=>`<button type="button" class="sb-hist-pill" data-sq3="${escHTML(h)}">${escHTML(h.length>32?h.slice(0,32)+'…':h)}</button>`).join('')}
          <span class="kbd cm ml-a"><kbd>/</kbd> enfocar</span>
        </div>
        <div class="sb-suggest" id="s3Suggest" hidden role="listbox" hidden></div>
      </div>
    </section>

    ${evalPanel}

    <div class="slayout v3 ${state.search.facetsDocked?'':'no-facets'}">
      <aside class="facets-wrap v3" aria-label="Filtros facetados" ${state.search.facetsDocked?'':'hidden'}>
        <div class="facets-head v3">
          <div><h3>Filtros</h3><span class="cm facet-count">12 facetas</span></div>
          <div class="fh-actions">
            <button type="button" class="link sm" data-fcollapse>Contraer todo</button>
            <button type="button" class="link sm danger" data-fclearall>Limpiar</button>
            <button type="button" class="link sm" data-fdockoff title="Ocultar panel lateral y usar drawer"><i class="fa-solid fa-chevron-left ic-meta" aria-hidden="true"></i> Ocultar filtros</button>
          </div>
        </div>
        <div class="facets v3">${facets}</div>
      </aside>

      <section class="results-wrap v3">
        ${trailHtml}
        ${miExploracion}
        ${clarHtml}
        ${relatedTermsBox}
        ${sortHtml}
        ${chipsHost}
        ${results}
        ${pager}
      </section>
    </div>
    ${saveTray}
    ${previewDrawer}

    <div id="s3-aria" class="sr" aria-live="polite" aria-atomic="true"></div>
  `;
  return mainResults;
}
function hookFacets(host=document){
  host.querySelectorAll('.facet-head').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const key = btn.closest('.facet-group').dataset.facet;
      const body = btn.closest('.facet-group').querySelector('.facet-body');
      const col = body.hasAttribute('hidden');
      const chev = btn.querySelector('.chev');
      if(col){ body.removeAttribute('hidden'); btn.setAttribute('aria-expanded','true'); chev?.classList.remove('col'); state.search._collapsed[key]=false; }
      else{ body.setAttribute('hidden',''); btn.setAttribute('aria-expanded','false'); chev?.classList.add('col'); state.search._collapsed[key]=true; }
      saveState();
    });
  });
  host.querySelectorAll('[data-fv]').forEach(inp=>{
    inp.addEventListener('change', ()=>{
      const key = inp.dataset.fv; const v = inp.value;
      const prev = state.search.filters[key];
      if(inp.type==='radio'){
        if(inp.checked) state.search.filters[key]=v; else delete state.search.filters[key];
      } else {
        const arr = Array.isArray(prev)?prev.slice():(prev?[prev]:[]);
        if(inp.checked){ if(!arr.includes(v)) arr.push(v); }
        else { const i=arr.indexOf(v); if(i>=0) arr.splice(i,1); }
        if(arr.length===0) delete state.search.filters[key]; else state.search.filters[key]=arr;
      }
      state.search.page = 1;
      if(v && !state.search.trail.every(t=>t.tipo!=='filtro'||t.label!==`${key}: ${v}`)){
        state.search.trail.push({tipo:'filtro',label:`${key}: ${v}`,ts:Date.now(),key,val:v});
      }
      saveState(); renderCurrentView();
    });
  });
  host.querySelectorAll('[data-fgmore]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const moreWrap = btn.closest('.fg-more'); const opts2 = moreWrap.nextElementSibling; const expanded = btn.dataset.expanded==='1';
      if(expanded){ opts2.setAttribute('hidden',''); btn.dataset.expanded='0'; btn.textContent = btn.textContent.replace(/ocultar/i,'Mostrar').replace(/menos|\d+ más/i, (parseInt(btn.textContent.match(/\d+/)||['0'])[0],10)+' más'); }
      else { opts2.removeAttribute('hidden'); btn.dataset.expanded='1'; btn.textContent='Ocultar'; }
    });
  });
  host.querySelectorAll('[data-fgclear]').forEach(b=>b.addEventListener('click', ()=>{
    const k = b.dataset.fgclear; delete state.search.filters[k]; saveState(); renderCurrentView();
  }));
  host.querySelectorAll('[data-fgsearch]').forEach(inp=>{
    inp.addEventListener('input',()=>{ const qq = inp.value.toLowerCase().trim(); const opts = inp.closest('.facet-group').querySelectorAll('.facet-opt');
      opts.forEach(o=>{ const txt = (o.textContent||'').toLowerCase(); o.style.display = txt.includes(qq) ? '' : 'none'; });
    });
  });
}
function hookSearch(){
  hookFacets();
  // ------------- ATAJO GLOBAL / -------------
  document.addEventListener('keydown', (e)=>{
    if(e.key==='/' && e.target && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){
      e.preventDefault();
      const i = $('#s3Input') || $('#s2Input'); i?.focus(); i?.select();
    }
  });
  // ------------- STICKY COMPACTO ----------------------
  const sb = $('#searchBarV3'); const ph = $('#search-bar-ph');
  function onScroll(){
    if(!sb || state.currentRoute.name !== 'search') return;
    const rect = ph.getBoundingClientRect();
    if(rect.top <= 0 && !state.search.stickyCompact){ state.search.stickyCompact = true; sb.classList.add('compact'); saveState(); }
    else if(rect.top > 0 && state.search.stickyCompact){ state.search.stickyCompact = false; sb.classList.remove('compact'); saveState(); }
    state.search.routeSearchScrollY = window.scrollY||0;
    saveState();
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  // Guardar scroll también en cada rastro
  // ------------- doSearch helper (usa la global) ----------
  function doSearch(newQ){ doSearchGlobal(newQ); }
  // ---------- scope menu + suggestions cierre ----------
  const sb3 = $('#s3ScopeBtn'), sm3 = $('#s3ScopeMenu');
  function closeScope(){ sm3?.setAttribute('hidden',''); sb3?.setAttribute('aria-expanded','false');}
  sb3?.addEventListener('click', (e)=>{ e.stopPropagation(); const open = !sm3.hasAttribute('hidden');
    if(open) closeScope(); else { sm3.removeAttribute('hidden'); sb3.setAttribute('aria-expanded','true'); } });
  document.addEventListener('click', (e)=>{
    if(sm3 && !sm3.hasAttribute('hidden') && !sm3.contains(e.target) && !sb3.contains(e.target)) closeScope();
    const sb = $('#s3Suggest'); if(sb && !sb.hidden){
      const inp = $('#s3Input');
      if(!sb.contains(e.target) && (!inp || !inp.contains(e.target))) closeSuggestions();
    }
  });
  $$('[data-scope3]').forEach(li=>li.addEventListener('click', ()=>{
    state.search.scope = li.dataset.scope3; saveState(); closeScope(); setTimeout(()=>$('#s3Input')?.focus(),30); renderCurrentView();
  }));
  $('#s3Input')?.addEventListener('keydown', e=>{ if(e.key==='Enter'){ closeSuggestions(); doSearch(); } else if(e.key==='Escape'){ closeSuggestions(); } });
  $('#s3Input')?.addEventListener('input', e=>{
    const t = e.target.value; state.search.query = t; renderS3Suggestions(t);
  });
  $('#s3Do')?.addEventListener('click', ()=>doSearch());
  $('#s3Clear')?.addEventListener('click', ()=>{ $('#s3Input').value=''; doSearch(''); });
  $('#s3AdvTog')?.addEventListener('click', ()=>{
    state.search.advancedOpen = state.search.advancedOpen===false?true:false; saveState(); renderCurrentView();
  });
  // Adv chips, recent pills
  $$('[data-advchip3]').forEach(b=>b.addEventListener('click', ()=>{
    const l = b.dataset.advchip3; const arr = (state.search.selectedChips||[]).slice();
    const i = arr.indexOf(l); if(i>=0) arr.splice(i,1); else arr.push(l);
    state.search.selectedChips = arr; saveState(); renderCurrentView();
  }));
  $$('[data-sq3]').forEach(b=>b.addEventListener('click', ()=>doSearch(b.dataset.sq3)));

  // Sort & view
  $('[data-sortv3]')?.addEventListener('change', e=>{ state.search.sort=e.target.value; state.search.page=1; saveState(); renderCurrentView(); });
  $$('[data-view]').forEach(b=>b.addEventListener('click', ()=>{ state.search.view = b.dataset.view; saveState(); renderCurrentView(); }));

  // Chips host
  $('[data-chip-clearq]')?.addEventListener('click', ()=>{ state.search.query=''; state.search.page=1; saveState(); renderCurrentView(); });
  $$('.chip-x[data-chip-idx]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = parseInt(btn.dataset.chipIdx,10);
      const entries=[]; const f=state.search.filters; Object.keys(f).forEach(k=>{ const vs = Array.isArray(f[k])?f[k]:[f[k]]; vs.forEach(v=>{ if(v) entries.push({kind:'f',k,v});});});
      (state.search.expandedTerms||[]).forEach(t=>entries.push({kind:'t',v:t}));
      const it = entries[idx]; if(!it) return;
      if(it.kind==='f'){ const prev=state.search.filters[it.k]; const arr = Array.isArray(prev)?prev.slice():(prev?[prev]:[]); const i2=arr.indexOf(it.v); if(i2>=0) arr.splice(i2,1); if(arr.length===0) delete state.search.filters[it.k]; else state.search.filters[it.k]=arr; }
      else { const a = (state.search.expandedTerms||[]).slice(); const i3=a.indexOf(it.v); if(i3>=0) a.splice(i3,1); state.search.expandedTerms=a; }
      state.search.page=1; saveState(); renderCurrentView();
    });
  });
  $('[data-clear-chips]')?.addEventListener('click', ()=>{
    state.search.filters={}; state.search.expandedTerms=[]; state.search.selectedChips=[]; state.search.page=1; saveState(); renderCurrentView();
    toast('Limpiados filtros, términos y chips.',{kind:'info',title:'Filtros'});
  });

  // Trail
  $$('[data-trailst]').forEach(b=>b.addEventListener('click', ()=>{
    const i = parseInt(b.dataset.trailst,10); const step = state.search.trail[i]; if(!step) return;
    state.search.trail = state.search.trail.slice(0,i+1);
    if(step.tipo==='consulta'){ state.search.query = step.q||step.label; }
    else if(step.tipo==='filtro' && step.key){ const vals = Array.isArray(state.search.filters[step.key])?state.search.filters[step.key]:(state.search.filters[step.key]?[state.search.filters[step.key]]:[]);
      state.search.filters[step.key] = vals.filter(v=>v!==step.val);
      if(!state.search.filters[step.key]?.length) delete state.search.filters[step.key];
    }
    state.search.page=1; saveState(); renderCurrentView();
  }));
  $$('[data-trailrm]').forEach(b=>b.addEventListener('click', e=>{ e.stopPropagation(); const i=parseInt(b.dataset.trailrm,10); state.search.trail.splice(i,1); saveState(); renderCurrentView(); }));
  $('[data-trail-toggle]')?.addEventListener('click', ()=>{ state.search.showExploracion = !state.search.showExploracion; saveState(); renderCurrentView(); });

  // Clarification box
  $$('[data-clarv]').forEach(b=>b.addEventListener('click', ()=>{
    const extra = b.dataset.clarq || '';
    state.search._clarification = b.dataset.clarv;
    if(extra){ state.search.expandedTerms = [...new Set([...(state.search.expandedTerms||[]), ...extra.split(/\s+/).filter(Boolean)])].slice(0,8); }
    saveState(); renderCurrentView();
  }));
  $('[data-clarskip]')?.addEventListener('click', ()=>{ state.search._clarification = 'skip'; saveState(); renderCurrentView(); });

  // Related terms chips
  $$('[data-rt]').forEach(b=>b.addEventListener('click', ()=>{
    const t = b.dataset.rt; const a = (state.search.expandedTerms||[]).slice();
    const i = a.indexOf(t); if(i>=0) a.splice(i,1); else a.push(t); state.search.expandedTerms = a; saveState(); renderCurrentView();
  }));
  $$('[data-rmx]').forEach(b=>b.addEventListener('click', ()=>{
    const t = b.dataset.rmx; const a = (state.search.expandedTerms||[]).slice();
    const i = a.indexOf(t); if(i>=0) a.splice(i,1); state.search.expandedTerms=a; saveState(); renderCurrentView();
  }));

  // Why panel toggles + save tray
  $$('[data-why]').forEach(s=>s.addEventListener('click', e=>{
    e.preventDefault(); const id = s.dataset.why; state.search.whyOpenDocId = (state.search.whyOpenDocId===id)?null:id; saveState();
    const det = s.closest('details'); if(det){ const isOp = det.hasAttribute('open'); setTimeout(()=>{ if(isOp){ det.removeAttribute('open');} else { det.setAttribute('open',''); }},0);}
  }));

  // Abrir detalle
  $$('[data-goto]').forEach(el=>{
    const f = ()=>{ state.search.routeSearchScrollY = window.scrollY||0; saveState(); navigateTo('#/detail/'+el.dataset.goto); };
    el.addEventListener('click', f);
    el.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault(); f();}});
  });
  $$('[data-goto-btn]').forEach(b=>b.addEventListener('click', e=>{ e.stopPropagation(); state.search.routeSearchScrollY = window.scrollY||0; saveState(); navigateTo('#/detail/'+b.dataset.gotoBtn); }));

  // Preview drawer + single drawer invariant
  function closeOtherDrawersForPreview(){
    closeScope(); closeSuggestions();
    const fd = $('#filterDrawer'); if(fd && !fd.hidden){ fd.hidden = true; }
    state.search.filterDrawerOpen = false;
  }
  function lockBodyIfDrawer(){
    const anyOpen = !!state.search.previewDocId || !!state.search.filterDrawerOpen;
    document.body.classList.toggle('drawer-open', anyOpen);
  }
  $$('[data-srpreview]').forEach(b=>b.addEventListener('click', e=>{
    e.stopPropagation();
    closeOtherDrawersForPreview();
    state.search._scrollBeforeDrawer = window.scrollY||0;
    state.search._focusBeforeDrawer = document.activeElement;
    state.search.previewDocId = b.dataset.srpreview;
    const i = (state.search.lastResultIds||[]).indexOf(b.dataset.srpreview); if(i>=0) state.search.lastPreviewIndex = i;
    saveState(); renderCurrentView();
    setTimeout(()=>{ lockBodyIfDrawer();
      const firstBtn = $('.preview-draw.v3 .icon-btn, .preview-draw.v3 .btn'); firstBtn && firstBtn.focus && firstBtn.focus();
    }, 20);
  }));
  function closePreviewDrawer(){
    state.search.previewDocId = null; saveState(); renderCurrentView();
    setTimeout(()=>{ lockBodyIfDrawer();
      try { if(state.search._focusBeforeDrawer && state.search._focusBeforeDrawer.focus){ state.search._focusBeforeDrawer.focus();} }catch(e){}
      if(state.search._scrollBeforeDrawer>0){ try{ window.scrollTo(0,state.search._scrollBeforeDrawer);}catch(e){} }
    }, 10);
  }
  $$('[data-drwprclose]').forEach(el=> el?.addEventListener('click', closePreviewDrawer));
  $('[data-prprev]')?.addEventListener('click', ()=>{
    const ids = state.search.lastResultIds||[]; let idx = ids.indexOf(state.search.previewDocId);
    if(idx<=0) return; idx -= 1; state.search.previewDocId = ids[idx]; state.search.lastPreviewIndex = idx; saveState(); renderCurrentView();
  });
  $('[data-prnext]')?.addEventListener('click', ()=>{
    const ids = state.search.lastResultIds||[]; let idx = ids.indexOf(state.search.previewDocId);
    if(idx<0 || idx>=ids.length-1) return; idx += 1; state.search.previewDocId = ids[idx]; state.search.lastPreviewIndex = idx; saveState(); renderCurrentView();
  });
  document.addEventListener('keydown', e=>{
    const tag = (e.target && e.target.tagName) || '';
    if(e.key==='Escape' && state.search.previewDocId){ e.preventDefault(); closePreviewDrawer(); }
    else if(e.key==='Escape' && state.search.filterDrawerOpen){ e.preventDefault(); closeFilterDrawer(); }
    else if(state.search.previewDocId && !['INPUT','TEXTAREA','SELECT'].includes(tag)){
      if(e.key==='ArrowLeft'){ const btn=$('[data-prprev]'); btn && !btn.disabled && btn.click(); }
      else if(e.key==='ArrowRight'){ const btn=$('[data-prnext]'); btn && !btn.disabled && btn.click(); }
    }
  });

  // Guardar (sin límite), bandeja, comparar (máx 3)
  $$('[data-save]').forEach(b=>b.addEventListener('click', e=>{
    e.stopPropagation(); const id = b.dataset.save; const arr = (state.search.savedDocs||[]).slice();
    const i = arr.indexOf(id); if(i>=0) arr.splice(i,1); else arr.push(id);
    state.search.savedDocs = arr; saveState(); renderCurrentView();
    toast(i>=0?'Quitado de guardados.':'Documento guardado.',{kind:i>=0?'info':'ok',title:'Guardar'});
  }));
  $$('[data-strmv]').forEach(b=>b.addEventListener('click', ()=>{
    const id=b.dataset.strmv; const arr=(state.search.savedDocs||[]).slice(); const i=arr.indexOf(id); if(i>=0) arr.splice(i,1); state.search.savedDocs=arr; saveState(); renderCurrentView();
  }));
  $('[data-stclear]')?.addEventListener('click', ()=>{ state.search.savedDocs=[]; saveState(); renderCurrentView(); });
  $('[data-stcompare]')?.addEventListener('click', ()=>{ const n=(state.search.savedDocs||[]).length; n>=2 ? openCompareMulti(state.search.savedDocs) : toast('Seleccione al menos 2 documentos.',{kind:'info'}); });
  // Más acciones (simo y punto partida)
  $$('[data-srcomp]').forEach(b=>b.addEventListener('click', e=>{
    e.stopPropagation(); const id=b.dataset.srcomp; const arr=(state.search.savedDocs||[]).slice();
    if(!arr.includes(id)){ if(arr.length>=3){ toast('Máximo 3 documentos para comparar. Retire uno antes de añadir.',{kind:'warn',title:'Límite de comparación'}); return;} arr.push(id); state.search.savedDocs=arr; saveState(); renderCurrentView();
    toast('Añadido a bandeja de comparación.',{kind:'ok'});}
    else {toast('Ya está añadido a comparar.',{kind:'info'}); }
  }));
  $$('[data-srsim]').forEach(b=>b.addEventListener('click', e=>{ e.stopPropagation(); const d=DOCUMENTOS.find(x=>x.id===b.dataset.srsim); if(!d) return;
    const q = (d.keywords && d.keywords[0]) || (d.secciones && d.secciones[0]) || d.tipo;
    doSearch(q); toast(`Buscando documentos similares…`,{kind:'info',title:'Similares'});
  }));
  $$('[data-srrel]').forEach(b=>b.addEventListener('click', e=>{ e.stopPropagation(); const d=DOCUMENTOS.find(x=>x.id===b.dataset.srrel); if(!d || !d.afectaciones?.length){ toast('Este documento no tiene relaciones registradas.',{kind:'info'}); return;}
    state.search._focusChange = CANDIDATOS.find(c=>c.docCandId===d.id)?.id || null; saveState(); navigateTo('#/review');
  }));
  $$('[data-srunidad]').forEach(b=>b.addEventListener('click', e=>{ e.stopPropagation();
    const u=b.dataset.srunidad; state.search.filters.unidad = [u]; state.search.page=1; if(!state.search.trail.some(t=>t.tipo==='filtro' && t.val===u)){ state.search.trail.push({tipo:'filtro',label:`Unidad: ${u}`,ts:Date.now(),key:'unidad',val:u});} saveState(); renderCurrentView();
  }));
  $$('[data-srstart]').forEach(b=>b.addEventListener('click', e=>{
    e.stopPropagation(); const d=DOCUMENTOS.find(x=>x.id===b.dataset.srstart); if(!d) return;
    const q = [d.tipo, d.unidad.split(' ').slice(-2).join(' '), (d.secciones||[''])[0]].filter(Boolean).join(' ');
    state.search.trail.push({tipo:'pivote',label:`Desde: ${d.codigo}`,ts:Date.now(),docId:d.id});
    saveState(); doSearch(q);
    toast('Nueva etapa: usaste este documento como punto de partida.',{kind:'ok',title:'Punto de partida'});
  }));

  // Mi exploración
  $('[data-miexp]')?.addEventListener('click', ()=>{ setTimeout(()=>{ state.search.showExploracion = !state.search.showExploracion; saveState();},0);});
  $$('[data-miq]').forEach(b=>b.addEventListener('click', ()=>doSearch(b.dataset.miq)));
  $('[data-miclear]')?.addEventListener('click', ()=>{
    state.search.trail=[]; state.search.openDocs=[]; state.search.savedDocs=[]; state.search.expandedTerms=[]; state.search.filters={}; state.search.query=''; state.search.page=1; saveState(); renderCurrentView();
    toast('Sesión de exploración limpiada.',{kind:'info',title:'Mi exploración'});
  });

  // Paginación
  $$('[data-pg]').forEach(b=>b.addEventListener('click', ()=>{
    const p = parseInt(b.dataset.pg,10); if(!p || b.disabled) return; state.search.page=p; saveState(); renderCurrentView();
    setTimeout(()=>{
      const rect = $('#searchBarV3')?.getBoundingClientRect();
      if(rect) window.scrollTo({top:Math.max(0, rect.top + window.scrollY - 70), behavior:'smooth'});
    }, 10);
  }));
  $('[data-empty-clear]')?.addEventListener('click', ()=>{ state.search.filters={}; state.search.query=''; state.search.page=1; state.search.selectedChips=[]; state.search.expandedTerms=[]; saveState(); renderCurrentView(); });
  $$('[data-emptyadd]').forEach(b=>b.addEventListener('click', ()=>{ const t=b.dataset.emptyadd; const a=(state.search.expandedTerms||[]).slice(); if(!a.includes(t)) a.push(t); state.search.expandedTerms=a; state.search.page=1; saveState(); renderCurrentView();}));
  $('[data-save-search]')?.addEventListener('click', ()=>toast('Búsqueda guardada (demo · bookmarklet).',{kind:'ok',title:'Guardar búsqueda'}));
  $('[data-within]')?.addEventListener('click', ()=>toast('Buscar dentro de estos resultados (demo).',{kind:'info'}));

  // Facets docking (F1)
  $('[data-fdockoff]')?.addEventListener('click', ()=>{
    state.search.facetsDocked = false; saveState(); renderCurrentView();
    setTimeout(()=>lockBodyIfDrawer(),10);
  });
  function openFilterDrawer(){
    closePreviewDrawer(); closeScope(); closeSuggestions();
    state.search._scrollBeforeDrawer = window.scrollY||0;
    state.search._focusBeforeDrawer = document.activeElement;
    state.search.filterDrawerOpen = true;
    state.search.facetsDocked = false;
    saveState();
    // Re-render para generar los facets, luego inyectar en drawer body
    renderCurrentView(false);
    setTimeout(()=>{
      const hostFacets = document.querySelector('.facets.v3'); const drawerBody = $('#drawerFacets');
      if(hostFacets && drawerBody){ drawerBody.innerHTML = hostFacets.innerHTML; hookFacets(drawerBody); }
      const fd = $('#filterDrawer'); if(fd){ fd.hidden=false; fd.setAttribute('role','dialog'); }
      const applyBtn = $('#drawerApply');
      try { const sr = document.querySelector('.sr-num'); const cnt = sr ? parseInt(sr.textContent||'0',10) : 0;
        if(applyBtn) applyBtn.textContent = cnt>0 ? `Ver ${cnt} resultados` : 'Ver resultados';
      }catch(e){}
      lockBodyIfDrawer();
      try{ document.querySelector('#filterDrawer .icon-btn')?.focus(); }catch(e){}
    }, 40);
  }
  function closeFilterDrawer(){
    const fd = $('#filterDrawer'); if(fd) fd.hidden = true;
    state.search.filterDrawerOpen = false; saveState();
    setTimeout(()=>{ lockBodyIfDrawer();
      try { if(state.search._focusBeforeDrawer && state.search._focusBeforeDrawer.focus){ state.search._focusBeforeDrawer.focus();} }catch(e){}
      try{ if(state.search._scrollBeforeDrawer>0) window.scrollTo(0,state.search._scrollBeforeDrawer);}catch(e){}
    }, 10);
  }
  // Sobrescribe openDrawer global si existe
  if(typeof window.openDrawer !== 'function'){ window.openDrawer = openFilterDrawer; }
  $('[data-open-fdrawer]')?.addEventListener('click', ()=>openFilterDrawer());
  $('[data-fdockon]')?.addEventListener('click', ()=>{
    state.search.facetsDocked = true; closeFilterDrawer(); saveState(); renderCurrentView();
    toast('Panel acoplado a la izquierda.',{kind:'ok',title:'Filtros'});
  });
  // data-close-drawer (backdrop y cerrar icon)
  $$('#filterDrawer [data-close-drawer]').forEach(el=>el.addEventListener('click', closeFilterDrawer));
  $('#drawerClear')?.addEventListener('click', ()=>{ state.search.filters={}; state.search.expandedTerms=[]; state.search.selectedChips=[]; saveState(); renderCurrentView();
    setTimeout(()=>{ const hostFacets = document.querySelector('.facets.v3'); const drawerBody = $('#drawerFacets'); if(hostFacets && drawerBody){ drawerBody.innerHTML = hostFacets.innerHTML; hookFacets(drawerBody);} }, 20);
    toast('Filtros limpiados.',{kind:'info',title:'Filtros'});
  });

  $('[data-fcollapse]')?.addEventListener('click', ()=>{
    const ks = Object.keys(state.search._collapsed||{}); ks.forEach(k=>state.search._collapsed[k]=true); saveState(); renderCurrentView();
  });
  $('[data-fclearall]')?.addEventListener('click', ()=>{ state.search.filters={}; state.search.expandedTerms=[]; state.search.selectedChips=[]; saveState(); renderCurrentView(); });

  // Lock inicial
  lockBodyIfDrawer();

  // Evaluation mode
  $('[data-eval-off]')?.addEventListener('click', ()=>{
    state.search.evaluationMode=false; delete state.search._evalConfig; saveState();
    const cur = searchToURL().replace(/[?&]evaluation=1/g,'').replace(/[?&]config=[^&]+/g,''); location.hash = cur || '#/search';
  });
  $$('[data-evalcfg]').forEach(r=>r.addEventListener('change', ()=>{
    state.search._evalConfig = r.dataset.evalcfg; saveState(); renderCurrentView();
  }));
}

/* =========================================================
   9. VISTA C · DETALLE DOCUMENTAL
   ========================================================= */
function renderDetail(id){
  const d = DOCUMENTOS.find(x=>x.id===id) || DOCUMENTOS[0];
  const q = state.search.query;
  const secciones = (d.secciones||[]).map((s,i)=>`<li><a href="#sec-${i}">${escHTML(s)}</a></li>`).join('');
  const arts = (d.articulos||[]).map((t,i)=>`
    <article class="art-card" data-art-card="${i+1}">
      <header class="art-card-head">
        <span class="art-num">Art. ${i+1}</span>
        <span class="art-go" data-art-goto="${i+1}" title="Ver en el visor"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></span>
      </header>
      <p class="art-card-body">${highlight(t,q)}</p>
    </article>`).join('');
  const artsEmpty = arts || `<div class="cm empty-inline">No se han cargado artículos para este documento.</div>`;

  const artsListToc = (d.articulos||[]).map((t,i)=>`
    <li>
      <button class="toc-art" data-art-goto="${i+1}" title="${escHTML(t.slice(0,120))}">
        <span class="toc-art-n">${i+1}</span>
        <span class="toc-art-t">${highlight(t.slice(0,70),q)}${t.length>70?'…':''}</span>
      </button>
    </li>`).join('') || `<li class="cm">Sin artículos.</li>`;

  // ====================== DOCUMENTOS QUE DEROGAN A ESTE (SURROGATE) ======================
  const docsDerogan = DOCUMENTOS.filter(o =>
    (o.afectaciones||[]).some(a => a.codigo === d.codigo &&
      /^Deroga$/i.test(String(a.relacion || '')))
  ).map(o => {
    const rel = (o.afectaciones||[]).find(a => a.codigo === d.codigo);
    return { ...o, _rel: rel };
  });
  const hasDerogatorios = docsDerogan.length > 0;

  const surrogateDeroga = !hasDerogatorios ? '' : `
    <aside class="rel-surrogate" aria-label="Documentos que derogan a este documento">
      <header class="rs-head">
        <div class="rs-head-left">
          <span class="rs-icon" aria-hidden="true"><i class="fa-solid fa-triangle-exclamation"></i></span>
          <div class="rs-head-text">
            <h4 class="rs-title">Este documento <b>ha sido derogado</b></h4>
            <p class="rs-sub">Queda sin efecto por los siguientes documentos posteriores publicados oficialmente.</p>
          </div>
        </div>
        <div class="rs-count" aria-label="Cantidad de documentos derogatorios">
          <span class="rs-count-num">${docsDerogan.length}</span>
          <span class="rs-count-lbl">documento${docsDerogan.length!==1?'s':''}</span>
        </div>
      </header>
      <ul class="rs-list">
        ${docsDerogan.map(o=>{
          const c = colorForTipo(o.tipo);
          return `
            <li class="rs-card">
              <span class="rs-monogram" style="background:${c}18;color:${c}">${escHTML(monogramFor(o))}</span>
              <div class="rs-body">
                <div class="rs-row1">
                  <span class="rs-badge-tipo" style="background:${c}15;color:${c}">${escHTML(o.tipo)}</span>
                  <span class="rs-codigo mono">${escHTML(o.codigo)}</span>
                  <span class="rs-fecha cm"><i class="fa-regular fa-calendar ic-meta" aria-hidden="true"></i> ${fmtDate(o.fecha)}</span>
                  <span class="rs-estado ${slug(o.estado)}"><i class="fa-solid ${o.estado==='Vigente'?'fa-circle-check':''} ic-meta" aria-hidden="true"></i> ${o.estado}</span>
                </div>
                <a class="rs-titulo" href="#/detail/${encodeURIComponent(o.id)}" title="${escHTML(o.titulo)}">${highlight(o.titulo,q)}</a>
                <div class="rs-row3">
                  <span class="rs-unidad cm"><i class="fa-solid fa-building ic-meta" aria-hidden="true"></i> ${escHTML(o.unidad)}</span>
                  <span class="rs-rel-tag">
                    <i class="fa-solid fa-arrow-up-right-from-square ic-meta" aria-hidden="true"></i>
                    ${escHTML( (o._rel?.relacion) || 'Deroga')} · ${escHTML( (o._rel?.descripcion) || o.tipo )}
                  </span>
                </div>
              </div>
              <a class="rs-goto" href="#/detail/${encodeURIComponent(o.id)}" title="Abrir documento derogatorio" aria-label="Abrir documento derogatorio">
                <i class="fa-solid fa-chevron-right ic-meta" aria-hidden="true"></i>
              </a>
            </li>`;
        }).join('')}
      </ul>
      <footer class="rs-foot cm">
        <i class="fa-solid fa-info-circle ic-meta" aria-hidden="true"></i>
        Consulte siempre el documento oficial más reciente para efectos jurídicos y administrativos.
      </footer>
    </aside>`;

  // ====================== DOCUMENTOS SIMILARES (SURROGATE) ======================
  const docKeywords = new Set([
    slug(d.tipo||''),
    slug(d.unidad||''),
    ...String(d.titulo||'').toLowerCase().split(/\s+/).filter(w=>w.length>=5),
    ...String(d.resumen||'').toLowerCase().split(/\s+/).filter(w=>w.length>=5),
  ]);
  const simScore = (o) => {
    if (o.id === d.id) return -1;
    let score = 0;
    if (o.tipo === d.tipo) score += 12;
    if (o.unidad === d.unidad) score += 10;
    if (String(o.estado).toLowerCase() === String(d.estado).toLowerCase()) score += 4;
    const yearDiff = Math.abs((o.anio||0) - (d.anio||0));
    if (yearDiff <= 1) score += 5; else if (yearDiff <= 3) score += 2;
    const oTokens = [
      ...String(o.titulo||'').toLowerCase().split(/\s+/).filter(w=>w.length>=5),
      ...String(o.resumen||'').toLowerCase().split(/\s+/).filter(w=>w.length>=5),
    ];
    for (const t of oTokens) if (docKeywords.has(t)) score += 1;
    return score;
  };
  const docsSimilares = DOCUMENTOS
    .map(o => ({ o, s: simScore(o) }))
    .filter(x => x.s > 0)
    .sort((a,b)=> b.s - a.s)
    .slice(0, 10)
    .map(x => ({ ...x.o, _score: x.s }));
  const hasSimilares = docsSimilares.length > 0;
  const surrogateSimilares = !hasSimilares ? '' : (() => {
    const cards = docsSimilares.map(o=>{
      const c = colorForTipo(o.tipo);
      const simLabel = o.unidad === d.unidad ? 'Misma unidad' : o.tipo === d.tipo ? 'Mismo tipo' : 'Por tema';
      return `
        <li class="dm-card">
          <a href="#/detail/${encodeURIComponent(o.id)}" class="dm-card-inner" title="Abrir documento similar · ${escHTML(o.titulo)}">
            <div class="dm-cover" style="--cov-c:${c}">
              <div class="dm-cover-bg"></div>
              <i class="fa-solid fa-file-lines dm-cover-icon" aria-hidden="true"></i>
              <span class="dm-cover-mono">${escHTML(monogramFor(o))}</span>
              <span class="dm-cover-codigo mono">${escHTML(o.codigo)}</span>
              <span class="dm-cover-corner" aria-hidden="true"></span>
            </div>
            <div class="dm-badges">
              <span class="dm-tipo" style="background:${c}14;color:${c}">${escHTML(o.tipo)}</span>
              <span class="dm-estado ${slug(o.estado)}">${escHTML(o.estado)}</span>
            </div>
            <h5 class="dm-titulo">${escHTML(o.titulo)}</h5>
            <div class="dm-meta-row">
              <span class="dm-meta-k"><i class="fa-regular fa-calendar ic-meta" aria-hidden="true"></i>${fmtDate(o.fecha)}</span>
            </div>
            <div class="dm-meta-row">
              <span class="dm-meta-k dm-unidad"><i class="fa-regular fa-building ic-meta" aria-hidden="true"></i>${escHTML(o.unidad)}</span>
            </div>
            <div class="dm-foot">
              <span class="dm-razon" title="Razón de la sugerencia"><i class="fa-solid fa-crosshairs ic-meta" aria-hidden="true"></i>${simLabel}</span>
              <span class="dm-cta">Ver documento<i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
            </div>
          </a>
        </li>`;
    }).join('');
    return `
    <section class="dm-section" aria-label="Documentos similares de interés">
      <header class="dm-head">
        <div class="dm-head-text">
          <h4 class="dm-title">Documentos similares de <b>interés</b></h4>
          <p class="dm-sub">Sugeridos por tipo documental, unidad responsable, año y coincidencia temática. Versiones, reemplazos y derogaciones se muestran en su sección correspondiente del detalle.</p>
        </div>
        <div class="dm-head-meta">
          <span class="dm-count" aria-label="Cantidad de documentos similares sugeridos">
            <b class="dm-count-num">${docsSimilares.length}</b>
            <span class="dm-count-lbl">documento${docsSimilares.length!==1?'s':''}</span>
          </span>
        </div>
      </header>
      <div class="dm-carousel" data-dm-carousel>
        <button class="dm-nav dm-nav--prev" type="button" data-dm-nav="prev" aria-label="Desplazar a documentos anteriores">
          <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <ul class="dm-track" data-dm-track role="list" tabindex="0" aria-label="Lista de documentos similares. Use flechas de navegación o desplazamiento horizontal para explorar.">
          ${cards}
        </ul>
        <button class="dm-nav dm-nav--next" type="button" data-dm-nav="next" aria-label="Desplazar a documentos siguientes">
          <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
    </section>`;
  })();

  // ====================== PESTAÑA 2: METADATOS · AGRUPADA ======================
  // Grupo A. Identificación documental
  const grupoIdent = [
    ['Identificador', `<span class="mono md-mono">${escHTML(d.codigo)}</span>`],
    ['Tipo documental', `${escHTML(d.tipo)}`],
    ['Unidad responsable', escHTML(d.unidad)],
    ['Fecha de emisión', fmtDate(d.fecha)],
    ['Año normativo', String(d.anio)]
  ];
  // Grupo B. Estado y disponibilidad
  const grupoEstado = [
    ['Estado de vigencia', `<b class="${slug(d.estado)} md-st">${d.estado}</b>`],
    ['Disponibilidad', `<b class="${slug(d.disponibilidad)} md-st">${d.disponibilidad}</b>`],
    ['Versión actual', `v${(d.versiones||[]).slice(-1)[0]?.v || '1.0'} · ${fmtDate((d.versiones||[]).slice(-1)[0]?.fecha || d.fecha)}`]
  ];
  // Grupo C. Clasificación y recuperación
  const grupoClasif = [
    ['Área temática', d.area || 'Académica · Pregrado'],
    ['Palabras clave', (d.keywords?.length ? d.keywords.join(' · ') : 'Admisión · Ingreso · Pregrado · Cupos PACE · Ponderaciones')],
    ['Normativa de referencia', d.refLegal || 'Ley 20.027 · Estatutos institucionales vigentes']
  ];
  // Grupo D. Información del sistema
  const grupoSistema = [
    ['Consultas totales', (d.consultas||0).toLocaleString('es-CL') + ' visualizaciones'],
    ['Incorporación al repositorio', fmtDate(sumarDias(d.fecha, 7))],
    ['Última actualización', fmtDate((d.versiones||[]).slice(-1)[0]?.fecha || d.fecha)]
  ];

  function mdGroup(iconCls, title, rows, sub='') {
    const body = rows
      .map(([k,v])=>`<div class="md-row"><div class="md-k">${k}</div><div class="md-v">${v}</div></div>`)
      .join('');
    return `
      <section class="md-group" aria-labelledby="mdg-${slug(title)}">
        <div class="md-group-head">
          <h3 class="md-group-h" id="mdg-${slug(title)}"><i class="fa-solid ${iconCls} ic-meta" aria-hidden="true"></i> ${escHTML(title)}</h3>
          ${sub ? `<span class="md-group-sub">${escHTML(sub)}</span>` : ''}
        </div>
        <div class="md-grid">${body}</div>
      </section>`;
  }

  // Bloque Fuente y procedencia: detectamos qué campos existen efectivamente
  const camposProv = [];
  // Institución origen (informada por d.unidad = Facultad/Vicerrectoría)
  camposProv.push(['Institución de origen', 'Universidad de Santiago de Chile']);
  camposProv.push(['Unidad emisora', escHTML(d.unidad)]);
  // Portal de procedencia / repositorio: no tenemos dato explícito, lo marcamos
  const portalRepo = d.portalOrigen || null;
  if (portalRepo) {
    camposProv.push(['Portal de procedencia', escHTML(portalRepo)]);
  }
  // URL registro original: no tenemos d.origenUrl ni d.transparenciaUrl
  const origRegUrl = d.origenUrl || d.transparenciaUrl || null;
  // URL PDF fuente oficial (si existe, diferenciada del registro)
  const pdfUrl = d.pdfPath || d.pdf || null;
  // Fecha incorporación
  const fechaIncorp = sumarDias(d.fecha, 7);

  const provAvailable = !!(portalRepo || origRegUrl || pdfUrl);
  // Campo PDF se presenta separado: "Documento original (PDF)" si corresponde
  const provRows = [
    ['Institución de origen', 'Universidad de Santiago de Chile'],
    ['Unidad responsable', escHTML(d.unidad)],
    ['Fuente del documento', pdfUrl
      ? `<a class="md-cta-fuente" href="${escHTML(pdfUrl)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-file-pdf ic-meta" aria-hidden="true"></i> Consultar documento original (PDF)</a>`
      : `<span class="cm" style="color:var(--ink-3)">No disponible · PDF fuente oficial no incorporado</span>`],
    ['Registro institucional', origRegUrl
      ? `<a class="md-cta-fuente" href="${escHTML(origRegUrl)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-up-right-from-square ic-meta" aria-hidden="true"></i> Consultar registro de Transparencia Activa</a>`
      : portalRepo
        ? `<a class="md-cta-fuente" href="${escHTML(portalRepo)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-up-right-from-square ic-meta" aria-hidden="true"></i> Consultar fuente institucional</a>`
        : `<span class="cm" style="color:var(--ink-3)">Pendiente de integración</span>`],
    ['Fecha de incorporación al repositorio', fmtDate(fechaIncorp)]
  ];

  const provHintNoData = !provAvailable && !pdfUrl && !origRegUrl;

  const metaExtend = `
    ${mdGroup('fa-file-lines', 'Identificación documental', grupoIdent, 'Datos básicos de emisión y clasificación primaria.')}
    ${mdGroup('fa-circle-check', 'Estado y disponibilidad', grupoEstado, 'Situación jurídica actual y nivel de acceso.')}
    ${mdGroup('fa-tags', 'Clasificación y recuperación', grupoClasif, 'Descriptores temáticos y marco normativo relacionado.')}
    ${mdGroup('fa-chart-simple', 'Información del sistema', grupoSistema, 'Datos de uso y mantenimiento del registro digital.')}

    <section class="md-provenance" aria-labelledby="mdg-proveniencia">
      <div class="md-group-head">
        <h3 class="md-prov-h" id="mdg-proveniencia"><i class="fa-solid fa-building-columns ic-meta" aria-hidden="true"></i> Fuente y procedencia</h3>
        <span class="md-group-sub">Origen institucional y referencias de verificación oficial.</span>
      </div>
      ${provHintNoData ? `
        <div class="md-prov-hint">
          <b>Nota:</b> los siguientes campos de procedencia no están disponibles en el modelo de datos actual.
          La estructura visual se encuentra preparada para su futura integración.
          Pendientes: <code>portalOrigen</code>, <code>origenUrl</code>, <code>transparenciaUrl</code>.
        </div>` : ''}
      <div class="md-prov-grid">
        ${provRows.map(([k,v])=>`<div class="md-row"><div class="md-k">${k}</div><div class="md-v">${v}</div></div>`).join('')}
      </div>
    </section>
  `;

  // Panel lateral: monograma compacto + enlaces
  const sideHtml = `
    <aside class="md-side" aria-label="Paneles de apoyo · monograma y enlaces">
      <div class="md-side-card">
        <h4><i class="fa-solid fa-address-card ic-meta" aria-hidden="true"></i> Monograma</h4>
        <div class="md-mono-wrap">
          <div class="md-mono-big" style="background:${colorForTipo(d.tipo)}12;color:${colorForTipo(d.tipo)}">${escHTML(monogramFor(d))}</div>
          <div class="md-mono-sideinfo">
            <div class="md-side-kv"><span>Código</span><b class="mono">${escHTML(d.codigo)}</b></div>
            <div class="md-side-kv"><span>Tipo</span><b>${escHTML(d.tipo)}</b></div>
            <div class="md-side-kv"><span>Vigencia</span><b class="${slug(d.estado)}">${d.estado}</b></div>
          </div>
        </div>
      </div>
      <div class="md-side-card">
        <h4><i class="fa-solid fa-link ic-meta" aria-hidden="true"></i> Enlaces relacionados</h4>
        <a href="#/search?unidad=${encodeURIComponent(d.unidad)}" class="md-link">Todos los documentos de ${escHTML(d.unidad)}</a>
        <a href="#/review" class="md-link">Afectaciones relacionadas en revisión</a>
        <a href="#/admin" class="md-link">Gestionar este documento</a>
      </div>
    </aside>`;

  // ====================== PESTAÑA 3: VERSIONES ======================
  const verListHtml = (d.versiones||[]).slice().reverse().map((v,i)=>`
    <li class="ver-item ${i===0?'actual':''}">
      <div class="ver-dot"></div>
      <div class="ver-body">
        <div class="ver-head">
          <span class="ver-pill">v${escHTML(v.v)}</span>
          <span class="ver-fecha cm">${fmtDate(v.fecha)}</span>
          ${i===0 ? '<span class="tag-cat tag-new">Versión actual</span>' : ''}
        </div>
        <div class="ver-nota">${escHTML(v.nota)}</div>
        <div class="ver-actions cm">
          ${i>0 ? `<button class="link-btn ver-compare" data-ver-compare="${v.v}"><i class="fa-solid fa-left-right ic-meta" aria-hidden="true"></i> Comparar con actual</button>` : ''}
          <button class="link-btn" data-ver-dl="${v.v}"><i class="fa-solid fa-download ic-meta" aria-hidden="true"></i> Descargar esta versión</button>
        </div>
      </div>
    </li>`).join('') || `<div class="empty-inline cm">Este documento no registra historial de versiones.</div>`;

  // ====================== PESTAÑA 4: AFECTACIONES Y RELACIONES ======================
  // Bloque A: "Este documento AFECTA A" (documentos ANTERIORES que el documento actual modifica/complementa/etc.)
  // Usamos d.afectaciones[]
  const afectaA = (d.afectaciones||[]).map(a=>{
    const otro = DOCUMENTOS.find(x=>x.codigo===a.codigo);
    const oid = otro?.id || 'd001';
    const tr = TIPOS_REL_COLOR[a.relacion] || {c:'#64748B',bg:'#F1F5F9',dir:'<i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i>',etiqueta:'Relación'};
    const ec = ESTADOS_REL_COLOR[ (a.estado || 'validado') ] || ESTADOS_REL_COLOR.validado;
    return `<article class="rel-card" style="--rel-c:${tr.c};--rel-bg:${tr.bg}">
      <header class="rc-head">
        <div class="rc-rel" style="background:var(--rel-bg);color:var(--rel-c)">
          <span class="rc-dir">${tr.dir}</span>
          <span class="rc-lbl">${escHTML(a.relacion)}</span>
        </div>
        <div class="rc-doc">
          <div class="rc-t">
            <a href="#/detail/${oid}" class="rc-tit">${escHTML(a.descripcion || a.codigo)}</a>
            <span class="mono rc-cod">${escHTML(a.codigo)}</span>
          </div>
          <div class="rc-unit cm">${otro?.unidad || 'Unidad no informada'} · ${otro?.anio || '—'}</div>
        </div>
        <div class="rc-st" style="background:${ec.bg};color:${ec.c}">
          <span>${ec.icon}</span>${escHTML(ec.label)}
        </div>
      </header>
      <div class="rc-body">
        <div class="rc-ev">
          <div class="rc-ev-lb cm">Fragmento de evidencia</div>
          <blockquote class="rc-ev-q">“${escHTML(a.evidencia || d.resumen.slice(0,180)+'…')}”</blockquote>
          <div class="rc-ev-or cm mono">${a.origen || d.codigo} · Art. ${(a.articulo||'3')} · Pág. ${a.pagina||'2'}</div>
        </div>
        <div class="rc-meta">
          <div class="rc-m-row"><span class="rc-m-k cm">Validado por</span><span class="rc-m-v">${a.validador || 'Dra. Carmen Rojas Pavez'}</span></div>
          <div class="rc-m-row"><span class="rc-m-k cm">Fecha validación</span><span class="rc-m-v">${fmtDate(a.fechaVal || d.fecha)}</span></div>
          <div class="rc-ctas">
            <button type="button" class="btn primary sm" data-compare="${oid}"><i class="fa-solid fa-left-right ic-meta" aria-hidden="true"></i> Comparar documentos</button>
            <button type="button" class="btn ghost sm" data-review="${oid}"><i class="fa-solid fa-scale-balanced ic-meta" aria-hidden="true"></i> Revisar en consola</button>
          </div>
        </div>
      </div>
    </article>`;
  }).join('') || `<div class="empty-block cm"><p>Este documento no modifica, deroga, complementa ni afecta a documentos anteriores según sus metadatos explícitos.</p></div>`;

  // Bloque B: "Este documento ES AFECTADO POR" (documentos POSTERIORES que modifican a este)
  const afectadoPor = DOCUMENTOS.filter(o=> (o.afectaciones||[]).some(a=>a.codigo===d.codigo) ).map(o=>{
    const a = (o.afectaciones||[]).find(x=>x.codigo===d.codigo);
    const tr = TIPOS_REL_COLOR[a.relacion] || {c:'#64748B',bg:'#F1F5F9',dir:'<i class="fa-solid fa-arrow-left ic-meta" aria-hidden="true"></i>',etiqueta:'Relación'};
    const ec = ESTADOS_REL_COLOR[ (a.estado || 'validado') ] || ESTADOS_REL_COLOR.validado;
    return `<article class="rel-card afectado" style="--rel-c:${tr.c};--rel-bg:${tr.bg}">
      <header class="rc-head">
        <div class="rc-rel" style="background:var(--rel-bg);color:var(--rel-c)">
          <span class="rc-dir">${tr.dir}</span>
          <span class="rc-lbl">${escHTML(a.relacion)}</span>
        </div>
        <div class="rc-doc">
          <div class="rc-t">
            <a href="#/detail/${o.id}" class="rc-tit">${escHTML(o.titulo)}</a>
            <span class="mono rc-cod">${escHTML(o.codigo)}</span>
          </div>
          <div class="rc-unit cm">${escHTML(o.unidad)} · ${o.anio}</div>
        </div>
        <div class="rc-st" style="background:${ec.bg};color:${ec.c}">
          <span>${ec.icon}</span>${escHTML(ec.label)}
        </div>
      </header>
      <div class="rc-body">
        <div class="rc-ev">
          <div class="rc-ev-lb cm">Fragmento de evidencia (en documento fuente)</div>
          <blockquote class="rc-ev-q">“${escHTML(a.evidencia || o.resumen.slice(0,180)+'…')}”</blockquote>
          <div class="rc-ev-or cm mono">${o.codigo} · Art. ${(a.articulo||'7')} · Pág. ${a.pagina||'4'}</div>
        </div>
        <div class="rc-meta">
          <div class="rc-m-row"><span class="rc-m-k cm">Validado por</span><span class="rc-m-v">${a.validador || 'Dr. Fernando Lagos Muñoz'}</span></div>
          <div class="rc-m-row"><span class="rc-m-k cm">Fecha validación</span><span class="rc-m-v">${fmtDate(a.fechaVal || o.fecha)}</span></div>
          <div class="rc-ctas">
            <button type="button" class="btn primary sm" data-compare="${o.id}"><i class="fa-solid fa-left-right ic-meta" aria-hidden="true"></i> Comparar documentos</button>
            <button type="button" class="btn ghost sm" data-review="${o.id}"><i class="fa-solid fa-scale-balanced ic-meta" aria-hidden="true"></i> Revisar en consola</button>
          </div>
        </div>
      </div>
    </article>`;
  }).join('') || `<div class="empty-block cm"><p>Ningún documento posterior registra una afectación sobre esta norma.</p></div>`;

  // ====================== PESTAÑA 5: HISTORIAL ======================
  const historyItems = [
    {fecha:d.fecha, tipo:'publicacion', usuario:'Secretaría General', nota:`Publicación oficial del documento ${d.codigo}.`, tag:'Publicación oficial'},
    ...(d.versiones||[]).slice(0,-1).map(v=>({fecha:v.fecha, tipo:'version', usuario:'Unidad de Normalización', nota:`Publicada versión v${v.v}: ${v.nota}`, tag:`Versión v${v.v}`})),
    {fecha: sumarDias(d.fecha, 7), tipo:'indexacion', usuario:'Sistema · Motor de búsqueda', nota:'Documento indexado, extraídos 14 artículos y 87 términos clave.', tag:'Indexación'},
    {fecha: sumarDias(d.fecha, 14), tipo:'revision', usuario:'Dra. Carmen Rojas Pavez', nota:'Revisadas afectaciones explícitas y semánticas contra 12 documentos históricos. Aceptadas 2 relaciones.', tag:'Revisión de afectaciones'},
    {fecha: sumarDias(d.fecha, 45), tipo:'acceso', usuario:'—', nota:`${(d.consultas||0).toLocaleString('es-CL')} consultas registradas desde su publicación.`, tag:'Estadísticas de acceso'}
  ].sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const histHtml = historyItems.map(it=>{
    const mapCol = {
      publicacion: {c:'var(--accent)',ic:'<i class="fa-solid fa-file-lines ic-meta" aria-hidden="true"></i>'},
      version: {c:'var(--plum)',ic:'<i class="fa-solid fa-file-pen ic-meta" aria-hidden="true"></i>'},
      indexacion: {c:'var(--slate)',ic:'<i class="fa-solid fa-magnifying-glass ic-meta" aria-hidden="true"></i>'},
      revision: {c:'var(--terracotta)',ic:'<i class="fa-solid fa-scale-balanced ic-meta" aria-hidden="true"></i>'},
      acceso: {c:'var(--moss)',ic:'<i class="fa-solid fa-chart-simple ic-meta" aria-hidden="true"></i>'}
    }[it.tipo] || {c:'var(--ink-4)',ic:'•'};
    return `<li class="hist-item">
      <div class="hist-dot" style="background:${mapCol.c}">${mapCol.ic}</div>
      <div class="hist-body">
        <div class="hist-head">
          <span class="hist-tag" style="color:${mapCol.c};background:${mapCol.c}15;border-color:${mapCol.c}33">${escHTML(it.tag)}</span>
          <span class="hist-fecha cm">${fmtDate(it.fecha)} · ${escHTML(it.usuario)}</span>
        </div>
        <div class="hist-nota">${escHTML(it.nota)}</div>
      </div>
    </li>`;
  }).join('');

  // ====================== ÍNDICE LATERAL + META ======================
  const versShort = (d.versiones||[]).map(v=>`<li><div class="ver-v">v${escHTML(v.v)} · ${fmtDate(v.fecha)}</div><div class="cm">${escHTML(v.nota)}</div></li>`).join('');

  let backLabel = 'Ir al buscador';
  let backHref = '#/home';
  if (state.lastListRoute) {
    if (state.lastListRoute.name === 'search') {
      backLabel = 'Volver a los resultados';
      backHref = searchToURL();
    } else if (state.lastListRoute.name === 'explore') {
      backLabel = 'Volver a Explorar';
      backHref = state.lastListRoute.rawPath || '#/explore';
    }
  }

  return `
  <a class="context-back-link" href="${backHref}">
    <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
    ${backLabel}
  </a>
  <header class="page-head detail-document">
    <div class="detail-ribbon v2" style="--rib:${colorForTipo(d.tipo)}">
      <div class="dr-body v2">
        <div class="dr-grid-v2">
          <div class="dr-info">
            <div class="meta-row v2">
              <span class="type-pill" style="background:${colorForTipo(d.tipo)}11;color:${colorForTipo(d.tipo)}">${escHTML(d.tipo)}</span>
              <span class="cm mono code-pill">${escHTML(d.codigo)}</span>
              <span class="status ${slug(d.estado)} sm">${d.estado}</span>
              <span class="access ${slug(d.disponibilidad)} sm">${d.disponibilidad}</span>
            </div>
            <h1 class="display doc-title v2">${highlight(d.titulo,q)}</h1>
            <p class="deck doc-deck v2">${highlight(d.resumen,q)}</p>
            <div class="detail-meta-grid dr-meta-grid v2">
              <div class="dm"><div class="dk">Unidad responsable</div><div class="dv">${escHTML(d.unidad)}</div></div>
              <div class="dm"><div class="dk">Fecha de emisión</div><div class="dv">${fmtDate(d.fecha)}</div></div>
              <div class="dm"><div class="dk">Año normativo</div><div class="dv">${String(d.anio)}</div></div>
              <div class="dm"><div class="dk">Versión actual</div><div class="dv">v${(d.versiones||[]).slice(-1)[0]?.v||'1.0'} · ${fmtDate((d.versiones||[]).slice(-1)[0]?.fecha || d.fecha)}</div></div>
              <div class="dm"><div class="dk">Consultas totales</div><div class="dv mono">${(d.consultas||0).toLocaleString('es-CL')}</div></div>
              <div class="dm"><div class="dk">Palabras clave</div><div class="dv">${d.keywords?.slice(0,3).join(' · ') || 'Académica · Pregrado · Admisión'}</div></div>
            </div>
          </div>
          <aside class="dr-aside-v2" aria-label="Acciones rápidas">
            <div class="detail-actions dr-ctas v2" role="group" aria-label="Acciones del documento">
              <button class="btn primary sm full" data-copy-cita><i class="fa-solid fa-clipboard-list ic-meta" aria-hidden="true"></i> Copiar cita</button>
              ${d.pdf
                ? `<a href="${encodeURI(d.pdf)}" target="_blank" rel="noopener" class="btn ghost sm full" data-dl-pdf title="Descargar ${escHTML(d.codigo)}.pdf"><i class="fa-solid fa-download ic-meta" aria-hidden="true"></i> Descargar PDF</a>`
                : `<a href="#" class="btn ghost sm full" data-dl-pdf><i class="fa-solid fa-download ic-meta" aria-hidden="true"></i> Descargar PDF</a>`}
              <button class="btn ghost sm full" data-print><i class="fa-solid fa-print ic-meta" aria-hidden="true"></i> Imprimir</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </header>

  <div class="detail-grid v2">
    <aside class="detail-toc v2" aria-label="Tabla de contenidos y navegación">
      <div class="toc-sticky v2">
        <div class="toc-block toc-index-block" data-vcarousel="index">
          <header class="toc-block-head">
            <h4>Índice de contenido</h4>
            <span class="toc-block-count cm" aria-label="Número de secciones">
              <span class="tbc-num" data-vc-total>${(d.secciones||[]).length||0}</span> secciones
            </span>
          </header>
          <div class="vcarousel vc-index">
            <div class="vc-toolbar" role="toolbar" aria-label="Navegación del índice">
              <button type="button" class="vc-nav vc-nav-up" data-vc-nav="up" aria-label="Secciones anteriores" disabled>
                <i class="fa-solid fa-chevron-up ic-meta" aria-hidden="true"></i>
              </button>
              <span class="vc-counter cm" aria-live="polite">
                <span data-vc-start>1</span>–<span data-vc-end>${Math.min(5, (d.secciones||[]).length||0)}</span> de <span data-vc-total>${(d.secciones||[]).length||0}</span>
              </span>
              <button type="button" class="vc-nav vc-nav-down" data-vc-nav="down" aria-label="Secciones siguientes">
                <i class="fa-solid fa-chevron-down ic-meta" aria-hidden="true"></i>
              </button>
            </div>
            <div class="vc-stage-wrap vc-index-wrap" data-vc-wrap>
              <ol class="toc-list vc-stage" data-vc-stage>${secciones||`<li class="cm">Índice no disponible</li>`}</ol>
            </div>
          </div>
        </div>
        <div class="toc-block toc-arts-block" data-vcarousel="arts">
          <h4>
            <span><i class="fa-solid fa-bookmark ic-meta" aria-hidden="true"></i> Fragmentos clave</span>
            <button type="button" class="toc-collapse-btn" data-toc-collapse="arts" aria-expanded="true" aria-controls="toc-arts-panel" title="Contraer o expandir los fragmentos clave">
              <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
          </h4>
          <div id="toc-arts-panel" class="toc-collapsible" role="region" aria-label="Listado de artículos clave">
            <div class="vcarousel vc-arts">
              <header class="toc-block-head nested">
                <span class="toc-block-count cm" aria-label="Número de fragmentos">
                  <span class="tbc-num" data-vc-total>${(d.articulos||[]).length||0}</span> fragmentos
                </span>
                <div class="vc-toolbar" role="toolbar" aria-label="Navegación de fragmentos">
                  <button type="button" class="vc-nav vc-nav-up" data-vc-nav="up" aria-label="Fragmentos anteriores" disabled>
                    <i class="fa-solid fa-chevron-up ic-meta" aria-hidden="true"></i>
                  </button>
                  <span class="vc-counter cm" aria-live="polite">
                    <span data-vc-start>1</span>–<span data-vc-end>${Math.min(3, (d.articulos||[]).length||0)}</span> de <span data-vc-total>${(d.articulos||[]).length||0}</span>
                  </span>
                  <button type="button" class="vc-nav vc-nav-down" data-vc-nav="down" aria-label="Fragmentos siguientes">
                    <i class="fa-solid fa-chevron-down ic-meta" aria-hidden="true"></i>
                  </button>
                </div>
              </header>
              <div class="vc-stage-wrap vc-arts-wrap" data-vc-wrap>
                <ul class="toc-arts-list vc-stage" data-vc-stage>${artsListToc}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <section class="detail-body v2" aria-label="Cuerpo del documento">
      <nav class="doc-subnav v2" role="tablist" aria-label="Secciones de la ficha documental">
        <button class="ds-tab on" role="tab" aria-selected="true" data-dstab="viewer"><span class="dt-ic"><i class="fa-solid fa-file-lines ic-meta" aria-hidden="true"></i></span>Visualización</button>
        <button class="ds-tab" role="tab" aria-selected="false" data-dstab="meta"><span class="dt-ic"><i class="fa-solid fa-tag ic-meta" aria-hidden="true"></i></span>Metadatos</button>
        <button class="ds-tab" role="tab" aria-selected="false" data-dstab="vers"><span class="dt-ic"><i class="fa-solid fa-file-pen ic-meta" aria-hidden="true"></i></span>Versiones</button>
      </nav>

      ${surrogateDeroga}

      <!-- Pestaña 1: Visualización (visor + toolbar) -->
      <div class="ds-panel" data-ds-panel="viewer" aria-label="Visor del documento">
        <h2 class="sec-title v2">Visualizador del documento</h2>
        ${d.pdfPath ? `
        <div class="viewer-wrap pdf-viewer-wrap">
          <div class="vw-toolbar" role="toolbar" aria-label="Controles del visor">
            <div class="vw-tb-left">
              <span class="vw-badge-pdf"><i class="fa-solid fa-file-pdf ic-meta" aria-hidden="true"></i> PDF Oficial</span>
              <span class="vw-sep"></span>
              <span class="cm mono">${escHTML(d.codigo)}</span>
              <span class="cm">${escHTML(d.tipo)} · ${escHTML(d.unidad)}</span>
            </div>
            <div class="vw-tb-right">
              <a class="vw-btn" title="Abrir PDF en pestaña" href="${escHTML(d.pdfPath)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-up-right-from-square ic-meta" aria-hidden="true"></i></a>
              <a class="vw-btn" title="Descargar PDF oficial" href="${escHTML(d.pdfPath)}" download><i class="fa-solid fa-download ic-meta" aria-hidden="true"></i></a>
              <button class="vw-btn" title="Imprimir documento" data-print-pdf="${escHTML(d.pdfPath)}"><i class="fa-solid fa-print ic-meta" aria-hidden="true"></i></button>
            </div>
          </div>
          <div class="pdf-frame-wrap" aria-label="Visor PDF oficial">
            <iframe class="pdf-frame" src="${escHTML(d.pdfPath)}#toolbar=1&navpanes=1&scrollbar=1" title="Visor PDF · ${escHTML(d.titulo)}"></iframe>
          </div>
        </div>` : `
        <div class="viewer-wrap">
          <div class="vw-toolbar" role="toolbar" aria-label="Controles del visor">
            <div class="vw-tb-left">
              <button class="vw-btn" title="Página anterior" data-vw="prev"><i class="fa-solid fa-chevron-left ic-meta" aria-hidden="true"></i></button>
              <span class="vw-pageinfo"><span class="mono" data-vw="cur">1</span> / <span class="mono" data-vw="tot">6</span></span>
              <button class="vw-btn" title="Página siguiente" data-vw="next"><i class="fa-solid fa-chevron-right ic-meta" aria-hidden="true"></i></button>
              <span class="vw-sep"></span>
              <label class="vw-goto"><span class="cm">Ir a pág.</span><input type="number" min="1" max="6" value="1" data-vw="goto"/></label>
            </div>
            <div class="vw-tb-right">
              <button class="vw-btn" title="Acercar" data-vw="zoom-in"><i class="fa-solid fa-plus ic-meta" aria-hidden="true"></i></button>
              <span class="vw-zoom"><span class="mono" data-vw="zoom">100%</span></span>
              <button class="vw-btn" title="Alejar" data-vw="zoom-out"><i class="fa-solid fa-minus ic-meta" aria-hidden="true"></i></button>
              <button class="vw-btn" title="Ancho completo" data-vw="fit-w"><i class="fa-solid fa-arrows-left-right ic-meta" aria-hidden="true"></i></button>
              <span class="vw-sep"></span>
              <button class="vw-btn" title="Descargar PDF" data-dl-pdf2><i class="fa-solid fa-download ic-meta" aria-hidden="true"></i></button>
              <button class="vw-btn" title="Abrir en pestaña" data-vw="open"><i class="fa-solid fa-up-right-from-square ic-meta" aria-hidden="true"></i></button>
            </div>
          </div>
          <div class="vw-body">
            <aside class="vw-thumbs" aria-label="Miniaturas de páginas">
              ${[1,2,3,4,5,6].map(n=>`
                <button class="vw-thumb ${n===1?'on':''}" data-vw="page:${n}" aria-label="Ir a página ${n}">
                  <div class="vwt-paper">
                    <div class="vwt-page vwt-${n}"><span class="vwt-pn">${n}</span></div>
                  </div>
                </button>`).join('')}
            </aside>
            <div class="vw-canvas" aria-label="Página actual">
              <div class="vw-page">
                <header class="vw-page-hd">
                  <span class="cm mono">${escHTML(d.codigo)}</span>
                  <span class="cm">${escHTML(d.tipo)} · ${escHTML(d.unidad)}</span>
                </header>
                <h3 class="vw-doc-title">${escHTML(d.titulo)}</h3>
                <p class="vw-doc-meta cm"><b>Vigencia:</b> ${d.estado} · <b>Emisión:</b> ${fmtDate(d.fecha)} · <b>Versión:</b> v${(d.versiones||[]).slice(-1)[0]?.v||'1.0'}</p>
                <div class="vw-page-body">
                  <h4 class="vw-art">Artículo 1°</h4>
                  <p>${highlight(d.articulos?.[0] || 'Las disposiciones de este reglamento son de observancia general para toda la comunidad universitaria.',q)}</p>
                  <h4 class="vw-art">Artículo 2°</h4>
                  <p>${highlight(d.articulos?.[1] || 'Se reconocen tres vías de ingreso: vía PAES regular, cupos especiales y admisión directa.',q)}</p>
                  <h4 class="vw-art">Artículo 3°</h4>
                  <p>${highlight(d.articulos?.[2] || 'Las ponderaciones específicas por carrera serán publicadas anualmente por la Dirección de Admisión.',q)}</p>
                  <div class="vw-watermark cm">Documento informativo · no válido para efectos jurídicos</div>
                </div>
                <footer class="vw-page-ft cm">
                  <span>${escHTML(d.codigo)}</span><span class="mono">Pág. 1 de 6</span><span>© Universidad · Secretaría General</span>
                </footer>
              </div>
            </div>
          </div>
        </div>`}
      </div>

      <!-- Pestaña 2: Metadatos -->
      <div class="ds-panel" data-ds-panel="meta" hidden aria-label="Metadatos completos">
        <h2 class="sec-title v2">Ficha de metadatos</h2>
        <p class="sec-sub">Información estructurada, campos administrativos y fuente institucional del documento.</p>
        <div class="md-holder">
          <div class="md-ficha">${metaExtend}</div>
          ${sideHtml}
        </div>
      </div>

      <!-- Pestaña 3: Versiones -->
      <div class="ds-panel" data-ds-panel="vers" hidden aria-label="Historial de versiones">
        <h2 class="sec-title v2">Versiones y cambios</h2>
        <p class="sec-sub">Registro cronológico de correcciones, actualizaciones y publicaciones oficiales. La versión vigente se marca en primer lugar.</p>
        <ul class="ver-list-big">${verListHtml}</ul>
      </div>
    </section>
  </div>

  ${surrogateSimilares}
  `;
}
function hookDetail(id){
  const d = DOCUMENTOS.find(x=>x.id===id) || DOCUMENTOS[0];
  const TOTAL_PAG = 6;
  const vw = { cur: 1, zoom: 100 };
  function dsTabTo(key){
    $$('.ds-tab').forEach(x=>{ const on = x.dataset.dstab===key; x.classList.toggle('on',on); x.setAttribute('aria-selected', on?'true':'false'); });
    $$('.ds-panel').forEach(p=>{ p.hidden = p.dataset.dsPanel !== key; });
  }
  $$('.ds-tab').forEach(t=>t.addEventListener('click', ()=>dsTabTo(t.dataset.dstab)));

  // Collapsible de Fragmentos clave (TOC lateral)
  (function wireTocCollapsible(){
    const btn = $('[data-toc-collapse="arts"]');
    const block = btn?.closest('.toc-arts-block');
    if(!btn || !block) return;
    btn.addEventListener('click', ()=>{
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const next = !expanded;
      btn.setAttribute('aria-expanded', String(next));
      block.classList.toggle('is-collapsed', !next);
      // Re-calcular visibilidad del carousel al expandir
      if(next){
        setTimeout(()=>{
          const event = new Event('resize', {bubbles:true});
          window.dispatchEvent(event);
        }, 260);
      }
    });
  })();

  // Carruseles verticales independientes (Índice + Fragmentos clave)
  (function wireVerticalCarousels(){
    if(typeof ResizeObserver === 'undefined') return;
    const blocks = $$('[data-vcarousel]');
    blocks.forEach(block=>{
      const type = block.dataset.vcarousel; // 'index' | 'arts'
      const toolbar = block.querySelector('.vc-toolbar');
      const wrap = block.querySelector('[data-vc-wrap]');
      const stage = block.querySelector('[data-vc-stage]');
      if(!wrap || !stage || !toolbar) return;
      const items = [...stage.children].filter(el => !el.classList.contains('cm') || !/no disponible|Sin artículos/.test(el.textContent || ''));
      const total = items.length;
      const upBtn = toolbar.querySelector('[data-vc-nav="up"]');
      const downBtn = toolbar.querySelector('[data-vc-nav="down"]');
      const startEl = toolbar.querySelector('[data-vc-start]');
      const endEl = toolbar.querySelector('[data-vc-end]');
      const totals = toolbar.querySelectorAll('[data-vc-total]');
      // Presets por tipo
      const DEFAULTS = {
        index: { min: 4, max: 6, nominalH: 36 },
        arts:  { min: 3, max: 4, nominalH: 74 },
      };
      const cfg = DEFAULTS[type] || DEFAULTS.index;
      let visible = cfg.min;
      let start = 0;
      let itemH = cfg.nominalH;
      // Actualizar totales iniciales
      totals.forEach(el => el.textContent = String(total));
      // Si hay pocos items o ninguno, ocultar toolbar controles
      function updateToolbarVisibility(){
        if(total <= visible || total === 0){ toolbar.hidden = true; }
        else { toolbar.hidden = false; }
      }
      // Medir primer item real (si existe) para altura dinámica
      function measureItem(){
        if(items.length){
          const r = items[0].getBoundingClientRect();
          if(r.height > 8){ itemH = r.height; }
        }
      }
      function calcVisible(){
        if(!wrap.offsetHeight) return visible;
        const wrapH = wrap.clientHeight - 0;
        measureItem();
        const v = Math.floor(wrapH / itemH) || cfg.min;
        return Math.max(1, Math.min(cfg.max, v));
      }
      function clampStart(s, v){
        if(total <= v) return 0;
        return Math.max(0, Math.min(s, total - v));
      }
      function refresh(){
        if(!wrap.offsetHeight){ return; } // colapsado: no transformar
        measureItem();
        visible = calcVisible();
        start = clampStart(start, visible);
        updateToolbarVisibility();
        const atStart = start <= 0 || total <= visible;
        const atEnd   = (start + visible) >= total || total <= visible;
        if(upBtn){ upBtn.disabled = atStart; upBtn.style.opacity = atStart? '.4' : '1'; upBtn.style.cursor = atStart? 'not-allowed' : 'pointer'; }
        if(downBtn){ downBtn.disabled = atEnd; downBtn.style.opacity = atEnd? '.4' : '1'; downBtn.style.cursor = atEnd? 'not-allowed' : 'pointer'; }
        if(startEl){ startEl.textContent = String(total === 0 ? 0 : start + 1); }
        if(endEl){ endEl.textContent = String(total === 0 ? 0 : Math.min(total, start + visible)); }
        stage.style.transform = `translateY(${ -1 * start * itemH }px)`;
      }
      if(upBtn){
        upBtn.addEventListener('click', ()=>{
          start = clampStart(start - visible, visible);
          refresh();
        });
      }
      if(downBtn){
        downBtn.addEventListener('click', ()=>{
          start = clampStart(start + visible, visible);
          refresh();
        });
      }
      // Rueda del ratón sobre el wrap = avanzar/retroceder paginadamente (solo cuando overflow = hidden / scrollbar none)
      wrap.addEventListener('wheel', (e)=>{
        if(total <= visible) return;
        if(Math.abs(e.deltaY) < 6) return;
        e.preventDefault();
        start = clampStart(start + (e.deltaY > 0 ? 1 : -1), visible);
        refresh();
      }, { passive: false });
      // ResizeObserver
      const ro = new ResizeObserver(()=>{
        const newVis = calcVisible();
        if(newVis !== visible || start > 0){ refresh(); }
      });
      ro.observe(wrap);
      // Primer refresh tras un frame para que el layout esté listo
      requestAnimationFrame(()=> requestAnimationFrame(()=> refresh()));
    });
  })();

  // Compare docs (en cualquier botón data-compare dentro de rel-card)
  $$('[data-compare]').forEach(b=>b.addEventListener('click', ()=>openCompare(d.id, b.dataset.compare)));
  // Revisar en consola
  $$('[data-review]').forEach(b=>b.addEventListener('click', ()=>{
    state.review._focusDoc = b.dataset.review; saveState(); navigateTo('#/review');
  }));
  // ir a review desde TOC
  $('[data-review-go]')?.addEventListener('click', ()=>navigateTo('#/review'));
  $('[data-compare-all]')?.addEventListener('click', ()=>toast('(demo) Cargando comparaciones múltiples…', {kind:'info', title:'Comparar'}));
  // version compare
  $$('[data-ver-compare]').forEach(b=>b.addEventListener('click', ()=>toast(`(demo) Comparando versión v${b.dataset.verCompare} con la actual…`, {kind:'info', title:'Versiones'})));
  $$('[data-ver-dl]').forEach(b=>b.addEventListener('click', ()=>toast(`(demo) Preparando descarga v${b.dataset.verDl}…`, {kind:'info', title:'Descarga'})));

  // acciones heredadas
  $('[data-copy-cita]')?.addEventListener('click', ()=>{
    const cita = `${d.codigo} · ${d.titulo}. ${d.unidad}, ${fmtDate(d.fecha)}.`;
    navigator.clipboard?.writeText(cita).then(()=>toast('Cita copiada al portapapeles.',{kind:'ok',title:'Clipboard'})).catch(()=>{
      const t = document.createElement('textarea'); t.value = cita; document.body.appendChild(t); t.select(); try{ document.execCommand('copy'); toast('Cita copiada.',{kind:'ok'}); }catch(e){ toast('No se pudo copiar.',{kind:'err'}); } t.remove();
    });
  });
  $('[data-print]')?.addEventListener('click', ()=>{ try{ window.print(); }catch(e){} });
  $('[data-admin-go]')?.addEventListener('click', ()=>{ navigateTo('#/admin'); });
  $$('[data-dl-pdf], [data-dl-pdf2]').forEach(b=>b.addEventListener('click', e=>{
    if(d.pdf || d.pdfPath){
      const path = d.pdf || d.pdfPath;
      if(b.tagName==='BUTTON'){
        e.preventDefault();
        try{ window.open(encodeURI(path), '_blank', 'noopener,noreferrer'); }catch(_err){}
      }
      return;
    }
    e.preventDefault();
    toast('(demo) Preparando PDF firmado…',{kind:'info',title:'Descarga'});
    setTimeout(()=>toast('PDF listo (mock).',{kind:'ok',title:'Descarga'}), 900);
  }));
  // Botón imprimir PDF
  $('[data-print-pdf]')?.addEventListener('click', e=>{
    const src = e.currentTarget.dataset.printPdf;
    if(!src) return;
    try{
      const w = window.open(encodeURI(src), '_blank', 'noopener,noreferrer');
      w && setTimeout(()=>w.focus(), 200);
    }catch(_err){}
  });

  // ---------- Carrusel de documentos similares ----------
  const dmCarousel = $('[data-dm-carousel]');
  if(dmCarousel){
    const dmTrack = dmCarousel.querySelector('[data-dm-track]');
    const dmPrev  = dmCarousel.querySelector('[data-dm-nav="prev"]');
    const dmNext  = dmCarousel.querySelector('[data-dm-nav="next"]');
    const dmUpdateArrows = () => {
      const canScroll = dmTrack && (dmTrack.scrollWidth > dmTrack.clientWidth + 2);
      const atStart = dmTrack.scrollLeft < 2;
      const atEnd   = (dmTrack.scrollLeft + dmTrack.clientWidth) >= dmTrack.scrollWidth - 2;
      if(dmPrev){ dmPrev.disabled = !canScroll || atStart; dmPrev.style.opacity = !canScroll || atStart ? '.42' : '1'; dmPrev.style.cursor = !canScroll || atStart ? 'not-allowed' : 'pointer'; }
      if(dmNext){ dmNext.disabled = !canScroll || atEnd;   dmNext.style.opacity = !canScroll || atEnd   ? '.42' : '1'; dmNext.style.cursor = !canScroll || atEnd   ? 'not-allowed' : 'pointer'; }
    };
    const dmStep = () => Math.max(260, (dmTrack?.clientWidth || 400) * 0.88);
    dmPrev?.addEventListener('click', ()=>{ dmTrack.scrollBy({ left: -dmStep(), behavior:'smooth' }); });
    dmNext?.addEventListener('click', ()=>{ dmTrack.scrollBy({ left:  dmStep(), behavior:'smooth' }); });
    if(dmTrack){
      dmTrack.addEventListener('scroll', dmUpdateArrows, {passive:true});
      dmTrack.addEventListener('wheel', e=>{
        const dx = Math.abs(e.deltaX), dy = Math.abs(e.deltaY);
        if(dy > dx){
          e.preventDefault();
          dmTrack.scrollBy({ left: e.deltaY + (e.deltaX||0), behavior:'auto' });
        }
      }, { passive:false });
      // Teclado ← → cuando el track tiene foco
      dmTrack.addEventListener('keydown', e=>{
        if(e.key === 'ArrowRight'){ e.preventDefault(); dmTrack.scrollBy({left:  dmStep(), behavior:'smooth'}); }
        else if(e.key === 'ArrowLeft'){ e.preventDefault(); dmTrack.scrollBy({left: -dmStep(), behavior:'smooth'}); }
      });
    }
    window.addEventListener('resize', dmUpdateArrows);
    // inicial (tras paint)
    requestAnimationFrame(dmUpdateArrows);
  }

  // visor
  const setVwPage = n=>{
    vw.cur = Math.max(1, Math.min(TOTAL_PAG, n));
    $$('[data-vw=cur]').forEach(el=>el.textContent = String(vw.cur));
    $$('.vw-thumb').forEach((b,i)=>b.classList.toggle('on', i+1 === vw.cur));
    const g = $('[data-vw=goto]'); if(g) g.value = vw.cur;
  };
  const setZoom = z=>{
    vw.zoom = Math.max(50, Math.min(200, z));
    $$('[data-vw=zoom]').forEach(el=>el.textContent = vw.zoom+'%');
    const page = $('.vw-page'); if(page){ page.style.transform = `scale(${vw.zoom/100})`; page.style.transformOrigin = 'top center'; }
  };
  $$('[data-vw]').forEach(b=>{
    const act = b.dataset.vw;
    if(act==='prev') b.addEventListener('click', ()=>setVwPage(vw.cur-1));
    else if(act==='next') b.addEventListener('click', ()=>setVwPage(vw.cur+1));
    else if(act==='goto') b.addEventListener('input', ()=>setVwPage(parseInt(b.value,10)||1));
    else if(act==='zoom-in') b.addEventListener('click', ()=>setZoom(vw.zoom+10));
    else if(act==='zoom-out') b.addEventListener('click', ()=>setZoom(vw.zoom-10));
    else if(act==='fit-w') b.addEventListener('click', ()=>setZoom(100));
    else if(act==='open') b.addEventListener('click', ()=>{
      if(d.pdf){
        try{ window.open(encodeURI(d.pdf), '_blank', 'noopener,noreferrer'); }catch(_err){}
      }else{
        toast('(demo) Abriendo documento original…',{kind:'info',title:'Visor'});
      }
    });
    else if(String(act).startsWith('page:')) b.addEventListener('click', ()=>setVwPage(parseInt(String(act).split(':')[1],10)||1));
  });
}

/* =========================================================
   10. VISTA D · ADMINISTRACIÓN / CARGA
   ========================================================= */
function renderAdmin(){
  const docs = DOCUMENTOS.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const allDecs = Object.keys(state.review.decisions).reduce((acc,k)=>{acc[k]=state.review.decisions[k];return acc;},{});
  const pendRev = CANDIDATOS.length - Object.keys(allDecs).filter(k=>{const d=allDecs[k];return d&&(d.decision==='aceptar'||d.decision==='corregir'||d.decision==='rechazar'||d.decision==='posterior');}).length;
  const stats = [
    {t:'Documentos indexados', v: DOCUMENTOS.length, sub: `${CAMBIOS_RECIENTES.length} con afectaciones recientes`, ic:'<i class="fa-solid fa-book ic-meta" aria-hidden="true"></i>', c:'var(--accent-1)'},
    {t:'Pendientes de revisión', v: pendRev, sub:'Candidatos en revisión de afectaciones', ic:'<i class="fa-solid fa-scale-balanced ic-meta" aria-hidden="true"></i>', c:'var(--amber)'},
    {t:'Ingesta este mes', v: 3, sub:'Pipeline demo · 3/10 procesados', ic:'<i class="fa-solid fa-arrow-up ic-meta" aria-hidden="true"></i>', c:'var(--moss)'},
    {t:'Alertas de extracción', v: 4, sub:'Requieren validación humana', ic:'<i class="fa-solid fa-triangle-exclamation ic-meta" aria-hidden="true"></i>', c:'var(--terracotta)'}
  ];
  const pipelineState = state.admin.pipelineStep || 0;
  const pipelineDone = pipelineState >= 7;
  const pipelineLabels = [
    '1 · Subir documento',
    '2 · Extraer contenido',
    '3 · Validar metadatos',
    '4 · Indexar',
    '5 · Buscar afectados',
    '6 · Revisar afectaciones',
    '7 · Publicar'
  ];
  const ingestaSummary = pipelineDone ? [
    {n:8, t:'Referencias explícitas', s:'Patrones RE-, DI-, MA- detectados', c:'var(--accent-1)', ic:'<i class="fa-solid fa-link ic-meta" aria-hidden="true"></i>'},
    {n:5, t:'Candidatos recuperados', s:'Señalización léxica + semántica', c:'var(--moss)', ic:'<i class="fa-solid fa-bullseye ic-meta" aria-hidden="true"></i>'},
    {n:pendRev, t:'Relaciones pendientes', s:'Requieren decisión humana', c:'var(--amber)', ic:'<i class="fa-solid fa-file-pen ic-meta" aria-hidden="true"></i>'},
    {n:2, t:'Advertencias', s:'OCR dudoso · falta versión previa', c:'var(--terracotta)', ic:'<i class="fa-solid fa-triangle-exclamation ic-meta" aria-hidden="true"></i>'}
  ] : null;

  const unidadOpts = [...new Set(UNIDADES)];
  const estadoOpts = ['Todos','Vigente','Derogado','Modificado','Prorrogado','En borrador'];
  const revOpts = ['Todos','Sin revisar','Pendientes','Revisado'];
  const tipoOpts = ['Todos', ...TIPOS];

  return `
  <header class="page-head">
    <div class="admin-head-row">
      <div><h1 class="display">Consola administrativa</h1><p class="deck">Carga, extracción, validación e indexación de normativa institucional. Toda acción se registra con sello de auditoría.</p></div>
      <div class="role-switcher" role="group" aria-label="Cambiar rol">
        <button class="rs-btn ${state.admin.role==='administrador'?'on':''}" data-role="administrador" aria-pressed="${state.admin.role==='administrador'}">Administrador General</button>
        <button class="rs-btn ${state.admin.role==='unidad'?'on':''}" data-role="unidad" aria-pressed="${state.admin.role==='unidad'}">Admin. por Unidad</button>
      </div>
    </div>
  </header>

  <section class="stats-grid" aria-label="Métricas principales">
    ${stats.map(s=>`<div class="stat-card"><div class="sc-ic" style="color:${s.c}">${s.ic}</div><div><div class="sc-v">${s.v}</div><div class="sc-t">${s.t}</div><div class="cm">${s.sub}</div></div></div>`).join('')}
  </section>

  <section class="card">
    <div class="sec-head">
      <h2>Pipeline de ingesta documental · 7 etapas</h2>
      <a href="#/review" class="btn primary sm">Revisar ${pendRev} afectaciones <i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i></a>
    </div>
    <div class="pipeline-wrap">
      <ol class="pipeline-7">
        ${pipelineLabels.map((lbl,i)=>{
          const step = i+1;
          const done = pipelineState>step;
          const act = pipelineState===step;
          return `<li class="p7-item ${done?'done':act?'active':''}">
            <div class="p7-dot">${done?'<i class="fa-solid fa-check ic-meta" aria-hidden="true"></i>':step}</div>
            <div class="p7-label">${lbl}</div>
            <div class="p7-state">${done?'Completado':act?'En curso':'Pendiente'}</div>
          </li>`;
        }).join('')}
      </ol>
    </div>
  </section>

  <section class="admin-2col">
    <div class="card admin-card">
      <div class="sec-head"><h2>Bloque 1 · Carga y procesamiento</h2></div>

      <div id="adminUploadZone" class="upload-zone" tabindex="0" role="button" aria-label="Zona de arrastre para subir documentos">
        <div class="uz-ic"><i class="fa-solid fa-cloud-arrow-up ic-meta" aria-hidden="true"></i></div>
        <div class="uz-title">Arrastre documentos aquí o haga clic para seleccionar</div>
        <div class="cm">PDF 1.6+ · DOCX con estructura de artículos · TXT UTF-8 · Máximo 30 MB</div>
        <input id="adminDzInput" type="file" accept=".pdf,.docx,.txt" hidden multiple />
        <button class="btn primary sm" id="adminDzBrowse" type="button">Seleccionar archivos</button>
      </div>

      <h3 class="form-h">Formulario de metadatos</h3>
      <form class="form-grid" id="cargaForm">
        <label class="field"><span>Título *</span><input required class="input" type="text" placeholder="Ej.: Reglamento de Proyectos DIDECO 2025"/></label>
        <label class="field"><span>Código *</span><input required class="input" type="text" placeholder="DI-015-2025"/></label>
        <label class="field"><span>Tipo documental *</span><select required class="input">${TIPOS.map(t=>`<option>${t}</option>`).join('')}</select></label>
        <label class="field"><span>Unidad responsable *</span><select required class="input">${UNIDADES.map(u=>`<option>${u}</option>`).join('')}</select></label>
        <label class="field"><span>Fecha emisión *</span><input required class="input" type="date" value="${new Date().toISOString().slice(0,10)}"/></label>
        <label class="field"><span>Año normativo</span><input class="input" type="number" value="${new Date().getFullYear()}"/></label>
        <label class="field"><span>Nivel de acceso</span><select class="input">${ACCESOS.map(a=>`<option>${a}</option>`).join('')}</select></label>
        <label class="field"><span>Estado inicial</span><select class="input">${['En borrador','En revisión','Vigente'].map(a=>`<option>${a}</option>`).join('')}</select></label>
        <label class="field full"><span>Resumen ejecutivo / extracto</span><textarea class="input" rows="3" placeholder="Resumen de 140-200 caracteres. Se usa como surrogate en resultados de búsqueda y fichas."></textarea></label>
        <div class="form-actions full">
          <button type="reset" class="btn ghost">Limpiar formulario</button>
          <button type="submit" class="btn primary">Guardar y enviar a ingesta <i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i></button>
        </div>
      </form>

      <div class="alerts-box">
        <h4 class="box-h">Mensajes del pipeline</h4>
        <ul class="alerts-list">
          <li><div class="al-ic w"><i class="fa-solid fa-triangle-exclamation ic-meta" aria-hidden="true"></i></div><div><div class="al-t">Campo "Artículo 21" detectado con OCR dudoso (confianza 82%)</div><div class="cm">MA-010-2023 · extracción NER · requiere validación</div></div><button class="link sm">Revisar</button></li>
          <li><div class="al-ic i"><i class="fa-solid fa-circle-info ic-meta" aria-hidden="true"></i></div><div><div class="al-t">Patrón "deroga RE-" detectado en documento nuevo</div><div class="cm">RE-007-2024 · señal explícita · 5 candidatos generados</div></div><button class="link sm">Ver</button></li>
          <li><div class="al-ic e"><i class="fa-solid fa-xmark ic-meta" aria-hidden="true"></i></div><div><div class="al-t">Fallo de firma en metadato (XML DSig inválido)</div><div class="cm">CO-007-2023 · re-subir fuente oficial firmada</div></div><button class="link sm">Subir</button></li>
          <li><div class="al-ic w"><i class="fa-solid fa-triangle-exclamation ic-meta" aria-hidden="true"></i></div><div><div class="al-t">Sin versión anterior consolidada para diff</div><div class="cm">DI-014-2024 · primera carga en plataforma</div></div><button class="link sm">Ignorar</button></li>
        </ul>
      </div>

      ${ingestaSummary ? `
      <div class="ingesta-summary">
        <div class="sec-head mb2">
          <h3><i class="fa-solid fa-circle-check ic-meta" aria-hidden="true"></i> Resumen del procesamiento · RE-007-2024</h3>
          <a href="#/review" class="btn primary" id="goReviewFromIngesta">Comenzar revisión <i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i></a>
        </div>
        <div class="is-grid">
          ${ingestaSummary.map(is=>`<div class="is-item" style="border-left:3px solid ${is.c}">
            <div class="is-head"><span class="is-ic">${is.ic}</span><span class="is-n" style="color:${is.c}">${is.n}</span></div>
            <div class="is-t">${is.t}</div>
            <div class="cm">${is.s}</div>
          </div>`).join('')}
        </div>
      </div>` : ''}
    </div>

    <div class="card admin-card">
      <div class="sec-head"><h2>Bloque 2 · Gestión documental</h2></div>

      <div class="doc-filters">
        <label class="field sm"><span>Buscar</span><input class="input sm" id="adminTableSearch" type="text" placeholder="Código, título o unidad…" value="${escHTML(state.admin.tableSearch||'')}"/></label>
        <label class="field sm"><span>Tipo</span><select class="input sm" data-admin-f="tipo">${tipoOpts.map(t=>`<option>${t}</option>`).join('')}</select></label>
        <label class="field sm"><span>Unidad</span><select class="input sm" data-admin-f="unidad">${['Todos',...unidadOpts].map(u=>`<option>${u}</option>`).join('')}</select></label>
        <label class="field sm"><span>Estado vigencia</span><select class="input sm" data-admin-f="estado">${estadoOpts.map(e=>`<option>${e}</option>`).join('')}</select></label>
      </div>

      <div class="inline-actions doc-actions-row">
        <button class="btn ghost sm">Exportar CSV</button>
        <button class="btn ghost sm">Importar Excel</button>
        <button class="btn ghost sm">Carga masiva</button>
        <a href="#/review" class="btn primary sm">Revisar ${pendRev} afectaciones</a>
      </div>

      <div class="doc-table-wrap">
        <table class="doc-table">
          <thead><tr>
            <th>Código</th><th>Título</th><th>Tipo</th><th>Unidad</th><th>Fecha</th><th>Vigencia</th><th>Afectaciones</th><th>Acciones</th>
          </tr></thead>
          <tbody>
          ${docs.map(d=>{
            const hayRev = CANDIDATOS.some(c=>c.docCandId===d.id) || d.id===DOCUMENTOS[1].id;
            const revPend = hayRev ? pendRev : 0;
            return `<tr>
              <td class="mono dt-cod">${escHTML(d.codigo)}</td>
              <td><a href="#/detail/${d.id}" class="dt-title">${escHTML(d.titulo.length>60?d.titulo.slice(0,60)+'…':d.titulo)}</a></td>
              <td><span class="type-pill sm" style="background:${colorForTipo(d.tipo)}12;color:${colorForTipo(d.tipo)}">${escHTML(d.tipo)}</span></td>
              <td class="cm dt-un">${escHTML(d.unidad.length>22?d.unidad.slice(0,22)+'…':d.unidad)}</td>
              <td class="cm">${fmtDate(d.fecha)}</td>
              <td><span class="status ${slug(d.estado)} sm">${d.estado}</span></td>
              <td>${hayRev ? `<span class="est-chip ${revPend>0?'pend':'ok'} sm" data-row-review="${d.id}">${revPend>0?revPend+' pendientes':'<i class="fa-solid fa-check ic-meta" aria-hidden="true"></i> Revisado'}</span>` : `<span class="est-chip none sm">Sin señales</span>`}</td>
              <td class="row-actions">
                <button class="link sm" data-row-edit="${d.id}">Editar</button>
                ${hayRev?`<button class="link sm" data-row-review="${d.id}">Revisar</button>`:''}
                <button class="link sm danger" data-row-del="${d.id}">Archivar</button>
              </td>
            </tr>`;
          }).join('')}
          </tbody>
        </table>
      </div>

      <div class="act-recent">
        <div class="sec-head"><h3>Actividad reciente · auditoría</h3><span class="cm">Sello: <span class="mono">AUD-2025-08-0164</span></span></div>
        <ol class="act-list">
          <li><div class="a-ic up"><i class="fa-solid fa-arrow-up ic-meta" aria-hidden="true"></i></div><div><div>Documento <b>RE-007-2024</b> indexado · Etapa 4 completada.</div><div class="cm">Por Carlos Garrido · Administrador · hace 30 min</div></div></li>
          <li><div class="a-ic ok"><i class="fa-solid fa-check ic-meta" aria-hidden="true"></i></div><div>Decisión: <b>Aceptar</b> relación RE-001-2024 <i class="fa-solid fa-left-right ic-meta ic-slate" aria-hidden="true"></i> RE-002-2022 (Deroga).</div><div class="cm">Por Vicerrectoría Académica · Revisión K-02 · hace 2 h</div></div></li>
          <li><div class="a-ic comp"><i class="fa-solid fa-left-right ic-meta" aria-hidden="true"></i></div><div>Comparación abierta: RE-007-2024 <i class="fa-solid fa-left-right ic-meta ic-slate" aria-hidden="true"></i> RE-011-2021 desde ficha de detalle.</div><div class="cm">Por J. Soto · Admin. Finanzas · hace 5 h</div></div></li>
          <li><div class="a-ic warn"><i class="fa-solid fa-triangle-exclamation ic-meta" aria-hidden="true"></i></div><div>Alerta OCR resuelta · MA-010-2023 Art. 21 confirmado.</div><div class="cm">Por Carlos Garrido · hace 1 día</div></div></li>
          <li><div class="a-ic arc"><i class="fa-solid fa-folder-tree ic-meta" aria-hidden="true"></i></div><div>Carga unitaria: DI-014-2024 desde formulario manual.</div><div class="cm">Por M. Rojas · Admin. DIDECO · hace 2 días</div></div></li>
        </ol>
      </div>
    </div>
  </section>`;
}
function hookAdmin(){
  $$('[data-role]').forEach(b=>b.addEventListener('click', ()=>{
    state.admin.role = b.dataset.role; saveState(); renderCurrentView();
    toast(`Cambiado a rol "${b.textContent.trim()}".`,{kind:'info',title:'Rol activo'});
  }));

  const dz = $('#adminUploadZone');
  const input = $('#adminDzInput');
  const browse = $('#adminDzBrowse');
  function simulateUpload(){
    state.admin.pipelineStep = 0; saveState(); renderCurrentView();
    const delays = [350, 650, 700, 750, 850, 950, 1100];
    const msgs = [
      {k:'ok',t:'Paso 1 · Subida',m:'Documento recibido · almacenamiento seguro AES-256.'},
      {k:'info',t:'Paso 2 · Extracción',m:'Extrayendo estructura de artículos, párrafos y referencias cruzadas.'},
      {k:'info',t:'Paso 3 · Validación',m:'Validando metadatos contra esquema institucional · 1 advertencia (OCR Art. 21).'},
      {k:'ok',t:'Paso 4 · Indexación',m:'Vectorización semántica completada · 14.200 chunks indexados.'},
      {k:'warn',t:'Paso 5 · Señalizador',m:'Detectadas 8 referencias explícitas · 5 candidatos recuperados.'},
      {k:'info',t:'Paso 6 · Preparación',m:'Panel de revisión preparado · lista de candidatos rankeada.'},
      {k:'ok',t:'Paso 7 · Listo para publicar',m:'Procesamiento terminado · requiere validación humana de afectaciones.'}
    ];
    function step(i){
      if(i>=7) return;
      setTimeout(()=>{
        state.admin.pipelineStep = i+1; saveState(); renderCurrentView();
        toast(msgs[i].m,{kind:msgs[i].k,title:msgs[i].t});
        step(i+1);
      }, delays[i]);
    }
    step(0);
  }
  browse?.addEventListener('click', ()=>input?.click());
  input?.addEventListener('change', ()=>{ if(input.files?.length) simulateUpload(); });
  dz?.addEventListener('click', ()=>input?.click());
  dz?.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault(); input?.click();} });
  dz?.addEventListener('dragover', e=>{e.preventDefault(); dz.classList.add('drag');});
  dz?.addEventListener('dragleave', ()=>dz?.classList.remove('drag'));
  dz?.addEventListener('drop', e=>{e.preventDefault(); dz?.classList.remove('drag'); simulateUpload();});

  $('#cargaForm')?.addEventListener('submit', e=>{
    e.preventDefault(); simulateUpload();
    toast('Formulario enviado al pipeline de ingesta.',{kind:'ok',title:'Carga unitaria'});
  });

  $('#goReviewFromIngesta')?.addEventListener('click', (e)=>{
    e.preventDefault(); navigateTo('#/review');
  });

  $('#adminTableSearch')?.addEventListener('input', e=>{
    state.admin.tableSearch = e.target.value || ''; saveState();
    const q = state.admin.tableSearch.toLowerCase().trim();
    $$('.doc-table tbody tr').forEach(tr=>{
      if(!q){ tr.style.display=''; return; }
      const txt = tr.textContent.toLowerCase();
      tr.style.display = txt.includes(q) ? '' : 'none';
    });
  });
  $$('[data-admin-f]').forEach(sel=>sel.addEventListener('change', ()=>toast('(demo) Filtro de tabla aplicado.',{kind:'info',title:'Gestión'})));
  $$('[data-row-edit]').forEach(b=>b.addEventListener('click', ()=>toast('(demo) Editor inline de metadatos.',{kind:'info',title:'Editar'})));
  $$('[data-row-review]').forEach(b=>b.addEventListener('click', ()=>{
    const cid = b.dataset.rowReview;
    const cand = CANDIDATOS.find(c=>c.docCandId===cid);
    if(cand){ state.review._focusChange = cand.id; saveState(); }
    navigateTo('#/review');
  }));
  $$('[data-row-del]').forEach(b=>b.addEventListener('click', ()=>{
    toast('(demo) Documento movido a archivo histórico (sello auditoría).',{kind:'ok',title:'Archivar'});
  }));
}

/* =========================================================
   11. VISTA E · REVISIÓN DE AFECTACIONES
   ========================================================= */
function renderReview(){
  const nuevo = DOCUMENTOS[1]; // RE-007-2024 · documento en revisión
  const filt = state.review.filters;
  if(!state.review.selectedCand) state.review.selectedCand = state.review._focusChange ?
    (CANDIDATOS.find(c=>c.id===state.review._focusChange)?.id || CANDIDATOS[0].id) : CANDIDATOS[0].id;
  if(state.review._focusChange){ delete state.review._focusChange; saveState(); }

  // ========== CONTADORES PROGRESO ==========
  const totalCand = CANDIDATOS.length;
  const allDecs = Object.keys(state.review.decisions).reduce((acc,k)=>{ acc[k]=state.review.decisions[k]; return acc; }, {});
  const nAcep = Object.values(allDecs).filter(d=>d?.decision==='aceptar').length;
  const nCorr = Object.values(allDecs).filter(d=>d?.decision==='corregir').length;
  const nRech = Object.values(allDecs).filter(d=>d?.decision==='rechazar').length;
  const nPost = Object.values(allDecs).filter(d=>d?.decision==='posterior').length;
  const nPend = totalCand - (nAcep + nCorr + nRech + nPost);
  const progresoPct = totalCand>0 ? Math.round(((nAcep + nCorr + nRech + nPost)/totalCand)*100) : 0;

  // Sincronizar state.review.progress con contadores reales
  state.review.progress = { total:totalCand, aceptadas:nAcep, corregidas:nCorr, rechazadas:nRech, pendientes:nPend, posteriores:nPost };

  // ========== FILTRAR CANDIDATOS ==========
  let candList = CANDIDATOS.slice().map((c,idx)=>({...c, _rank: idx+1}));
  if(filt.relacion && filt.relacion!=='todas') candList = candList.filter(c=>c.relacionSugerida===filt.relacion);
  if(filt.confianza && filt.confianza!=='todas') candList = candList.filter(c=>c.confianza===filt.confianza);
  if(filt.estado && filt.estado!=='todas'){
    candList = candList.filter(c=>{
      const d = allDecs[c.id]?.decision;
      if(filt.estado==='pendiente') return !d;
      if(filt.estado==='decidido') return !!d;
      return d===filt.estado;
    });
  }
  if(filt.unidad && filt.unidad!=='todas') candList = candList.filter(c=>{
    const d = DOCUMENTOS.find(x=>x.id===c.docCandId); return d && d.unidad===filt.unidad;
  });
  if(filt.anio && filt.anio!=='todas') candList = candList.filter(c=>{
    const d = DOCUMENTOS.find(x=>x.id===c.docCandId); return d && String(d.anio)===String(filt.anio);
  });
  if(filt.senal && filt.senal!=='todas') candList = candList.filter(c=>c.senal===filt.senal);

  // ========== CANDIDATO SELECCIONADO ==========
  const candSel = CANDIDATOS.find(c=>c.id===state.review.selectedCand) || candList[0] || CANDIDATOS[0];
  const docCand = DOCUMENTOS.find(d=>d.id===candSel?.docCandId) || DOCUMENTOS[0];
  const decSel = allDecs[candSel?.id] || {};

  // ========== OPCIONES SELECTORES ==========
  const relacionOpts = ['Deroga','Modifica parcialmente','Incorpora lineamientos','Supletorio a','Derogado por','Modificado parcialmente por','Afecta presupuesto de proyecto','Complementa','Rectifica','Prorroga','Deja sin efecto','Sin afectación directa','Otro (describir)'];
  const unidadOpts = [...new Set(UNIDADES)];
  const anioOpts = [...new Set(DOCUMENTOS.map(d=>String(d.anio)))].sort().reverse();

  // ========== RENDER PANEL CANDIDATOS (lista rankeada) ==========
  const panelCand = candList.map(c=>{
    const otro = DOCUMENTOS.find(d=>d.id===c.docCandId) || {codigo:c.docCandId,titulo:c.docCandId,unidad:'',estado:'—',anio:'—'};
    const dec = allDecs[c.id] || {};
    const tr = TIPOS_REL_COLOR[c.relacionSugerida] || {c:'#566274',bg:'#E3E7EC',dir:'<i class="fa-solid fa-arrow-right ic-meta ic-slate" aria-hidden="true"></i>',etiqueta:'Relación'};
    const ec = ESTADOS_REL_COLOR[dec.decision==='aceptar'?'validado':dec.decision==='corregir'?'corregido':dec.decision==='rechazar'?'rechazado':dec.decision==='posterior'?'pendiente':'pendiente'] || ESTADOS_REL_COLOR.pendiente;
    const sn = SENAL_COLOR[c.senal] || SENAL_COLOR['híbrida'];
    const bar = c.confianza==='muy_alta'?98:c.confianza==='alta'?84:c.confianza==='media'?56:28;
    const isSel = state.review.selectedCand === c.id;
    return `<article class="cand-row ${isSel?'is-sel':''} ${dec.decision?'dec-'+dec.decision:''}" data-cand-row="${c.id}" tabindex="0" aria-label="Candidato ${c._rank} ${otro.codigo} ${c.relacionSugerida}">
      <div class="cr-rank"><span class="cr-n mono">${c._rank}</span></div>
      <div class="cr-body">
        <div class="cr-head">
          <span class="cr-rel-chip" style="background:${tr.bg};color:${tr.c}"><span>${tr.dir}</span>${escHTML(c.relacionSugerida.length>22?c.relacionSugerida.slice(0,22)+'…':c.relacionSugerida)}</span>
          <span class="cr-st ${dec.decision||''}" style="background:${ec.bg};color:${ec.c}"><span>${ec.icon}</span>${escHTML(ec.label)}</span>
        </div>
        <a href="#/detail/${otro.id}" class="cr-title">${escHTML(otro.titulo.length>85?otro.titulo.slice(0,85)+'…':otro.titulo)}</a>
        <div class="cr-sub cm"><span class="mono cr-cod">${escHTML(otro.codigo)}</span> · ${escHTML(otro.unidad.length>28?otro.unidad.slice(0,28)+'…':otro.unidad)} · ${otro.anio} · estado <span class="status sm ${slug(otro.estado)}">${otro.estado}</span></div>
        <div class="cr-foot">
          <div class="cr-senal" style="color:${sn.c}"><span>${sn.dot}</span>${escHTML(sn.label)}</div>
          <div class="conf-row cr-conf"><div class="conf-bar"><div class="conf-fill" style="width:${bar}%"></div></div><span class="conf-num mono cm">${textForConf(c.confianza)}</span></div>
        </div>
        <div class="cr-ev cm">“${escHTML((c.evidenciaNuevo?.[0]||c.porqueComparte?.[0]||'Sin evidencia precargada').slice(0,110))}…”</div>
      </div>
    </article>`;
  }).join('') || `<div class="empty-state"><div class="empty-icon"><i class="fa-solid fa-circle-slash ic-meta" aria-hidden="true"></i></div><h3>Sin candidatos con estos filtros</h3><p class="cm">Pruebe ajustando los filtros de relación, confianza o estado.</p><button class="btn primary" data-reset-review-filters>Limpiar filtros</button></div>`;

  // ========== RENDER COMPARACIÓN LADO A LADO ==========
  const evidenciaTotal = Math.max((candSel?.fragmentosSync?.length||0), 1);
  if(state.review.evIdx==null || state.review.evIdx>=evidenciaTotal) state.review.evIdx = 0;
  const evCur = state.review.evIdx;
  const tr = TIPOS_REL_COLOR[candSel?.relacionSugerida] || {c:'#566274',bg:'#E3E7EC',dir:'<i class="fa-solid fa-arrow-right ic-meta ic-slate" aria-hidden="true"></i>'};
  const sn = SENAL_COLOR[candSel?.senal] || SENAL_COLOR['híbrida'];
  const confBarVal = candSel?.confianza==='muy_alta'?98:candSel?.confianza==='alta'?84:candSel?.confianza==='media'?56:28;

  const lineasColumna = (side)=>{
    const arr = side==='nuevo' ? (candSel?.evidenciaNuevo||[]) : (candSel?.evidenciaCand||[]);
    const doc = side==='nuevo' ? nuevo : docCand;
    const hits = candSel?.fragmentosSync || [];
    return arr.map((t, i)=>{
      const key = side==='nuevo' ? 'nuevo' : 'cand';
      const isHit = hits.some(fs=>{
        const nd = (fs[key]||'').toLowerCase().slice(0,28);
        return nd && t.toLowerCase().includes(nd);
      });
      const isCurEv = (evCur === i) && isHit;
      return `<div class="ev-line ${isHit?'hit':''} ${isCurEv?'ev-current':''}">
        <div class="ev-ln mono cm">Art. ${(side==='nuevo'?3:7)+i} · Pág. ${(side==='nuevo'?2:4)+Math.floor(i/2)}</div>
        <div class="ev-txt">${escHTML(t)}</div>
      </div>`;
    }).join('') || `<div class="cm">No hay fragmentos de evidencia precargados para este candidato.</div>`;
  };

  const panelComp = state.review.selectedCand ? `
    <div class="comp-head">
      <div class="comp-doc comp-doc-new" style="--rib:${colorForTipo(nuevo.tipo)}">
        <div class="cd-body">
          <span class="tag-cat tag-new">Documento nuevo · Fuente</span>
          <a href="#/detail/${nuevo.id}" class="cd-title">${escHTML(nuevo.titulo)}</a>
          <div class="cd-meta cm"><span class="mono">${escHTML(nuevo.codigo)}</span> · ${escHTML(nuevo.unidad)} · ${fmtDate(nuevo.fecha)}</div>
        </div>
      </div>
      <div class="comp-rel-chip" style="background:${tr.bg};color:${tr.c};border:1px solid ${tr.c}33">
        <div class="crc-arrow">${tr.dir}</div>
        <div class="crc-label">${escHTML(candSel.relacionSugerida)}</div>
        <div class="crc-sen cm" style="color:${sn.c}"><span>${sn.dot}</span>${escHTML(sn.label)} · ${textForConf(candSel.confianza)} · ${confBarVal}%</div>
      </div>
      <div class="comp-doc comp-doc-cand" style="--rib:${tr.c}">
        <div class="cd-body">
          <span class="tag-cat tag-aff">Documento candidato · Afectado</span>
          <a href="#/detail/${docCand.id}" class="cd-title" style="color:var(--terracotta)">${escHTML(docCand.titulo)}</a>
          <div class="cd-meta cm"><span class="mono">${escHTML(docCand.codigo)}</span> · ${escHTML(docCand.unidad)} · ${fmtDate(docCand.fecha)}</div>
        </div>
      </div>
    </div>
    <div class="comp-ev-nav">
      <div class="nav-left">
        <button type="button" class="btn ghost xs" data-ev-prev ${evCur===0?'disabled':''}><i class="fa-solid fa-chevron-left ic-meta" aria-hidden="true"></i> Evidencia anterior</button>
        <span class="nav-pos mono"><b>${evCur+1}</b> / ${evidenciaTotal}</span>
        <button type="button" class="btn ghost xs" data-ev-next ${evCur===evidenciaTotal-1?'disabled':''}>Evidencia siguiente <i class="fa-solid fa-chevron-right ic-meta" aria-hidden="true"></i></button>
      </div>
      <div class="nav-right">
        <button type="button" class="btn ghost xs" data-zoom-new><i class="fa-solid fa-magnifying-glass ic-meta" aria-hidden="true"></i> Ampliar nuevo</button>
        <button type="button" class="btn ghost xs" data-zoom-cand><i class="fa-solid fa-magnifying-glass ic-meta" aria-hidden="true"></i> Ampliar candidato</button>
        <button type="button" class="btn ghost xs" data-open-compare-full><i class="fa-solid fa-left-right ic-meta" aria-hidden="true"></i> Comparación detallada</button>
      </div>
    </div>
    <div class="evidence-grid v2" aria-label="Comparación lado a lado">
      <div class="ev-col">
        <div class="ev-head v2"><span class="ev-tag new">Nuevo · ${escHTML(nuevo.codigo)}</span><span class="cm mono">${candSel.evidenciaNuevo?.length||0} fragmentos</span></div>
        <div class="ev-lines">${lineasColumna('nuevo')}</div>
      </div>
      <div class="ev-col">
        <div class="ev-head v2 tgt"><span class="ev-tag cand">Candidato · ${escHTML(docCand.codigo)}</span><span class="cm mono">${candSel.evidenciaCand?.length||0} fragmentos</span></div>
        <div class="ev-lines">${lineasColumna('cand')}</div>
      </div>
    </div>
    <div class="comp-hint cm"><i class="fa-solid fa-lightbulb ic-meta" aria-hidden="true"></i> Los pasajes <mark class="hit-mark">resaltados</mark> corresponden a fragmentos sincronizados utilizados como evidencia de la relación propuesta. Navegue entre evidencias para evaluar cada coincidencia.</div>
  ` : `
    <div class="comp-empty">
      <div class="ce-icon"><i class="fa-solid fa-scale-balanced ic-meta" aria-hidden="true"></i></div>
      <h3>Seleccione un candidato</h3>
      <p class="cm">Elija un documento candidato desde el panel de la izquierda para visualizar la comparación lado a lado, revisar la evidencia y tomar una decisión.</p>
      <ul class="ce-tips cm">
        <li><i class="fa-solid fa-check ic-meta" aria-hidden="true"></i> Revise la dirección y el <b>tipo de relación propuesta</b>.</li>
        <li><i class="fa-solid fa-magnifying-glass ic-meta" aria-hidden="true"></i> Confirme que los <b>fragmentos de evidencia</b> sustentan la sugerencia.</li>
        <li><i class="fa-solid fa-scale-balanced ic-meta" aria-hidden="true"></i> Corrija si la detección automática no es precisa.</li>
      </ul>
    </div>
  `;

  // ========== HISTORIAL DE TRAZABILIDAD ==========
  const histDec = state.review.history || [];
  const allHistory = [
    // decisiones actuales convertidas a entradas históricas
    ...Object.keys(allDecs).map(k=>{
      const c = CANDIDATOS.find(cc=>cc.id===k);
      const otro = DOCUMENTOS.find(d=>d.id===c?.docCandId);
      const d = allDecs[k];
      return {
        id: k+'_auto',
        usuario: d.usuario || 'C. Garrido (sesión actual)',
        fecha: d.fecha || new Date().toISOString().slice(0,10),
        accion: d.decision==='aceptar'?'Aceptar relación':d.decision==='corregir'?'Corregir relación':d.decision==='rechazar'?'Rechazar relación':'Marcar para revisión posterior',
        relOrig: c?.relacionSugerida||'—',
        relDef: d.relacionNueva || (d.decision==='rechazar'?'Sin relación':c?.relacionSugerida||'—'),
        obs: d.observacion || '',
        codigoOtro: otro?.codigo||''
      };
    }).reverse(),
    ...histDec
  ];
  const histHtml = allHistory.length ? allHistory.slice(0,15).map(h=>`
    <li class="hdec-item">
      <div class="hdec-who"><span class="hdec-user">${escHTML(h.usuario)}</span><span class="hdec-when cm mono">${fmtDate(h.fecha)} · ${h.hora||'12:00'}</span></div>
      <div class="hdec-act"><span class="hdec-tag ${slug(h.accion.split(' ')[0])}">${escHTML(h.accion)}</span></div>
      <div class="hdec-rel"><span class="hdec-k cm">Original:</span><b>${escHTML(h.relOrig)}</b><span class="hdec-arrow"><i class="fa-solid fa-arrow-right ic-meta" aria-hidden="true"></i></span><span class="hdec-k cm">Definitiva:</span><b>${escHTML(h.relDef)}</b>${h.codigoOtro?`<span class="hdec-cod mono">· ${escHTML(h.codigoOtro)}</span>`:''}</div>
      ${h.obs?`<div class="hdec-obs"><b class="cm">Observación:</b> ${escHTML(h.obs)}</div>`:''}
    </li>`).join('') : `<div class="cm">No hay decisiones registradas aún. La trazabilidad comenzará con la primera aceptación, corrección o rechazo.</div>`;

  // ========== RENDER FINAL ==========
  return `
  <header class="page-head">
    <div class="rh2-top">
      <div>
        <h1 class="display"><i class="fa-solid fa-scale-balanced ic-meta" aria-hidden="true"></i> Consola de Revisión de Afectaciones y Relaciones Documentales</h1>
        <p class="deck">Valide, corrija o rechace las sugerencias automáticas. Las relaciones <b>nunca</b> se publican sin confirmación humana.</p>
      </div>
      <div class="rh2-ctas">
        <button class="btn ghost" data-back-admin><i class="fa-solid fa-chevron-left ic-meta" aria-hidden="true"></i> Volver a administración</button>
        <button class="btn ghost" data-save-draft><i class="fa-solid fa-floppy-disk ic-meta" aria-hidden="true"></i> Guardar borrador</button>
        <button class="btn primary strong" data-publish ${nPend>0?'disabled':''}><i class="fa-solid fa-check ic-meta" aria-hidden="true"></i> Publicar y registrar (${totalCand-nPend}/${totalCand})</button>
      </div>
    </div>
  </header>

  <!-- CABECERA: DOCUMENTO NUEVO + PROGRESO + ADVERTENCIA -->
  <section class="rh2-head card">
    <div class="rh2-doc-new" style="--rib:${colorForTipo(nuevo.tipo)}">
      <div class="rh2-dn-info">
        <div class="rh2-dn-k cm mono">Documento nuevo analizado</div>
        <div class="rh2-dn-head">
          <span class="type-pill" style="background:${colorForTipo(nuevo.tipo)}11;color:${colorForTipo(nuevo.tipo)}">${escHTML(nuevo.tipo)}</span>
          <span class="mono rh2-cod">${escHTML(nuevo.codigo)}</span>
          <span class="status ${slug(nuevo.estado)} sm">${nuevo.estado}</span>
          <span class="access ${slug(nuevo.disponibilidad)} sm">${nuevo.disponibilidad}</span>
        </div>
        <h2 class="rh2-dn-title">${escHTML(nuevo.titulo)}</h2>
        <div class="cm rh2-dn-foot">${escHTML(nuevo.unidad)} · ${fmtDate(nuevo.fecha)} · Versión v${nuevo.versiones?.[0]?.v||'1.0'} · ${(nuevo.consultas||0).toLocaleString('es-CL')} consultas previas</div>
      </div>
      <div class="rh2-metrics">
        <div class="rh2-met total"><span class="rm-lb cm">Candidatos</span><span class="rm-n">${totalCand}</span><span class="rm-sb cm">detectados</span></div>
        <div class="rh2-met acep"><span class="rm-lb cm">Aceptadas</span><span class="rm-n">${nAcep}</span><span class="rm-sb cm">relaciones</span></div>
        <div class="rh2-met corr"><span class="rm-lb cm">Corregidas</span><span class="rm-n">${nCorr}</span><span class="rm-sb cm">relaciones</span></div>
        <div class="rh2-met rech"><span class="rm-lb cm">Rechazadas</span><span class="rm-n">${nRech}</span><span class="rm-sb cm">relaciones</span></div>
        <div class="rh2-met pend"><span class="rm-lb cm">Pendientes</span><span class="rm-n">${nPend}</span><span class="rm-sb cm">+ ${nPost} posterior</span></div>
      </div>
    </div>
    <div class="rh2-progress">
      <div class="rh2-p-head">
        <div class="cm"><b>Progreso de revisión</b> · Requiere validación humana · Las relaciones automáticas no son definitivas.</div>
        <div class="mono rh2-pct"><b>${progresoPct}%</b> · ${totalCand-nPend}/${totalCand} resueltos</div>
      </div>
      <div class="progbar">
        <div class="pbar pbar-ok" style="width:${totalCand>0?(nAcep/totalCand)*100:0}%" title="Aceptadas"></div>
        <div class="pbar pbar-warn" style="width:${totalCand>0?(nCorr/totalCand)*100:0}%" title="Corregidas"></div>
        <div class="pbar pbar-err" style="width:${totalCand>0?(nRech/totalCand)*100:0}%" title="Rechazadas"></div>
        <div class="pbar pbar-info" style="width:${totalCand>0?(nPost/totalCand)*100:0}%" title="Revisión posterior"></div>
      </div>
      <div class="rh2-p-legend cm">
        <span><span class="pdot ok"></span>Aceptadas</span>
        <span><span class="pdot warn"></span>Corregidas</span>
        <span><span class="pdot err"></span>Rechazadas</span>
        <span><span class="pdot info"></span>Revisión posterior</span>
        <span><span class="pdot pend"></span>Pendientes</span>
      </div>
    </div>
    <div class="rh2-warn" role="alert">
      <div class="rh2w-ic"><i class="fa-solid fa-triangle-exclamation ic-meta" aria-hidden="true"></i></div>
      <div class="rh2w-body"><b>Importante:</b> las relaciones presentadas son <b>sugerencias asistidas</b> producto de señales explícitas, coincidencia léxica o recuperación semántica. <b>Nunca</b> se consideran válidas hasta que un administrador confirme la decisión. Solicite una <b>observación obligatoria</b> al corregir o rechazar una propuesta.</div>
    </div>
  </section>

  <!-- FILTROS 6 COLUMNAS -->
  <section class="card rh2-filters">
    <div class="sec-head">
      <div>
        <h2 class="sec-title v2"><i class="fa-solid fa-magnifying-glass ic-meta" aria-hidden="true"></i> Panel de candidatos · filtros</h2>
        <p class="sec-sub">Los candidatos aparecen rankeados por combinación de confianza, tipo de señal y antigüedad del documento afectado.</p>
      </div>
    </div>
    <div class="rh2-f-grid">
      <label class="field"><span>Tipo de relación</span><select data-rf="relacion" class="input">
        ${['todas',...relacionOpts].map(r=>`<option ${filt.relacion===r?'selected':''}>${r==='todas'?'Todas las relaciones':r}</option>`).join('')}
      </select></label>
      <label class="field"><span>Nivel de confianza</span><select data-rf="confianza" class="input">
        ${['todas','muy_alta','alta','media','baja'].map(r=>`<option value="${r}" ${filt.confianza===r?'selected':''}>${r==='todas'?'Todos los niveles':textForConf(r)}</option>`).join('')}
      </select></label>
      <label class="field"><span>Estado de revisión</span><select data-rf="estado" class="input">
        ${['todas','pendiente','decidido','aceptar','corregir','rechazar','posterior'].map(r=>`<option ${filt.estado===r?'selected':''}>${r==='todas'?'Todos':r==='pendiente'?'Pendientes':r==='decidido'?'Decididos':r==='aceptar'?'Aceptados':r==='corregir'?'Corregidos':r==='rechazar'?'Rechazados':'Marcados para después'}</option>`).join('')}
      </select></label>
      <label class="field"><span>Unidad responsable</span><select data-rf="unidad" class="input">
        ${['todas',...unidadOpts].map(r=>`<option ${filt.unidad===r?'selected':''}>${r==='todas'?'Todas las unidades':r}</option>`).join('')}
      </select></label>
      <label class="field"><span>Año normativo</span><select data-rf="anio" class="input">
        ${['todas',...anioOpts].map(r=>`<option ${filt.anio===r?'selected':''}>${r==='todas'?'Todos los años':r}</option>`).join('')}
      </select></label>
      <label class="field"><span>Origen de detección</span><select data-rf="senal" class="input">
        ${['todas','explícita','léxica','semántica','híbrida'].map(r=>`<option value="${r}" ${filt.senal===r?'selected':''}>${r==='todas'?'Todos los orígenes':textForSenal(r)}</option>`).join('')}
      </select></label>
    </div>
    <div class="bulk-actions">
      <span class="cm">Con <b>${state.review.selected?.length||0}</b> seleccionados (checkbox manual):</span>
      <button class="btn ghost sm ok" data-bulk="aceptar" ${(state.review.selected?.length||0)===0?'disabled':''}><i class="fa-solid fa-check ic-meta" aria-hidden="true"></i> Aceptar lote</button>
      <button class="btn ghost sm warn" data-bulk="corregir" ${(state.review.selected?.length||0)===0?'disabled':''}><i class="fa-solid fa-pen-to-square ic-meta" aria-hidden="true"></i> Corregir lote</button>
      <button class="btn ghost sm err" data-bulk="rechazar" ${(state.review.selected?.length||0)===0?'disabled':''}><i class="fa-solid fa-xmark ic-meta" aria-hidden="true"></i> Rechazar lote</button>
      <button class="btn ghost sm" data-reset-review-filters><i class="fa-solid fa-broom ic-meta" aria-hidden="true"></i> Limpiar filtros</button>
    </div>
  </section>

  <!-- GRID PRINCIPAL: CANDIDATOS | COMPARACIÓN -->
  <section class="rh2-grid">
    <aside class="rh2-col-cand" aria-label="Panel de candidatos rankeados">
      <div class="rcc-head">
        <div class="sec-title v2 sm"><i class="fa-solid fa-book ic-meta" aria-hidden="true"></i> Candidatos (${candList.length})</div>
        <div class="cm">Ranking · confianza · tipo señal</div>
      </div>
      <div class="rcc-list">${panelCand}</div>
    </aside>
    <div class="rh2-col-comp card" aria-label="Comparación lado a lado y decisión">
      ${panelComp}
      ${state.review.selectedCand ? `
        <!-- DECISIÓN HUMANA · 4 BOTONES -->
        <section class="decision-box">
          <div class="db-head">
            <div class="db-title"><i class="fa-solid fa-bullseye ic-meta" aria-hidden="true"></i> Decisión humana · candidato <span class="mono">${candSel.id}</span> sobre <span class="mono">${docCand.codigo}</span></div>
            <div class="db-state ${decSel.decision||''}">${decSel.decision?`<span>Estado actual: <b>${decSel.decision==='aceptar'?'Aceptada':decSel.decision==='corregir'?'Corregida':decSel.decision==='rechazar'?'Rechazada':'Revisión posterior'}</b></span>`:'<span class="cm">Pendiente · debe confirmar la validez de la relación propuesta.</span>'}</div>
          </div>
          <div class="db-btns" role="group" aria-label="Acciones de decisión">
            <button type="button" class="dec-btn-4 db-acept ${decSel.decision==='aceptar'?'on':''}" data-dec="aceptar" data-cur="${candSel.id}"><span class="dbi"><i class="fa-solid fa-check ic-meta" aria-hidden="true"></i></span><span class="dbl">Aceptar relación</span><span class="dbs cm">La evidencia es consistente</span></button>
            <button type="button" class="dec-btn-4 db-corr ${decSel.decision==='corregir'?'on':''}" data-dec="corregir" data-cur="${candSel.id}"><span class="dbi"><i class="fa-solid fa-pen-to-square ic-meta" aria-hidden="true"></i></span><span class="dbl">Corregir relación</span><span class="dbs cm">Cambiar tipo o evidencia</span></button>
            <button type="button" class="dec-btn-4 db-rech ${decSel.decision==='rechazar'?'on':''}" data-dec="rechazar" data-cur="${candSel.id}"><span class="dbi"><i class="fa-solid fa-xmark ic-meta" aria-hidden="true"></i></span><span class="dbl">Rechazar relación</span><span class="dbs cm">No hay sustento suficiente</span></button>
            <button type="button" class="dec-btn-4 db-post ${decSel.decision==='posterior'?'on':''}" data-dec="posterior" data-cur="${candSel.id}"><span class="dbi"><i class="fa-solid fa-clock ic-meta" aria-hidden="true"></i></span><span class="dbl">Revisar más tarde</span><span class="dbs cm">Dejar para segunda pasada</span></button>
          </div>

          <!-- MODAL CORREGIR inline expandible -->
          ${(decSel.decision==='corregir' || (state.review.corrOpen && state.review.corrOpen===candSel.id)) ? `
          <div class="corr-box" id="corrBox_${candSel.id}" role="region" aria-label="Corregir relación">
            <div class="corr-head"><span class="corr-ic"><i class="fa-solid fa-pen-to-square ic-meta" aria-hidden="true"></i></span><div><b>Corregir relación propuesta</b><div class="cm">Ajuste el tipo de relación y/o el fragmento de evidencia. La observación es <b>obligatoria</b> para esta acción.</div></div></div>
            <div class="corr-grid">
              <label class="field full"><span>* Tipo de relación definitiva</span>
                <select data-corrrel="${candSel.id}" class="input" required>
                  ${relacionOpts.map(r=>`<option ${(decSel.relacionNueva||candSel.relacionSugerida)===r?'selected':''}>${escHTML(r)}</option>`).join('')}
                </select>
              </label>
              <label class="field full"><span>* Fragmento de evidencia (seleccionar o editar)</span>
                <textarea data-correv="${candSel.id}" class="input" rows="3" required placeholder="Seleccione o edite el pasaje que sustenta la relación corregida.">${escHTML(decSel.evidenciaCorr || (candSel.fragmentosSync?.[evCur]?.nuevo || candSel.evidenciaNuevo?.[0] || ''))}</textarea>
              </label>
              <label class="field full"><span>* Observación · justificación de la corrección</span>
                <textarea data-corrobs="${candSel.id}" class="input" rows="2" required placeholder="Explique por qué modifica la sugerencia automática (ej: tipo de relación incorrecto, documento equivocado, etc.). Esta justificación queda en el registro histórico.">${escHTML(decSel.observacion || '')}</textarea>
              </label>
            </div>
            <div class="corr-foot"><button type="button" class="btn ghost sm" data-corr-cancel="${candSel.id}">Cancelar</button><button type="button" class="btn primary sm" data-corr-save="${candSel.id}"><i class="fa-solid fa-check ic-meta" aria-hidden="true"></i> Confirmar corrección</button></div>
          </div>` : ''}

          <!-- OBSERVACIÓN OBLIGATORIA SI RECHAZA -->
          ${decSel.decision==='rechazar' ? `
          <div class="corr-box warn">
            <div class="corr-head warn"><span class="corr-ic"><i class="fa-solid fa-xmark ic-meta" aria-hidden="true"></i></span><div><b>Confirmar rechazo</b><div class="cm">Agregue una observación obligatoria explicando los motivos del rechazo. El candidato quedará descartado en el registro histórico.</div></div></div>
            <div class="corr-grid">
              <label class="field full"><span>* Motivo del rechazo (obligatorio)</span>
                <textarea data-obs="${candSel.id}" class="input" rows="2" required placeholder="Ej.: ámbitos disjuntos, documento no relacionado, evidencia insuficiente, etc.">${escHTML(decSel.observacion || '')}</textarea>
              </label>
            </div>
          </div>` : ''}
        </section>
      ` : ''}
    </div>
  </section>

  <!-- HISTORIAL DE TRAZABILIDAD -->
  <section class="card rh2-hist">
    <div class="sec-head">
      <div>
        <h2 class="sec-title v2"><i class="fa-solid fa-scroll ic-meta" aria-hidden="true"></i> Trazabilidad · registro de decisiones</h2>
        <p class="sec-sub">Historial completo de acciones con usuario responsable, marca temporal, relación original vs. definitiva y observaciones. Información de auditoría para fines institucionales.</p>
      </div>
    </div>
    <ul class="hdec-list">${histHtml}</ul>
  </section>

  ${nPend===0 ? `
  <section class="card final-resumen">
    <div class="sec-head"><h2><i class="fa-solid fa-circle-check ic-meta" aria-hidden="true"></i> Resumen final · listo para publicar</h2><span class="cm">No quedan candidatos pendientes.</span></div>
    <div class="final-grid">
      <div class="final-met ok"><div class="fm-v">${nAcep}</div><div class="fm-t">Relaciones aceptadas</div></div>
      <div class="final-met warn"><div class="fm-v">${nCorr}</div><div class="fm-t">Relaciones corregidas</div></div>
      <div class="final-met err"><div class="fm-v">${nRech}</div><div class="fm-t">Relaciones rechazadas</div></div>
      <div class="final-met info"><div class="fm-v">${nPost}</div><div class="fm-t">Revisión posterior</div></div>
      <div class="final-met total"><div class="fm-v">${totalCand}</div><div class="fm-t">Total procesados</div></div>
    </div>
    <p class="cm mt-s"><b>Nota:</b> al publicar se actualizarán los metadatos de cada documento, su historial de versiones y las relaciones cruzadas en el buscador semántico.</p>
  </section>` : ''}
  `;
}
function hookReview(){
  const rf = state.review.filters;
  // ============ FILTROS ============
  $$('[data-rf]').forEach(s=>s.addEventListener('change', ()=>{ rf[s.dataset.rf]=s.value; saveState(); renderCurrentView(); }));
  $('[data-reset-review-filters]')?.addEventListener('click', ()=>{
    state.review.filters = {relacion:'todas',confianza:'todas',estado:'todas',unidad:'todas',anio:'todas',senal:'todas'};
    saveState(); renderCurrentView();
  });

  // ============ SELECCIONAR CANDIDATO PARA COMPARAR ============
  $$('[data-cand-row]').forEach(r=>{
    r.addEventListener('click', e=>{
      if(e.target.closest('a,button,input,select,textarea')) return;
      state.review.selectedCand = r.dataset.candRow;
      state.review.evIdx = 0;
      saveState(); renderCurrentView();
    });
    r.addEventListener('keydown', e=>{
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); r.click(); }
    });
  });

  // ============ NAVEGACIÓN EVIDENCIAS ============
  $('[data-ev-prev]')?.addEventListener('click', ()=>{
    if(state.review.evIdx>0){ state.review.evIdx--; saveState(); renderCurrentView(); }
  });
  $('[data-ev-next]')?.addEventListener('click', ()=>{
    const candSel = CANDIDATOS.find(c=>c.id===state.review.selectedCand);
    const total = Math.max((candSel?.fragmentosSync?.length||0),1);
    if(state.review.evIdx<total-1){ state.review.evIdx++; saveState(); renderCurrentView(); }
  });

  // ============ ABRIR COMPARACIÓN / ZOOM FULL ============
  const sc = CANDIDATOS.find(c=>c.id===state.review.selectedCand);
  $('[data-open-compare-full]')?.addEventListener('click', ()=>{
    if(sc) openCompare(sc.docNuevoId, sc.docCandId, sc.id);
  });
  $('[data-zoom-new]')?.addEventListener('click', ()=>{ sc ? navigateTo('#/detail/'+sc.docNuevoId) : null; });
  $('[data-zoom-cand]')?.addEventListener('click', ()=>{ sc ? navigateTo('#/detail/'+sc.docCandId) : null; });

  // ============ 4 BOTONES DECISIÓN ============
  $$('[data-dec]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.cur; const dec = b.dataset.dec;
      const prev = state.review.decisions[id] || {};
      // Validar observación obligatoria en rechazo/corrección más tarde al guardar
      if(dec==='corregir'){
        state.review.corrOpen = id;
        state.review.decisions[id] = Object.assign({}, prev, {decision:dec, fecha:new Date().toISOString().slice(0,10), usuario:'C. Garrido (sesión actual)'});
        saveState(); toast('Modo corrección abierto. Complete tipo de relación y justificación.',{kind:'warn',title:'Corregir',ms:2400});
        renderCurrentView();
        setTimeout(()=>{ const box = document.getElementById('corrBox_'+id); if(box){ box.scrollIntoView({behavior:'smooth', block:'center'}); box.querySelector('select,textarea')?.focus(); } }, 80);
        return;
      }
      if(dec==='rechazar'){
        state.review.decisions[id] = Object.assign({}, prev, {decision:dec, fecha:new Date().toISOString().slice(0,10), usuario:'C. Garrido (sesión actual)'});
        saveState(); toast('Por favor ingrese el motivo del rechazo (obligatorio).',{kind:'warn',title:'Rechazar',ms:2400});
        renderCurrentView();
        return;
      }
      // Aceptar o Posterior
      state.review.decisions[id] = Object.assign({}, prev, {decision:dec, fecha:new Date().toISOString().slice(0,10), usuario:'C. Garrido (sesión actual)'});
      saveState();
      toast(dec==='aceptar'?'¡Relación aceptada y registrada!':'Marcado para revisión posterior.', {kind:dec==='aceptar'?'ok':'info', title:'Decisión'});
      renderCurrentView();
    });
  });

  // ============ CORREGIR: save / cancel ============
  $$('[data-corr-save]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.corrSave;
      const selRel = $(`select[data-corrrel="${id}"]`)?.value;
      const selEv = $(`textarea[data-correv="${id}"]`)?.value?.trim();
      const selObs = $(`textarea[data-corrobs="${id}"]`)?.value?.trim();
      if(!selObs){ toast('La observación es obligatoria para corregir una propuesta.',{kind:'err',title:'Falta justificación'}); return; }
      const prev = state.review.decisions[id] || {};
      state.review.decisions[id] = Object.assign({}, prev, {
        decision:'corregir', relacionNueva: selRel, evidenciaCorr: selEv, observacion: selObs,
        fecha:new Date().toISOString().slice(0,10), hora: new Date().toTimeString().slice(0,5),
        usuario:'C. Garrido (sesión actual)'
      });
      delete state.review.corrOpen;
      saveState(); toast('Corrección confirmada y registrada en trazabilidad.',{kind:'ok',title:'Corregido'});
      renderCurrentView();
    });
  });
  $$('[data-corr-cancel]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.corrCancel;
      delete state.review.corrOpen;
      const prev = state.review.decisions[id] || {};
      if(prev.decision==='corregir' && !prev.observacion){ delete state.review.decisions[id]; } // volvemos a pendiente si no confirmó
      saveState(); renderCurrentView();
    });
  });

  // ============ OBSERVACIÓN RECHAZO ============
  $$('textarea[data-obs]').forEach(t=>{
    t.addEventListener('input', ()=>{
      const id = t.dataset.obs; const prev = state.review.decisions[id] || {};
      state.review.decisions[id] = Object.assign({}, prev, {observacion: t.value});
    });
    t.addEventListener('blur', ()=>saveState());
  });

  // ============ ACCIONES MASIVAS / BOTONES HEADER ============
  $$('[data-bulk]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const dec = b.dataset.bulk;
      const ids = state.review.selected || [];
      if(!ids.length){ toast('No hay candidatos seleccionados para acción masiva.',{kind:'warn',title:'Lote'}); return; }
      ids.forEach(id=>{
        const prev = state.review.decisions[id]||{};
        state.review.decisions[id] = Object.assign({}, prev, {decision:dec, fecha:new Date().toISOString().slice(0,10), usuario:'C. Garrido (acción masiva)'});
      });
      saveState(); toast(`${ids.length} candidatos procesados en lote · ${dec}.`,{kind:'ok',title:'Acción masiva'});
      state.review.selected = []; saveState(); renderCurrentView();
    });
  });
  $('[data-save-draft]')?.addEventListener('click', ()=>{ saveState(); toast('Borrador guardado. Regreso cuando quiera.',{kind:'ok',title:'Borrador'}); });
  $('[data-back-admin]')?.addEventListener('click', ()=>navigateTo('#/admin'));

  // ============ PUBLICAR ============
  const publish = $('[data-publish]');
  publish?.addEventListener('click', ()=>{
    let ok = true;
    Object.keys(state.review.decisions).forEach(id=>{
      const d = state.review.decisions[id];
      if((d.decision==='rechazar'||d.decision==='corregir') && !d.observacion?.trim()){ ok = false; }
    });
    if(!ok){ toast('Falta observación obligatoria en al menos una corrección o rechazo.',{kind:'err',title:'Validación'}); return; }
    const pend = CANDIDATOS.length - Object.keys(state.review.decisions).filter(k=>{const d=state.review.decisions[k];return d&&(d.decision==='aceptar'||d.decision==='corregir'||d.decision==='rechazar'||d.decision==='posterior');}).length;
    if(pend>0){ toast(`Aún tiene ${pend} candidato(s) sin decisión. Use "Revisar más tarde" para marcarlos.`,{kind:'warn',title:'Publicación bloqueada'}); return; }
    toast('¡Publicación ejecutada! Registro histórico y relaciones actualizadas en buscador.',{kind:'ok',title:'Publicación',ms:5200});
    setTimeout(()=>navigateTo('#/detail/'+DOCUMENTOS[1].id), 900);
  });

  // badge nav
  const prog = state.review.progress || {pendientes:0};
  const badge = $('#pendingBadge');
  if(badge) badge.textContent = String(prog.pendientes || 0);
}

/* =========================================================
   12. MODAL COMPARACIÓN DOCUMENTAL (lado a lado)
   ========================================================= */
function openCompare(aId, bId, candId=null){
  const a = DOCUMENTOS.find(d=>d.id===aId) || DOCUMENTOS[0];
  const b = DOCUMENTOS.find(d=>d.id===bId) || DOCUMENTOS[1];
  const modal = $('#compareModal');
  const cand = CANDIDATOS.find(c=>c.id===candId);
  _currentCompareCandId = candId || null;
  const lines = (doc, side) => {
    const arr = doc.articulos || [];
    if(cand){
      return arr.map((t)=>{
        const key = side==='A' ? 'nuevo' : 'cand';
        const hits = cand.fragmentosSync || [];
        const isHit = hits.some(fs => {
          const needle = (fs[key]||'').toLowerCase().slice(0,30);
          return needle && t.toLowerCase().includes(needle);
        });
        return `<div class="cp-line ${isHit?'hit':''}">${escHTML(t)}</div>`;
      }).join('');
    }
    return arr.map(t=>`<div class="cp-line">${escHTML(t)}</div>`).join('');
  };
  $('#compareTitle').innerHTML = `Comparación · ${escHTML(a.codigo)} <i class="fa-solid fa-left-right ic-meta ic-accent" aria-hidden="true"></i> ${escHTML(b.codigo)}`;
  $('#compareGrid').innerHTML = `
    <div class="compare-col">
      <h4>${escHTML(a.titulo)}</h4>
      <div class="cm">${escHTML(a.codigo)} · ${escHTML(a.unidad)} · ${fmtDate(a.fecha)} · <span class="status ${slug(a.estado)}">${a.estado}</span></div>
      ${lines(a,'A')}
    </div>
    <div class="compare-col">
      <h4>${escHTML(b.titulo)}</h4>
      <div class="cm">${escHTML(b.codigo)} · ${escHTML(b.unidad)} · ${fmtDate(b.fecha)} · <span class="status ${slug(b.estado)}">${b.estado}</span></div>
      ${lines(b,'B')}
    </div>
  `;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(()=> modal.querySelector('[data-close-modal]')?.focus({preventScroll:true}), 30);
}
function closeCompare(){
  const modal = $('#compareModal');
  if(!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
  _currentCompareCandId = null;
}

/* =========================================================
   13. DRAWER DE FILTROS (móvil)
   ========================================================= */
function openDrawer(){
  const facets = document.querySelector('.facets, .facets.v3');
  const host = document.getElementById('drawerFacets');
  if(!host || !facets) return;
  host.innerHTML = facets.innerHTML;
  const d = document.getElementById('filterDrawer'); if(d){ d.hidden = false; }
  document.body.style.overflow='hidden';
  hookFacets(host);
}
function closeDrawer(){
  const d = $('#filterDrawer'); if(!d) return;
  d.hidden = true;
  document.body.style.overflow = '';
}

/* =========================================================
   14. GLOBAL SEARCH BAR (sugerencias y atajo "/")
   ========================================================= */
let gsActiveIdx = -1;
function buildSuggestions(q, max=8){
  if(!q) return [];
  const qq = q.toLowerCase();
  const res = [];
  for(const d of DOCUMENTOS){
    const s = scoreDoc(d,qq);
    if(s>0) res.push({doc:d, score:s, type:'documento'});
  }
  res.sort((a,b)=>b.score-a.score);
  return res.slice(0,max);
}
function updateGsActive(){
  $$('#gsSuggestions .gs-sugg-row').forEach((r,i)=>{
    const act = i===gsActiveIdx;
    r.classList.toggle('active', act);
    r.setAttribute('aria-selected', act?'true':'false');
    if(act) try{r.scrollIntoView({block:'nearest'});}catch(e){}
  });
}
function closeSuggestions(){
  const h = $('#gsSuggestions'); if(h){ h.hidden = true; h.innerHTML=''; }
  gsActiveIdx = -1;
}
function openDetailFromSuggestion(){
  const rows = $$('#gsSuggestions .gs-sugg-row');
  if(gsActiveIdx<0){
    const q = $('#homeSearch')?.value.trim();
    if(q){ state.search.query = q; saveState(); navigateTo('#/search?q='+encodeURIComponent(q)); }
    return;
  }
  const row = rows[gsActiveIdx];
  if(!row) return;
  const id = row.dataset.doc;
  closeSuggestions();
  navigateTo('#/detail/'+id);
}
function renderSuggestions(q){
  const host = $('#gsSuggestions');
  if(!host) return;
  const arr = buildSuggestions(q, 6);
  if(!arr.length || !q.trim()){ host.hidden=true; host.innerHTML=''; gsActiveIdx=-1; return; }
  host.hidden = false;
  gsActiveIdx = -1;
  host.innerHTML = arr.map((r,i)=>`
    <div class="gs-sugg-row" role="option" data-doc="${r.doc.id}" data-idx="${i}" id="gsopt-${i}" aria-selected="false">
      <div class="gs-sugg-icon">${escHTML(monogramFor(r.doc))}</div>
      <div>
        <div class="gs-sugg-text">${highlight(r.doc.titulo, q)}</div>
        <div class="gs-sugg-type">${escHTML(r.doc.codigo)} · ${escHTML(r.doc.unidad)} · ${escHTML(r.doc.tipo)}</div>
      </div>
      <div class="gs-sugg-cta">↵ abrir</div>
    </div>
  `).join('');
  host.querySelectorAll('.gs-sugg-row').forEach(row=>{
    row.addEventListener('click', ()=>{
      const id = row.dataset.doc;
      closeSuggestions();
      navigateTo('#/detail/'+id);
    });
    row.addEventListener('mouseenter', ()=>{
      gsActiveIdx = parseInt(row.dataset.idx,10);
      updateGsActive();
    });
  });
}

/* =========================================================
   15. EVENTOS GLOBALES + INIT
   ========================================================= */
function toggleRail(force){
  const rail = $('#siteRail');
  const layout = $('.layout');
  if(!rail || !layout) return;
  const open = force !== undefined ? force : !rail.classList.contains('open');
  rail.classList.toggle('open', open);
  layout.classList.toggle('rail-open', open);
  state.ui.railOpen = open; saveState();
}
function toggleNav(force){
  const nav = $('#siteNav');
  const btn = $('#menuToggle');
  if(!nav || !btn) return;
  const open = force !== undefined ? force : !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', open?'true':'false');
  state.ui.navOpen = open; saveState();
}
function hookGlobalUI(){
  // ========== BÚSQUEDA AVANZADA en navbar ==========
  const openAdvancedSearch = () => {
    // Reutiliza el comportamiento actual: navega a la página #/search
    navigateTo('#/search');
  };
  const bindAdvSearchBtn = (id) => {
    const btn = document.getElementById(id);
    if(!btn || btn.__boundAdv) return;
    btn.__boundAdv = true;
    btn.addEventListener('click', () => {
      // Si es la versión móvil, cerrar menú desplegable primero
      const w = window.innerWidth;
      if(w <= 820){
        toggleNav(false);
        toggleRail(true);
      }
      openAdvancedSearch();
    });
  };
  bindAdvSearchBtn('navAdvSearchDesktop');
  bindAdvSearchBtn('navAdvSearch');

  // Menú hamburguesa
  $('#menuToggle')?.addEventListener('click', ()=>{
    const w = window.innerWidth;
    if(w<=820){
      toggleNav();
      toggleRail(true);
    } else {
      toggleNav();
    }
  });
  // Backdrop rail
  $('.layout')?.addEventListener('click', (e)=>{
    const layout = $('.layout');
    const rail = $('#siteRail');
    if(!layout?.classList.contains('rail-open')) return;
    if(rail && rail.contains(e.target)) return;
    if(e.target.closest('.menu-toggle')) return;
    toggleRail(false); toggleNav(false);
  });

  // Cerrar modales/drawers
  document.addEventListener('click', e=>{
    if(e.target.closest('[data-close-modal]')) closeCompare();
    if(e.target.closest('[data-close-drawer]')) closeDrawer();
  });
  $('#drawerClear')?.addEventListener('click', ()=>{
    state.search.filters = {}; state.search.page = 1;
    saveState(); closeDrawer(); renderCurrentView();
    toast('Se limpiaron los filtros.',{kind:'info',title:'Filtros'});
  });

  // Botón Aceptar relación en modal comparación
  $('#compareAccept')?.addEventListener('click', ()=>{
    if(_currentCompareCandId){
      const cid = _currentCompareCandId;
      const prev = state.review.decisions[cid] || {};
      state.review.decisions[cid] = Object.assign({}, prev, {decision:'aceptar'});
      saveState();
      toast('Relación aceptada desde la comparación.',{kind:'ok'});
      closeCompare();
      if(state.currentRoute.name==='review') renderCurrentView();
    } else {
      closeCompare();
    }
  });

  // Teclado global: Escape cierra modal/drawer/sugerencias; "/" enfoca GS
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape'){
      const cm = $('#compareModal');
      if(cm && !cm.hidden){ closeCompare(); return; }
      const fd = $('#filterDrawer');
      if(fd && !fd.hidden){ closeDrawer(); return; }
      closeSuggestions();
      const w = window.innerWidth;
      if(w<=820){ toggleRail(false); toggleNav(false); }
    }
    if(e.key==='/'){
      const tag = (document.activeElement?.tagName||'').toUpperCase();
      if(['INPUT','TEXTAREA','SELECT'].includes(tag)) return;
      e.preventDefault();
      const input = $('#homeSearch');
      if(input){ input.focus(); input.select(); if(input.value) renderSuggestions(input.value); }
      else {
        // Si no estamos en Home, navegar y enfocar tras el render
        state._pendingFocusSearch = true;
        saveState();
        navigateTo('#/home');
      }
    }
  });
}

function init(){
  if(state.ui.railOpen) toggleRail(true);
  if(state.ui.navOpen) toggleNav(true); else toggleNav(false);
  hookGlobalUI();
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

document.addEventListener('DOMContentLoaded', init);
