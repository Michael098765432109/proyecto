// BASE DE DATOS COMPLETA DE ENTRENAMIENTO Y HORARIOS - NUTRY HEALTH
const nutryHealthFitnessDB = {

  // ==========================================
  // METADATOS DE FRECUENCIA Y HORARIOS
  // ==========================================
  frecuenciasInfo: {
    sedentario: { id: "sedentario", etiqueta: "Casi no me muevo (paso sentado todo el día)", diasSemana: 2, sesionMin: 30, descansoEntreDias: "48 a 72 horas" },
    poco: { id: "poco", etiqueta: "Me ejercito poquito (1 a 3 días por semana)", diasSemana: 3, sesionMin: 45, descansoEntreDias: "48 horas" },
    normal: { id: "normal", etiqueta: "Me ejercito normal (3 a 5 días por semana)", diasSemana: 4, sesionMin: 60, descansoEntreDias: "24 a 48 horas" },
    harto: { id: "harto", etiqueta: "Me ejercito harto (6 a 7 días por semana)", diasSemana: 6, sesionMin: 75, descansoEntreDias: "24 horas (rotando grupos)" },
    super_activo: { id: "super_activo", etiqueta: "Súper activo (trabajo pesado + gimnasio)", diasSemana: 5, sesionMin: 45, descansoEntreDias: "24 horas (baja carga articular)" }
  },

  // ==========================================
  // PROGRAMACIÓN DE LOS 8 OBJETIVOS DE LA APP
  // ==========================================
  objetivos: {

    // 1. SUBIR MÚSCULO DESPACITO Y SEGURO (+200 KCAL)
    subir_200: {
      nombre: "Subir músculo despacito y seguro (+200 kcal)",
      meta: "Superávit leve para construir masa muscular limpia minimizando grasa.",
      intensidadRPE: "7-8/10",
      rutinasPorFrecuencia: {
        sedentario: [
          { dia: "Día 1", enfoque: "Full Body A", ejercicios: ["Sentadilla libre (3x8)", "Press Banca (3x8)", "Remo con barra (3x8)", "Plancha (3x30s)"] },
          { dia: "Día 2", enfoque: "Full Body B", ejercicios: ["Peso muerto rumano (3x8)", "Press Militar (3x8)", "Jalón al pecho (3x10)", "Curl de bíceps (3x12)"] }
        ],
        poco: [
          { dia: "Lunes", enfoque: "Full Body - Cuádriceps / Pecho", ejercicios: ["Sentadilla libre", "Press Banca inclinado", "Remo en polea", "Elevaciones laterales"] },
          { dia: "Miércoles", enfoque: "Full Body - Isquios / Espalda", ejercicios: ["Peso Muerto Rumano", "Press Militar", "Dominadas/Jalón", "Extensión tríceps"] },
          { dia: "Viernes", enfoque: "Full Body - Tono General", ejercicios: ["Prensa 45°", "Press Banca plano", "Remo Girona", "Curl Bíceps"] }
        ],
        normal: [
          { dia: "Lunes", enfoque: "Torso Pesado", ejercicios: ["Press Banca", "Remo con barra", "Press Militar", "Jalón al pecho"] },
          { dia: "Martes", enfoque: "Pierna Pesado", ejercicios: ["Sentadilla libre", "Peso Muerto Rumano", "Prensa 45°", "Gemelos"] },
          { dia: "Jueves", enfoque: "Torso Hipertrofia", ejercicios: ["Press inclinado mancuernas", "Remo en polea", "Aperturas", "Bíceps/Tríceps"] },
          { dia: "Viernes", enfoque: "Pierna Hipertrofia", ejercicios: ["Zancadas", "Extensiones cuádriceps", "Curl femoral", "Core"] }
        ],
        harto: [
          { dia: "Día 1", enfoque: "Push A", ejercicios: ["Press Banca", "Press Militar", "Fondos", "Tríceps polea"] },
          { dia: "Día 2", enfoque: "Pull A", ejercicios: ["Remo con barra", "Dominadas", "Remo Girona", "Curl Bíceps"] },
          { dia: "Día 3", enfoque: "Legs A", ejercicios: ["Sentadilla libre", "Prensa", "Curl Femoral", "Gemelos"] },
          { dia: "Día 4", enfoque: "Push B", ejercicios: ["Press Inclinado", "Elevaciones laterales", "Press Francés", "Cruces polea"] },
          { dia: "Día 5", enfoque: "Pull B", ejercicios: ["Jalón al pecho", "Remo mancuerna", "Facepulls", "Curl Martillo"] },
          { dia: "Día 6", enfoque: "Legs B", ejercicios: ["Peso Muerto Rumano", "Sentadilla Búlgara", "Extensiones", "Core"] }
        ],
        super_activo: [
          { dia: "Día 1", enfoque: "Torso Express", ejercicios: ["Superserie: Press Banca + Remo barra", "Press Militar"] },
          { dia: "Día 2", enfoque: "Pierna Excéntrica", ejercicios: ["Sentadilla con pausa", "Peso muerto rumano", "Zancadas"] },
          { dia: "Día 3", enfoque: "Brazos & Hombros", ejercicios: ["Triset: Elevaciones laterales + Bíceps + Tríceps"] },
          { dia: "Día 4", enfoque: "Espalda & Pecho", ejercicios: ["Superserie: Dominadas + Press Inclinado", "Remo polea"] },
          { dia: "Día 5", enfoque: "Pierna & Core", ejercicios: ["Prensa 45°", "Extensiones", "Plancha con peso"] }
        ]
      }
    },

    // 2. SUBIR MÚSCULO A BUEN RITMO (+300 KCAL)
    subir_300: {
      nombre: "Subir músculo a buen ritmo (+300 kcal)",
      meta: "Superávit moderado estructurado para ganancia de masa muscular constante.",
      intensidadRPE: "8/10",
      rutinasPorFrecuencia: {
        sedentario: [
          { dia: "Día 1", enfoque: "Full Body Tensión A", ejercicios: ["Sentadilla libre (4x8)", "Press Banca (4x8)", "Remo Girona (4x10)", "Elevaciones laterales (3x12)"] },
          { dia: "Día 2", enfoque: "Full Body Tensión B", ejercicios: ["Peso Muerto Rumano (4x8)", "Press Militar (4x8)", "Dominadas (4x8)", "Curl Bíceps (3x10)"] }
        ],
        poco: [
          { dia: "Día 1", enfoque: "Full Body Fuerza", ejercicios: ["Sentadilla", "Press Banca", "Remo con barra", "Curl Bíceps"] },
          { dia: "Día 2", enfoque: "Full Body Hipertrofia", ejercicios: ["Peso Muerto Rumano", "Press Inclinado", "Jalón al pecho", "Extensión Tríceps"] },
          { dia: "Día 3", enfoque: "Full Body Volumen", ejercicios: ["Prensa 45°", "Press Militar", "Remo mancuerna", "Plancha"] }
        ],
        normal: [
          { dia: "Día 1", enfoque: "Empuje (Push)", ejercicios: ["Press Banca", "Press Inclinado mancuernas", "Press Militar", "Tríceps polea"] },
          { dia: "Día 2", enfoque: "Tracción (Pull)", ejercicios: ["Remo con barra", "Jalón al pecho", "Remo Girona", "Curl Bíceps"] },
          { dia: "Día 3", enfoque: "Pierna (Legs)", ejercicios: ["Sentadilla libre", "Prensa 45°", "Peso Muerto Rumano", "Gemelos"] },
          { dia: "Día 4", enfoque: "Torso / Especialización", ejercicios: ["Press Militar", "Dominadas", "Elevaciones laterales", "Core"] }
        ],
        harto: [
          { dia: "Día 1", enfoque: "Push Pesado", ejercicios: ["Press Banca (4x6)", "Press Militar (4x6)", "Fondos (3x8)", "Tríceps (3x10)"] },
          { dia: "Día 2", enfoque: "Pull Pesado", ejercicios: ["Remo Barra (4x6)", "Dominadas lastradas (4x6)", "Remo Girona (3x8)", "Curl Bíceps (3x10)"] },
          { dia: "Día 3", enfoque: "Legs Pesado", ejercicios: ["Sentadilla (4x6)", "Peso Muerto Rumano (4x6)", "Prensa (3x8)", "Gemelos (4x12)"] },
          { dia: "Día 4", enfoque: "Push Hipertrofia", ejercicios: ["Press Inclinado (3x10)", "Elevaciones laterales (4x12)", "Cruces polea (3x12)"] },
          { dia: "Día 5", enfoque: "Pull Hipertrofia", ejercicios: ["Jalón Pecho (3x10)", "Remo mancuerna (3x10)", "Facepulls (4x15)", "Curl Martillo (3x12)"] },
          { dia: "Día 6", enfoque: "Legs Hipertrofia", ejercicios: ["Sentadilla Búlgara (3x10)", "Extensiones (3x12)", "Curl Femoral (3x12)"] }
        ],
        super_activo: [
          { dia: "Día 1", enfoque: "Push Corto e Intenso", ejercicios: ["Press Banca 4x8", "Press Militar 3x8", "Fondos 3x10"] },
          { dia: "Día 2", enfoque: "Pull Corto e Intenso", ejercicios: ["Remo Barra 4x8", "Dominadas 3x8", "Curl Bíceps 3x10"] },
          { dia: "Día 3", enfoque: "Legs Corto e Intenso", ejercicios: ["Sentadilla 4x8", "Peso Muerto Rumano 3x8", "Gemelos 3x12"] },
          { dia: "Día 4", enfoque: "Torso Densidad", ejercicios: ["Superserie: Press Inclinado + Jalón al Pecho", "Elevaciones laterales"] },
          { dia: "Día 5", enfoque: "Pierna Densidad", ejercicios: ["Superserie: Prensa 45° + Curl Femoral", "Core"] }
        ]
      }
    },

    // 3. SUBIR MÚSCULO RÁPIDO (+500 KCAL)
    subir_500: {
      nombre: "Subir músculo rápido (+500 kcal)",
      meta: "Superávit alto para maximizar volumen muscular en atletas con alto consumo sintético.",
      intensidadRPE: "8-9/10",
      rutinasPorFrecuencia: {
        sedentario: [
          { dia: "Día 1", enfoque: "Full Body Carga Alta A", ejercicios: ["Sentadilla (4x6)", "Press Banca (4x6)", "Remo pesado (4x6)", "Core (3x15)"] },
          { dia: "Día 2", enfoque: "Full Body Carga Alta B", ejercicios: ["Peso Muerto (4x6)", "Press Militar (4x6)", "Dominadas (4x6)", "Bíceps/Tríceps (3x10)"] }
        ],
        poco: [
          { dia: "Día 1", enfoque: "Torso Pesado", ejercicios: ["Press Banca", "Remo Barra", "Press Militar", "Bíceps"] },
          { dia: "Día 2", enfoque: "Pierna Pesado", ejercicios: ["Sentadilla libre", "Peso Muerto Rumano", "Prensa 45°", "Core"] },
          { dia: "Día 3", enfoque: "Full Body Fuerza", ejercicios: ["Press Inclinado", "Dominadas lastradas", "Zancadas", "Tríceps"] }
        ],
        normal: [
          { dia: "Día 1", enfoque: "Pecho & Tríceps", ejercicios: ["Press Banca plano", "Press Inclinado", "Fondos pesado", "Extensión tríceps"] },
          { dia: "Día 2", enfoque: "Espalda & Bíceps", ejercicios: ["Remo con barra", "Dominadas con peso", "Remo Girona", "Curl Martillo"] },
          { dia: "Día 3", enfoque: "Pierna Completa", ejercicios: ["Sentadilla profunda", "Prensa 45°", "Peso Muerto Rumano", "Gemelos"] },
          { dia: "Día 4", enfoque: "Hombro & Core", ejercicios: ["Press Militar pesado", "Elevaciones laterales", "Facepulls", "Plancha con peso"] }
        ],
        harto: [
          { dia: "Día 1", enfoque: "Pecho Pesado", ejercicios: ["Press Banca 4x6", "Press Inclinado mancuernas 3x8", "Cruces polea 3x10"] },
          { dia: "Día 2", enfoque: "Espalda Pesada", ejercicios: ["Remo Barra 4x6", "Dominadas 4x6", "Jalón Pecho 3x8"] },
          { dia: "Día 3", enfoque: "Pierna Cuádriceps", ejercicios: ["Sentadilla libre 4x6", "Prensa 45° 3x8", "Extensiones 3x10"] },
          { dia: "Día 4", enfoque: "Hombros & Trapecio", ejercicios: ["Press Militar 4x6", "Elevaciones laterales 4x10", "Encogimientos 3x10"] },
          { dia: "Día 5", enfoque: "Brazos Completos", ejercicios: ["Superserie: Curl Bíceps + Extensión Tríceps", "Curl Martillo"] },
          { dia: "Día 6", enfoque: "Pierna Isquios/Glúteo", ejercicios: ["Peso Muerto Rumano 4x6", "Sentadilla Búlgara 3x8", "Gemelos 4x12"] }
        ],
        super_activo: [
          { dia: "Día 1", enfoque: "Empuje Pesado", ejercicios: ["Press Banca 4x5", "Press Militar 4x5", "Fondos 3x8"] },
          { dia: "Día 2", enfoque: "Tracción Pesada", ejercicios: ["Remo Barra 4x5", "Dominadas 4x5", "Curl Bíceps 3x8"] },
          { dia: "Día 3", enfoque: "Pierna Pesada", ejercicios: ["Sentadilla 4x5", "Peso Muerto Rumano 4x5", "Prensa 3x8"] },
          { dia: "Día 4", enfoque: "Torso Hipertrofia Express", ejercicios: ["Press Inclinado 3x8", "Jalón Pecho 3x8", "Elevaciones laterales 3x10"] },
          { dia: "Día 5", enfoque: "Brazos & Core Express", ejercicios: ["Curl Martillo 3x8", "Tríceps Polea 3x8", "Planchas 3x45s"] }
        ]
      }
    },

    // 4. QUEDARME COMO ESTOY (SIN CAMBIOS)
    mantenimiento: {
      nombre: "Quedarme como estoy (sin cambios)",
      meta: "Mantenimiento de masa muscular, masa grasa y salud cardiovascular en nivel normocalórico.",
      intensidadRPE: "7/10",
      rutinasPorFrecuencia: {
        sedentario: [
          { dia: "Día 1", enfoque: "Full Body Mantenimiento A", ejercicios: ["Sentadilla (3x10)", "Press Banca (3x10)", "Remo (3x10)", "Plancha (3x30s)"] },
          { dia: "Día 2", enfoque: "Full Body Mantenimiento B", ejercicios: ["Peso Muerto Rumano (3x10)", "Press Militar (3x10)", "Jalón Pecho (3x10)", "Caminata 15 min"] }
        ],
        poco: [
          { dia: "Día 1", enfoque: "Full Body Salud A", ejercicios: ["Sentadilla", "Press Banca", "Remo Polea", "15 min Cardio"] },
          { dia: "Día 2", enfoque: "Full Body Salud B", ejercicios: ["Peso Muerto Rumano", "Press Militar", "Dominadas", "15 min Cardio"] },
          { dia: "Día 3", enfoque: "Full Body Salud C", ejercicios: ["Prensa 45°", "Press Inclinado", "Remo Girona", "Core"] }
        ],
        normal: [
          { dia: "Día 1", enfoque: "Torso Tono", ejercicios: ["Press Banca (3x10)", "Remo Barra (3x10)", "Elevaciones laterales (3x12)"] },
          { dia: "Día 2", enfoque: "Pierna Tono", ejercicios: ["Sentadilla (3x10)", "Peso Muerto Rumano (3x10)", "Gemelos (3x15)"] },
          { dia: "Día 3", enfoque: "Torso & Cardio", ejercicios: ["Press Militar (3x10)", "Jalón Pecho (3x10)", "20 min Bici"] },
          { dia: "Día 4", enfoque: "Pierna & Core", ejercicios: ["Prensa (3x10)", "Extensiones (3x12)", "Plancha (3x45s)"] }
        ],
        harto: [
          { dia: "Día 1", enfoque: "Push Suave", ejercicios: ["Press Banca 3x10", "Press Militar 3x10", "Tríceps 3x12"] },
          { dia: "Día 2", enfoque: "Pull Suave", ejercicios: ["Remo Barra 3x10", "Jalón Pecho 3x10", "Bíceps 3x12"] },
          { dia: "Día 3", enfoque: "Legs Suave", ejercicios: ["Sentadilla 3x10", "Peso Muerto Rumano 3x10", "Gemelos 3x15"] },
          { dia: "Día 4", enfoque: "Cardio & Core", ejercicios: ["30 min Cardio LISS", "Circuito Abdomen"] },
          { dia: "Día 5", enfoque: "Torso Ligero", ejercicios: ["Press Inclinado 3x10", "Remo Girona 3x10", "Elevaciones laterales 3x12"] },
          { dia: "Día 6", enfoque: "Pierna Ligero", ejercicios: ["Zancadas 3x12", "Curl Femoral 3x12", "Movilidad"] }
        ],
        super_activo: [
          { dia: "Día 1", enfoque: "Full Body Express 1", ejercicios: ["Sentadilla 3x10", "Press Banca 3x10", "Remo 3x10"] },
          { dia: "Día 2", enfoque: "Full Body Express 2", ejercicios: ["Peso Muerto Rumano 3x10", "Press Militar 3x10", "Dominadas 3x10"] },
          { dia: "Día 3", enfoque: "Descanso Activo", ejercicios: ["Caminata 30 min"] },
          { dia: "Día 4", enfoque: "Full Body Express 3", ejercicios: ["Prensa 3x10", "Press Inclinado 3x10", "Remo Girona 3x10"] },
          { dia: "Día 5", enfoque: "Cardio & Movilidad", ejercicios: ["20 min Cardio moderado", "Estiramientos guiados"] }
        ]
      }
    },

    // 5. BAJAR DE PESO SUAVECITO (-300 KCAL)
    bajar_300: {
      nombre: "Bajar de peso suavecito (-300 kcal)",
      meta: "Déficit leve para reducir porcentaje de grasa manteniendo energía alta.",
      intensidadRPE: "6-7/10",
      rutinasPorFrecuencia: {
        sedentario: [
          { dia: "Día 1", enfoque: "Full Body + Cardio A", ejercicios: ["Sentadilla (3x10)", "Press Banca (3x10)", "Remo (3x10)", "15 min Caminata paso ligero"] },
          { dia: "Día 2", enfoque: "Full Body + Cardio B", ejercicios: ["Peso Muerto Rumano (3x10)", "Press Militar (3x10)", "Jalón Pecho (3x10)", "15 min Caminata paso ligero"] }
        ],
        poco: [
          { dia: "Día 1", enfoque: "Fuerza + LISS", ejercicios: ["Sentadilla", "Press Banca", "Remo con barra", "20 min Bici constante"] },
          { dia: "Día 2", enfoque: "Fuerza + LISS", ejercicios: ["Peso Muerto Rumano", "Press Militar", "Dominadas", "20 min Cinta inclinada"] },
          { dia: "Día 3", enfoque: "Circuito Suave", ejercicios: ["Prensa 45°", "Flexiones", "Remo Girona", "Core"] }
        ],
        normal: [
          { dia: "Día 1", enfoque: "Torso + LISS", ejercicios: ["Press Banca", "Remo Barra", "Press Militar", "15 min Cinta inclinada"] },
          { dia: "Día 2", enfoque: "Pierna + LISS", ejercicios: ["Sentadilla", "Peso Muerto Rumano", "Prensa", "15 min Bici"] },
          { dia: "Día 3", enfoque: "Torso Hipertrofia", ejercicios: ["Press Inclinado", "Jalón Pecho", "Elevaciones laterales", "Core"] },
          { dia: "Día 4", enfoque: "Pierna & Cardio", ejercicios: ["Zancadas", "Extensiones", "Curl Femoral", "20 min Caminata rápida"] }
        ],
        harto: [
          { dia: "Día 1", enfoque: "Push + Cardio", ejercicios: ["Press Banca 3x10", "Press Militar 3x10", "15 min Cardio LISS"] },
          { dia: "Día 2", enfoque: "Pull + Core", ejercicios: ["Remo Barra 3x10", "Jalón Pecho 3x10", "Planchas 3x45s"] },
          { dia: "Día 3", enfoque: "Legs", ejercicios: ["Sentadilla 3x10", "Peso Muerto Rumano 3x10", "Gemelos 3x12"] },
          { dia: "Día 4", enfoque: "Push Volumétrico", ejercicios: ["Press Inclinado 3x10", "Cruces polea 3x12", "Tríceps 3x12"] },
          { dia: "Día 5", enfoque: "Pull Volumétrico", ejercicios: ["Dominadas 3x8", "Remo Girona 3x10", "Bíceps 3x12"] },
          { dia: "Día 6", enfoque: "Legs & LISS", ejercicios: ["Prensa 3x10", "Curl Femoral 3x12", "20 min Bici"] }
        ],
        super_activo: [
          { dia: "Día 1", enfoque: "Fuerza Express 1", ejercicios: ["Sentadilla 3x8", "Press Banca 3x8", "Remo 3x8"] },
          { dia: "Día 2", enfoque: "Fuerza Express 2", ejercicios: ["Peso Muerto Rumano 3x8", "Press Militar 3x8", "Jalón 3x8"] },
          { dia: "Día 3", enfoque: "Descanso Activo", ejercicios: ["Caminata al aire libre 45 min"] },
          { dia: "Día 4", enfoque: "Fuerza Express 3", ejercicios: ["Prensa 3x10", "Press Inclinado 3x10", "Remo Girona 3x10"] },
          { dia: "Día 5", enfoque: "Cardio LISS", ejercicios: ["30 min Bici o Cinta inclinada"] }
        ]
      }
    },

    // 6. BAJAR DE PESO A BUEN RITMO (-500 KCAL)
    bajar_500: {
      nombre: "Bajar de peso a buen ritmo (-500 kcal)",
      meta: "Déficit calórico moderado manteniendo masa muscular y elevando gasto diario.",
      intensidadRPE: "8/10",
      rutinasPorFrecuencia: {
        sedentario: [
          { dia: "Día 1", enfoque: "Full Body Metabólico A", ejercicios: ["Sentadilla (3x10)", "Flexiones (3x10)", "Remo polea (3x10)", "15 min Bici"] },
          { dia: "Día 2", enfoque: "Full Body Metabólico B", ejercicios: ["Zancadas (3x10)", "Press Militar (3x10)", "Jalón al pecho (3x10)", "15 min Bici"] }
        ],
        poco: [
          { dia: "Día 1", enfoque: "Fuerza + Cardio", ejercicios: ["Sentadilla", "Press Banca", "Remo", "20 min Bici moderada"] },
          { dia: "Día 2", enfoque: "Fuerza + Cardio", ejercicios: ["Peso Muerto Rumano", "Press Militar", "Dominadas", "20 min Cinta inclinada"] },
          { dia: "Día 3", enfoque: "Circuito Metabólico", ejercicios: ["Sentadilla Búlgara", "Flexiones", "Plancha", "Jumping Jacks"] }
        ],
        normal: [
          { dia: "Día 1", enfoque: "Torso Fuerza", ejercicios: ["Press Banca", "Remo Pesado", "Press Militar", "15 min HIIT"] },
          { dia: "Día 2", enfoque: "Pierna Fuerza", ejercicios: ["Sentadilla", "Peso Muerto Rumano", "Prensa", "15 min Caminata rápida"] },
          { dia: "Día 3", enfoque: "Torso Hipertrofia", ejercicios: ["Press Inclinado", "Jalón al pecho", "Elevaciones laterales", "Core"] },
          { dia: "Día 4", enfoque: "Pierna & Cardio", ejercicios: ["Zancadas", "Extensiones", "Curl Femoral", "20 min LISS"] }
        ],
        harto: [
          { dia: "Día 1", enfoque: "Push + Cardio", ejercicios: ["Press Banca", "Press Inclinado", "Elevaciones laterales", "15 min Cardio"] },
          { dia: "Día 2", enfoque: "Pull + Core", ejercicios: ["Remo Barra", "Jalón", "Facepulls", "Circuito Abdomen"] },
          { dia: "Día 3", enfoque: "Legs Heavy", ejercicios: ["Sentadilla", "Prensa", "Gemelos", "15 min Caminata"] },
          { dia: "Día 4", enfoque: "Push Volumétrico", ejercicios: ["Press Mancuernas", "Fondos", "Tríceps", "15 min Cardio"] },
          { dia: "Día 5", enfoque: "Pull Volumétrico", ejercicios: ["Dominadas", "Remo Girona", "Bíceps", "Circuito Core"] },
          { dia: "Día 6", enfoque: "Legs Metabólico", ejercicios: ["Peso Muerto Rumano", "Zancadas", "Sprints cortos"] }
        ],
        super_activo: [
          { dia: "Día 1", enfoque: "Full Body Denso 1", ejercicios: ["Superserie: Sentadilla + Press Banca", "10 min HIIT"] },
          { dia: "Día 2", enfoque: "Full Body Denso 2", ejercicios: ["Superserie: Peso Muerto + Press Militar", "10 min HIIT"] },
          { dia: "Día 3", enfoque: "Descanso Activo", ejercicios: ["Caminata a paso ligero 45 min"] },
          { dia: "Día 4", enfoque: "Full Body Denso 3", ejercicios: ["Superserie: Prensa + Remo", "10 min HIIT"] },
          { dia: "Día 5", enfoque: "Circuito Quema Calórica", ejercicios: ["Kettlebell Swings", "Burpees", "Mountain Climbers", "Plancha"] }
        ]
      }
    },

    // 7. BAJAR DE PESO RÁPIDO (-700 KCAL)
    bajar_700: {
      nombre: "Bajar de peso rápido (-700 kcal)",
      meta: "Déficit agresivo con alta densidad de entrenamiento para maximizar la oxidación de grasa.",
      intensidadRPE: "8/10",
      rutinasPorFrecuencia: {
        sedentario: [
          { dia: "Día 1", enfoque: "Circuito Total A", ejercicios: ["Sentadilla (3x12)", "Flexiones (3x12)", "Remo (3x12)", "20 min Caminata inclinada"] },
          { dia: "Día 2", enfoque: "Circuito Total B", ejercicios: ["Zancadas (3x12)", "Press Militar (3x12)", "Jalón Pecho (3x12)", "20 min Bici"] }
        ],
        poco: [
          { dia: "Día 1", enfoque: "Metabólico Full Body A", ejercicios: ["Sentadilla", "Press Banca", "Remo", "15 min HIIT final"] },
          { dia: "Día 2", enfoque: "Metabólico Full Body B", ejercicios: ["Peso Muerto Rumano", "Press Militar", "Dominadas", "20 min LISS final"] },
          { dia: "Día 3", enfoque: "Circuito Quema Grasa", ejercicios: ["Sentadilla Búlgara", "Flexiones", "Mountain Climbers", "Planchas"] }
        ],
        normal: [
          { dia: "Día 1", enfoque: "Torso Denso + Cardio", ejercicios: ["Press Banca", "Remo Barra", "Press Militar", "20 min Cardio Bici"] },
          { dia: "Día 2", enfoque: "Pierna Denso + Cardio", ejercicios: ["Sentadilla", "Peso Muerto Rumano", "Prensa", "20 min Cinta inclinada"] },
          { dia: "Día 3", enfoque: "Full Body HIIT", ejercicios: ["Zancadas", "Flexiones", "Remo Girona", "Circuito HIIT 15 min"] },
          { dia: "Día 4", enfoque: "Cardio LISS & Core", ejercicios: ["35 min Cardio LISS constante", "Circuito Abdominales"] }
        ],
        harto: [
          { dia: "Día 1", enfoque: "Push + HIIT", ejercicios: ["Press Banca 3x10", "Press Militar 3x10", "15 min HIIT"] },
          { dia: "Día 2", enfoque: "Pull + LISS", ejercicios: ["Remo Barra 3x10", "Jalón Pecho 3x10", "20 min Cinta inclinada"] },
          { dia: "Día 3", enfoque: "Legs Denso", ejercicios: ["Sentadilla 3x10", "Prensa 3x10", "Gemelos 3x15"] },
          { dia: "Día 4", enfoque: "Push + LISS", ejercicios: ["Press Inclinado 3x10", "Fondos 3x10", "20 min Bici"] },
          { dia: "Día 5", enfoque: "Pull + HIIT", ejercicios: ["Dominadas 3x8", "Remo Girona 3x10", "15 min HIIT"] },
          { dia: "Día 6", enfoque: "Legs & Core", ejercicios: ["Peso Muerto Rumano 3x10", "Zancadas 3x12", "Planchas 4x45s"] }
        ],
        super_activo: [
          { dia: "Día 1", enfoque: "Full Body Denso A", ejercicios: ["Superserie: Sentadilla + Press Banca", "15 min HIIT final"] },
          { dia: "Día 2", enfoque: "Full Body Denso B", ejercicios: ["Superserie: Peso Muerto + Press Militar", "20 min LISS final"] },
          { dia: "Día 3", enfoque: "Descanso Activo Mandatory", ejercicios: ["Caminata 45 min"] },
          { dia: "Día 4", enfoque: "Full Body Denso C", ejercicios: ["Superserie: Prensa + Remo Girona", "15 min HIIT final"] },
          { dia: "Día 5", enfoque: "Cardio Quema Grasa", ejercicios: ["40 min Cardio a ritmo moderado constante"] }
        ]
      }
    },

    // 8. BAJAR GRASA Y SUBIR MÚSCULO A LA VEZ (-100 KCAL)
    recomposicion: {
      nombre: "Bajar grasa y subir músculo a la vez (-100 kcal)",
      meta: "Estimulación muscular cercana al fallo e ingesta normocalórica ajustada.",
      intensidadRPE: "8-9/10",
      rutinasPorFrecuencia: {
        sedentario: [
          { dia: "Día 1", enfoque: "Full Body Alta Intensidad A", ejercicios: ["Sentadilla (4x6)", "Press Banca (4x6)", "Remo (4x6)", "Plancha (3x45s)"] },
          { dia: "Día 2", enfoque: "Full Body Alta Intensidad B", ejercicios: ["Peso Muerto (4x6)", "Press Militar (4x6)", "Dominadas (4x6)", "Core (3x15)"] }
        ],
        poco: [
          { dia: "Día 1", enfoque: "Full Body Fuerza Pesada", ejercicios: ["Sentadilla", "Press Banca", "Remo con barra"] },
          { dia: "Día 2", enfoque: "Full Body Hipertrofia", ejercicios: ["Peso Muerto Rumano", "Press Militar", "Jalón al pecho"] },
          { dia: "Día 3", enfoque: "Full Body Tensión Mecánica", ejercicios: ["Prensa 45°", "Press Inclinado", "Dominadas"] }
        ],
        normal: [
          { dia: "Día 1", enfoque: "Torso Pesado", ejercicios: ["Press Banca (4x6)", "Remo Barra (4x6)", "Press Militar (3x8)"] },
          { dia: "Día 2", enfoque: "Pierna Pesado", ejercicios: ["Sentadilla (4x6)", "Peso Muerto Rumano (4x6)", "Prensa (3x8)"] },
          { dia: "Día 3", enfoque: "Torso Tensión", ejercicios: ["Press Inclinado (3x8)", "Dominadas lastradas (3x8)", "Brazos (3x10)"] },
          { dia: "Día 4", enfoque: "Pierna Tensión", ejercicios: ["Sentadilla Búlgara (3x10)", "Extensiones (3x12)", "Curl Femoral (3x12)"] }
        ],
        harto: [
          { dia: "Día 1", enfoque: "Push Al Fallo -2", ejercicios: ["Press Banca", "Press Inclinado", "Press Militar", "Tríceps"] },
          { dia: "Día 2", enfoque: "Pull Al Fallo -2", ejercicios: ["Remo con barra", "Dominadas", "Remo Girona", "Bíceps"] },
          { dia: "Día 3", enfoque: "Legs Al Fallo -2", ejercicios: ["Sentadilla", "Peso Muerto Rumano", "Prensa", "Gemelos"] },
          { dia: "Día 4", enfoque: "Push Hipertrofia", ejercicios: ["Press Mancuernas", "Elevaciones laterales", "Fondos"] },
          { dia: "Día 5", enfoque: "Pull Hipertrofia", ejercicios: ["Jalón al pecho", "Remo Mancuerna", "Facepulls"] },
          { dia: "Día 6", enfoque: "Legs Hipertrofia", ejercicios: ["Sentadilla Búlgara", "Extensiones", "Curl Femoral"] }
        ],
        super_activo: [
          { dia: "Día 1", enfoque: "Torso Fuerza Máxima", ejercicios: ["Press Banca 4x5", "Remo Barra 4x5"] },
          { dia: "Día 2", enfoque: "Pierna Fuerza Máxima", ejercicios: ["Sentadilla 4x5", "Peso Muerto Rumano 4x5"] },
          { dia: "Día 3", enfoque: "Hipertrofia Empuje", ejercicios: ["Press Inclinado 3x8", "Press Militar 3x8"] },
          { dia: "Día 4", enfoque: "Hipertrofia Tracción", ejercicios: ["Dominadas 3x8", "Remo Polea 3x8"] },
          { dia: "Día 5", enfoque: "Hipertrofia Pierna", ejercicios: ["Prensa 3x10", "Zancadas 3x10"] }
        ]
      }
    }
  }
};