import React from 'react';
import { IResume } from '../resume/types';
import { ModernSleekTemplate } from './components/ModernSleekTemplate';
import { ClassicAtsTemplate } from './components/ClassicAtsTemplate';
import { MinimalCleanTemplate } from './components/MinimalCleanTemplate';
import { ExecutiveProTemplate } from './components/ExecutiveProTemplate';
import { ALL_RESUME_TEMPLATES } from './data/templateList';

export interface TemplateProps {
  resume: IResume;
}

export const getTemplateComponent = (templateId: string): React.FC<TemplateProps> => {
  // Find template definition if it's one of the 40 templates
  const tpl = ALL_RESUME_TEMPLATES.find((t) => t.id === templateId);
  const layout = tpl ? tpl.baseLayout : templateId;

  switch (layout) {
    case 'modern-sleek':
      return ModernSleekTemplate;
    case 'classic-ats':
      return ClassicAtsTemplate;
    case 'minimal-clean':
      return MinimalCleanTemplate;
    case 'executive-pro':
      return ExecutiveProTemplate;
    default:
      return ModernSleekTemplate;
  }
};
