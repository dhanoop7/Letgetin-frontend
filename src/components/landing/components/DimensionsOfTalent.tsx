import React from 'react';
import { SIX_DIMENSIONS_LIST } from '../constants/landing.constants';
import { SectionHeader } from './ui/SectionHeader';
import type { PublishedCmsData } from '../services/cms.service';

interface DimensionsOfTalentProps {
  data?: PublishedCmsData['dimensionsOfTalent'];
}

export const DimensionsOfTalent: React.FC<DimensionsOfTalentProps> = ({ data }) => {
  const sectionTag = data?.sectionTag || "MODERN HIRING";
  const title = data?.title || "The 6 Dimensions of Talent";
  const subtitle = data?.subtitle || "How forward-thinking companies evaluate candidates in 2026.";
  const dimensions = (data?.dimensions && data.dimensions.length > 0) ? data.dimensions : SIX_DIMENSIONS_LIST;
  const expertInsight = data?.expertInsight || 'In 2026, the most valued parameter is "Verified Proof of Work." Companies are moving away from trusting CVs toward audited portfolios and AI-vetted live assessments.';

  return (
    <section id="dimensions" className="py-20 md:py-28 bg-white border-b border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeader
          badge={sectionTag}
          title={
            title.includes('6 Dimensions') ? (
              <>
                The <span className="text-gradient-blue">6 Dimensions</span> of Talent
              </>
            ) : (
              title
            )
          }
          subtitle={subtitle}
          className="mb-16"
        />

        {/* 6 Dimension Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {dimensions.map((dim) => (
            <div
              key={dim.num}
              className="bg-white rounded-[1.75rem] border border-[#e2edf8] p-7 transition-all duration-200 hover:border-[#bae6fd] hover:shadow-[0_10px_25px_rgba(2,132,199,0.06)] flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-semibold text-[#0066cc] block mb-2">
                  {dim.num}
                </span>

                <h3 className="text-base font-bold text-[#061f3d] tracking-tight mb-2">
                  {dim.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {dim.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Expert Insight Callout Box */}
        <div className="bg-[#f0f8ff] border border-[#dbeafe] rounded-2xl p-5 sm:p-6 text-center max-w-3xl mx-auto shadow-2xs">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong className="text-[#061f3d] font-bold">Expert Insight:</strong> {expertInsight}
          </p>
        </div>

      </div>
    </section>
  );
};
