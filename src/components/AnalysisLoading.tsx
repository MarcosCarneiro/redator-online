'use client';

import { useState, useEffect } from 'react';
import { Search, PenTool, BarChart3, CheckCircle2, Sparkles } from 'lucide-react';

export const AnalysisLoading = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: <Search size={24} />, text: 'Lendo e interpretando seu texto...' },
    { icon: <PenTool size={24} />, text: 'Verificando gramática e norma culta...' },
    { icon: <Sparkles size={24} />, text: 'Analisando repertório e coesão...' },
    { icon: <BarChart3 size={24} />, text: 'Avaliando as 5 competências do ENEM...' },
    { icon: <CheckCircle2 size={24} />, text: 'Finalizando seu relatório detalhado...' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500); // Muda a cada 2.5 segundos para dar tempo de ler
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="analysis-loading-overlay">
      <div className="loading-card">
        <div className="loading-scanner">
          <div className="scan-line"></div>
        </div>
        
        <div className="loading-content">
          <div className="icon-main-animate">
            {steps[currentStep].icon}
          </div>
          
          <div className="steps-list">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`step-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              >
                <div className="step-dot">
                  {index < currentStep ? <CheckCircle2 size={14} /> : index + 1}
                </div>
                <span className="step-text">{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="loading-footer">
          <p>Nossa IA está trabalhando para te dar o melhor feedback.</p>
          <div className="progress-bar-minimal">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
