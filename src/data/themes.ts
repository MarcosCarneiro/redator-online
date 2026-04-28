export interface Theme {
  id: string;
  title: string;
  category: string;
  description?: string;
}

export const SUGGESTED_THEMES: Theme[] = [
  {
    id: '1',
    title: 'O impacto da inteligência artificial na educação do século XXI',
    category: 'Tecnologia',
    description: 'Discuta como as novas tecnologias e IAs generativas estão transformando o papel do professor e o aprendizado dos alunos.'
  },
  {
    id: '2',
    title: 'Caminhos para combater a insegurança alimentar no Brasil',
    category: 'Social',
    description: 'Analise as causas da volta do Brasil ao mapa da fome e proponha soluções para garantir o direito constitucional à alimentação.'
  },
  {
    id: '3',
    title: 'A importância da preservação da Amazônia para o equilíbrio climático global',
    category: 'Meio Ambiente',
    description: 'Aborde a relação entre o desmatamento, as mudanças climáticas e o impacto na economia brasileira.'
  },
  {
    id: '4',
    title: 'Desafios para a inclusão de pessoas com transtorno do espectro autista (TEA)',
    category: 'Saúde/Inclusão',
    description: 'Avalie as barreiras sociais, educacionais e médicas enfrentadas por autistas no Brasil contemporâneo.'
  },
  {
    id: '5',
    title: 'O estigma associado às doenças mentais na sociedade brasileira',
    category: 'Saúde',
    description: 'Relembre o tema do ENEM 2020 e discuta como o preconceito impede o tratamento adequado de transtornos mentais.'
  },
  {
    id: '6',
    title: 'A persistência da violência contra a mulher na sociedade brasileira',
    category: 'Social',
    description: 'Analise por que, mesmo com leis como a Maria da Penha, os índices de feminicídio e violência doméstica continuam altos.'
  },
  {
    id: '7',
    title: 'O papel do esporte como ferramenta de inclusão social e cidadania',
    category: 'Cultura',
    description: 'Discuta como o incentivo ao esporte pode afastar jovens da criminalidade e promover o desenvolvimento humano.'
  },
  {
    id: '8',
    title: 'Estratégias para enfrentar a desinformação e as fake news na era digital',
    category: 'Tecnologia/Cidadania',
    description: 'Avalie o impacto das notícias falsas na democracia e a importância do letramento midiático.'
  }
];
