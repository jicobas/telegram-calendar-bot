function detectIntent(text) {
  const lower = text.toLowerCase();

  if (lower === 'help' || lower === '/help' || lower === 'ayuda') {
    return 'help';
  }

  if (
    lower.startsWith('borrá') ||
    lower.startsWith('borra') ||
    lower.startsWith('eliminá') ||
    lower.startsWith('elimina') ||
    lower.startsWith('cancelá') ||
    lower.startsWith('cancela')
  ) {
    return 'delete_event';
  }

  if (lower.startsWith('agendá') || lower.startsWith('agenda')) {
    return 'create_event';
  }

  if (lower.includes('qué tengo') || lower.includes('que tengo')) {
    return 'list_events';
  }

  return 'unknown';
}

function parseDateFromText(text) {
  const lower = text.toLowerCase();
  const today = new Date();

  // HOY
  if (lower.includes('hoy')) {
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  // PASADO MAÑANA
  if (lower.includes('pasado mañana')) {
    const d = new Date(today);
    d.setDate(today.getDate() + 2);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  // MAÑANA
  if (lower.includes('mañana')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    );
  }

  // DÍAS DE LA SEMANA
  const weekdays = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miércoles: 3,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sábado: 6,
    sabado: 6,
  };

  for (const day in weekdays) {
    if (lower.includes(`este ${day}`) || lower.includes(`el ${day}`)) {
      return getNextWeekday(weekdays[day]);
    }
  }

  // FECHA EXPLÍCITA (21/1)
  const regex = /(\d{1,2})[\/\-](\d{1,2})/;
  const match = text.match(regex);

  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = today.getFullYear();

  return new Date(year, month, day);
}

function parseTimeRangeFromText(text) {
  const lower = text.toLowerCase();

  // RANGO EXPLÍCITO (10 a 11)
  const regex = /(\d{1,2})\s*(?:a|\-)\s*(\d{1,2})/;
  const match = text.match(regex);

  if (match) {
    return {
      startHour: parseInt(match[1], 10),
      endHour: parseInt(match[2], 10),
    };
  }

  // HORARIOS RELATIVOS
  if (lower.includes('a la mañana')) {
    return { startHour: 9, endHour: 10 };
  }

  if (lower.includes('a la tarde')) {
    return { startHour: 15, endHour: 16 };
  }

  if (lower.includes('a la noche')) {
    return { startHour: 20, endHour: 21 };
  }

  return null;
}

function extractTitle(text) {
  let title = text.toLowerCase();

  // quitar comando
  title = title.replace(/^agendá/i, '');
  title = title.replace(/^agenda/i, '');

  // quitar fechas relativas
  title = title.replace(/\bhoy\b/i, '');
  title = title.replace(/\bmañana\b/i, '');
  title = title.replace(/\bpasado mañana\b/i, '');

  // quitar días de la semana
  title = title.replace(
    /\beste\s+(domingo|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado)\b/i,
    ''
  );
  title = title.replace(
    /\bel\s+(domingo|lunes|martes|miércoles|miercoles|jueves|viernes|sábado|sabado)\b/i,
    ''
  );

  // quitar horarios relativos
  title = title.replace(/\ba la mañana\b/i, '');
  title = title.replace(/\ba la tarde\b/i, '');
  title = title.replace(/\ba la noche\b/i, '');

  // quitar fecha explícita
  title = title.replace(/el\s+\d{1,2}[\/\-]\d{1,2}/i, '');
  title = title.replace(/\d{1,2}[\/\-]\d{1,2}/i, '');

  // quitar horario explícito
  title = title.replace(/de\s*\d{1,2}\s*(?:a|\-)\s*\d{1,2}/i, '');
  title = title.replace(/\d{1,2}\s*(?:a|\-)\s*\d{1,2}/i, '');

  // limpieza de conectores
  title = title.replace(/\b(a la|a el|a)\b/gi, '');
  title = title.replace(/\s{2,}/g, ' ');

  return title.trim();
}

module.exports = {
  detectIntent,
  parseDateFromText,
  parseTimeRangeFromText,
  extractTitle,
};
