import { Camera, Zap, Target } from 'lucide-react';

export const BentoGrid = () => (
  <section className="bento-grid">
    <div className="bento-item">
      <div className="bento-icon"><Camera color="var(--primary)" /></div>
      <h3 style={{ marginBottom: '0.5rem' }}>Envio por Foto</h3>
      <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
        Não perca tempo digitando. Tire uma foto da sua folha e a IA transcreve tudo.
      </p>
    </div>
    <div className="bento-item">
      <div className="bento-icon"><Zap color="var(--primary)" /></div>
      <h3 style={{ marginBottom: '0.5rem' }}>Resultado Instantâneo</h3>
      <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
        Sua correção detalhada fica pronta em menos de 10 segundos.
      </p>
    </div>
    <div className="bento-item">
      <div className="bento-icon"><Target color="var(--primary)" /></div>
      <h3 style={{ marginBottom: '0.5rem' }}>Critérios Oficiais</h3>
      <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
        Avaliação baseada nas 5 competências exigidas pela banca do ENEM.
      </p>
    </div>
  </section>
);
