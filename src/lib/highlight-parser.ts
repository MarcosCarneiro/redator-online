export interface Highlight {
  text: string;
  type: 'grammar' | 'repertoire' | 'structure' | 'cohesion' | 'proposal';
  description: string;
  suggestion?: string;
}

export interface TextSegment {
  text: string;
  highlight?: Highlight;
}

/**
 * Divide o texto original da redação em segmentos alternados de texto plano
 * e trechos destacados interativos, removendo colisões (overlapping highlights)
 * de forma gulosa e estável para renderização HTML segura.
 */
export function segmentEssayText(essay: string, highlights: Highlight[]): TextSegment[] {
  if (!essay) {
    return [];
  }
  
  if (!highlights || highlights.length === 0) {
    return [{ text: essay }];
  }

  interface MatchedSegment {
    start: number;
    end: number;
    highlight: Highlight;
  }
  
  let matches: MatchedSegment[] = [];

  // 1. Encontrar todas as ocorrências de cada highlight na redação original
  highlights.forEach(hl => {
    if (!hl.text || hl.text.trim() === '') return;
    
    let index = essay.indexOf(hl.text);
    while (index !== -1) {
      matches.push({
        start: index,
        end: index + hl.text.length,
        highlight: hl
      });
      // Avança de caractere para prevenir loops e registrar múltiplas ocorrências
      index = essay.indexOf(hl.text, index + 1);
    }
  });

  // 2. Ordenar os matches pelo índice inicial (e depois por comprimento decrescente para preferir blocos maiores)
  matches.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return (b.end - b.start) - (a.end - a.start);
  });

  // 3. Resolver colisões/sobreposições de forma gulosa
  let activeSegments: MatchedSegment[] = [];
  let currentEnd = 0;

  for (let match of matches) {
    // Se o segmento atual começa após ou exatamente onde o último ativo terminou, não há sobreposição
    if (match.start >= currentEnd) {
      activeSegments.push(match);
      currentEnd = match.end;
    }
  }

  // 4. Reconstruir o array final de blocos de texto (planos e destacados)
  let segments: TextSegment[] = [];
  let cursor = 0;

  for (let seg of activeSegments) {
    // Se há texto plano antes do segmento destacado
    if (seg.start > cursor) {
      segments.push({ text: essay.substring(cursor, seg.start) });
    }
    
    // Segmento destacado ativo
    segments.push({
      text: essay.substring(seg.start, seg.end),
      highlight: seg.highlight
    });
    
    cursor = seg.end;
  }

  // Se restou texto plano no final da redação
  if (cursor < essay.length) {
    segments.push({ text: essay.substring(cursor) });
  }

  return segments;
}
