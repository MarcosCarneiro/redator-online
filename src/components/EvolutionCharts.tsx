'use client';

import { useState } from 'react';
import { Calendar, Trophy, ChevronRight, Check } from 'lucide-react';

interface EssayData {
  id: string;
  theme: string;
  totalScore: number | null;
  c1Score: number | null;
  c2Score: number | null;
  c3Score: number | null;
  c4Score: number | null;
  c5Score: number | null;
  createdAt: Date | string | null;
}

interface EvolutionChartsProps {
  essays: EssayData[];
}

export function EvolutionCharts({ essays }: EvolutionChartsProps) {
  const [activeTab, setActiveTab] = useState<'overall' | 'competencies'>('overall');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // States for toggling individual competencies in the competencies tab
  const [visibleComps, setVisibleComps] = useState({
    c1: true,
    c2: true,
    c3: true,
    c4: true,
    c5: true,
  });

  if (!essays || essays.length === 0) return null;

  // Chart config
  const svgWidth = 600;
  const svgHeight = 280;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const N = essays.length;

  // Compute X coordinates
  const getX = (index: number) => {
    if (N <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + index * (chartWidth / (N - 1));
  };

  // Helper for date formatting
  const formatDate = (dateVal: Date | string | null) => {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Helper to safely parse competency score
  const getScore = (essay: EssayData, key: 'c1Score' | 'c2Score' | 'c3Score' | 'c4Score' | 'c5Score') => {
    return essay[key] ?? 0;
  };

  // Competency configurations
  const competencyMeta = [
    { id: 'c1' as const, key: 'c1Score' as const, label: 'C1: Norma Culta', color: '#ec4899' },
    { id: 'c2' as const, key: 'c2Score' as const, label: 'C2: Repertório', color: '#3b82f6' },
    { id: 'c3' as const, key: 'c3Score' as const, label: 'C3: Projeto de Texto', color: '#10b981' },
    { id: 'c4' as const, key: 'c4Score' as const, label: 'C4: Coesão', color: '#f59e0b' },
    { id: 'c5' as const, key: 'c5Score' as const, label: 'C5: Proposta', color: '#8b5cf6' },
  ];

  // Render Overall Grade Chart
  const renderOverallChart = () => {
    const maxY = 1000;
    const getY = (score: number) => {
      return paddingTop + chartHeight * (1 - score / maxY);
    };

    // Build the points and paths
    const points = essays.map((essay, idx) => ({
      x: getX(idx),
      y: getY(essay.totalScore ?? 0),
      score: essay.totalScore ?? 0,
      essay,
    }));

    let pathD = '';
    let areaD = '';

    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
    }

    const yTicks = [0, 200, 400, 600, 800, 1000];

    return (
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="overallAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-light)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary-light)" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={getY(tick)}
                x2={svgWidth - paddingRight}
                y2={getY(tick)}
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray={tick !== 0 && tick !== 1000 ? "4 4" : "0"}
              />
              <text
                x={paddingLeft - 10}
                y={getY(tick) + 4}
                textAnchor="end"
                className="text-[10px] font-medium fill-slate-400"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* X axis labels (Dates) */}
          {essays.map((essay, idx) => {
            // Draw fewer labels if there are many items to prevent overlap
            if (N > 5 && idx % 2 !== 0 && idx !== N - 1) return null;
            return (
              <text
                key={essay.id}
                x={getX(idx)}
                y={svgHeight - 15}
                textAnchor="middle"
                className="text-[10px] font-semibold fill-slate-400"
              >
                {formatDate(essay.createdAt).split('/')[0] + '/' + formatDate(essay.createdAt).split('/')[1]}
              </text>
            );
          })}

          {/* Area under the curve */}
          {points.length > 0 && (
            <path d={areaD} fill="url(#overallAreaGrad)" className="transition-all duration-300" />
          )}

          {/* Connecting line */}
          {points.length > 0 && (
            <path
              d={pathD}
              fill="none"
              stroke="var(--primary-light)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Hover helper vertical line */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              y1={paddingTop}
              x2={getX(hoveredIndex)}
              y2={paddingTop + chartHeight}
              stroke="var(--primary-light)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              className="pointer-events-none"
            />
          )}

          {/* Data points */}
          {points.map((pt, idx) => (
            <g key={pt.essay.id}>
              {/* Outer halo on hover */}
              {hoveredIndex === idx && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={8}
                  fill="var(--primary-light)"
                  opacity={0.3}
                  className="pointer-events-none transition-all duration-150 animate-ping"
                />
              )}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === idx ? 6 : 4}
                fill={hoveredIndex === idx ? "var(--primary)" : "var(--primary-light)"}
                stroke="#ffffff"
                strokeWidth={2}
                className="transition-all duration-150 cursor-pointer pointer-events-none"
              />
            </g>
          ))}

          {/* Interactive touch/hover capture zones */}
          {essays.map((essay, idx) => {
            const width = N <= 1 ? chartWidth : chartWidth / (N - 1);
            const x = getX(idx) - width / 2;
            return (
              <rect
                key={`hit-${essay.id}`}
                x={x}
                y={paddingTop}
                width={width}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  // Render Competencies Evolution Chart
  const renderCompetenciesChart = () => {
    const maxY = 200;
    const getY = (score: number) => {
      return paddingTop + chartHeight * (1 - score / maxY);
    };

    const yTicks = [0, 40, 80, 120, 160, 200];

    return (
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none">
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={getY(tick)}
                x2={svgWidth - paddingRight}
                y2={getY(tick)}
                stroke="#e2e8f0"
                strokeWidth={1}
                strokeDasharray={tick !== 0 && tick !== 200 ? "4 4" : "0"}
              />
              <text
                x={paddingLeft - 10}
                y={getY(tick) + 4}
                textAnchor="end"
                className="text-[10px] font-medium fill-slate-400"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* X axis labels (Dates) */}
          {essays.map((essay, idx) => {
            if (N > 5 && idx % 2 !== 0 && idx !== N - 1) return null;
            return (
              <text
                key={essay.id}
                x={getX(idx)}
                y={svgHeight - 15}
                textAnchor="middle"
                className="text-[10px] font-semibold fill-slate-400"
              >
                {formatDate(essay.createdAt).split('/')[0] + '/' + formatDate(essay.createdAt).split('/')[1]}
              </text>
            );
          })}

          {/* Hover helper vertical line */}
          {hoveredIndex !== null && (
            <line
              x1={getX(hoveredIndex)}
              y1={paddingTop}
              x2={getX(hoveredIndex)}
              y2={paddingTop + chartHeight}
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              className="pointer-events-none"
            />
          )}

          {/* Draw line for each active competency */}
          {competencyMeta.map((comp) => {
            if (!visibleComps[comp.id]) return null;

            const points = essays.map((essay, idx) => ({
              x: getX(idx),
              y: getY(getScore(essay, comp.key)),
            }));

            let pathD = '';
            if (points.length > 0) {
              pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
            }

            return (
              <g key={comp.id}>
                {/* Connecting Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={comp.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                  opacity={0.85}
                />
                
                {/* Circular dots */}
                {points.map((pt, idx) => (
                  <circle
                    key={`${comp.id}-dot-${idx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 5 : 3.5}
                    fill={comp.color}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="transition-all duration-150 pointer-events-none"
                  />
                ))}
              </g>
            );
          })}

          {/* Interactive touch/hover capture zones */}
          {essays.map((essay, idx) => {
            const width = N <= 1 ? chartWidth : chartWidth / (N - 1);
            const x = getX(idx) - width / 2;
            return (
              <rect
                key={`hit-${essay.id}`}
                x={x}
                y={paddingTop}
                width={width}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div 
      className="evolution-charts-container" 
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--line-color)',
        marginBottom: '3rem',
        position: 'relative'
      }}
    >
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            Evolução de Notas
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
            Acompanhe seu desempenho nos últimos {essays.length} envios.
          </p>
        </div>

        {/* Tab Buttons */}
        <div 
          style={{
            display: 'flex',
            background: 'var(--bg-main)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--line-color)'
          }}
        >
          <button
            onClick={() => { setActiveTab('overall'); setHoveredIndex(null); }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'overall' ? '#ffffff' : 'transparent',
              color: activeTab === 'overall' ? 'var(--primary)' : 'var(--text-light)',
              boxShadow: activeTab === 'overall' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Nota Geral
          </button>
          <button
            onClick={() => { setActiveTab('competencies'); setHoveredIndex(null); }}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'competencies' ? '#ffffff' : 'transparent',
              color: activeTab === 'competencies' ? 'var(--primary)' : 'var(--text-light)',
              boxShadow: activeTab === 'competencies' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Competências
          </button>
        </div>
      </div>

      {/* Competencies Toggles */}
      {activeTab === 'competencies' && (
        <div 
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--line-color)'
          }}
        >
          {competencyMeta.map((comp) => {
            const isActive = visibleComps[comp.id];
            return (
              <button
                key={comp.id}
                onClick={() => setVisibleComps(prev => ({ ...prev, [comp.id]: !prev[comp.id] }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `1.5px solid ${comp.color}`,
                  background: isActive ? `${comp.color}15` : 'transparent',
                  color: isActive ? comp.color : 'var(--text-light)',
                  opacity: isActive ? 1 : 0.6,
                  transition: 'all 0.2s ease'
                }}
              >
                <div 
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: comp.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isActive && <Check size={6} color="#ffffff" strokeWidth={4} />}
                </div>
                {comp.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Render Chart */}
      {activeTab === 'overall' ? renderOverallChart() : renderCompetenciesChart()}

      {/* Hover Tooltip Popup Box */}
      {hoveredIndex !== null && (
        <div 
          className="absolute z-20 transition-all duration-150"
          style={{
            left: getX(hoveredIndex) >= svgWidth / 2 ? '2rem' : 'auto',
            right: getX(hoveredIndex) < svgWidth / 2 ? '2rem' : 'auto',
            bottom: '2rem',
            width: '260px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--line-color)',
            borderRadius: '16px',
            padding: '1rem',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '0.4rem' }}>
            <Calendar size={12} />
            <span>{formatDate(essays[hoveredIndex].createdAt)}</span>
          </div>

          <h4 
            style={{ 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              color: 'var(--text-dark)', 
              marginBottom: '0.8rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.2rem'
            }}
          >
            {essays[hoveredIndex].theme}
          </h4>

          {/* Breakdown List */}
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '0.85rem', borderBottom: '1px solid var(--line-color)', paddingBottom: '0.4rem', marginBottom: '0.2rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                <Trophy size={14} />
                Nota Final
              </span>
              <span style={{ color: 'var(--primary-light)' }}>
                {essays[hoveredIndex].totalScore} pts
              </span>
            </div>

            {/* Display relevant grades based on tab */}
            {competencyMeta.map((comp) => {
              const score = getScore(essays[hoveredIndex], comp.key);
              const isCompActive = activeTab === 'competencies' ? visibleComps[comp.id] : true;
              
              return (
                <div 
                  key={comp.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    fontSize: '0.75rem',
                    opacity: isCompActive ? 1 : 0.35,
                    fontWeight: 600
                  }}
                >
                  <span style={{ color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: comp.color }} />
                    {comp.label.split(':')[0]}
                  </span>
                  <span style={{ color: comp.color, fontWeight: 700 }}>
                    {score} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
