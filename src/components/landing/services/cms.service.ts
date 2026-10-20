import { resolveApiBaseUrl } from '@/shared/services/apiClient';

export interface PublishedCmsData {
  status: 'published';
  publishedAt?: string;
  updatedAt?: string;
  sectionVisibility?: {
    hero?: boolean;
    cinematicShowcase?: boolean;
    statsAndShift?: boolean;
    coreFeatures?: boolean;
    dimensions?: boolean;
    exploreOpportunities?: boolean;
    blogMatrix?: boolean;
    videoHub?: boolean;
    whyAndTestimonials?: boolean;
    finalCTA?: boolean;
  };
  navbar?: {
    brandName?: string;
    brandHighlight?: string;
    badge?: string;
    navLinks?: Array<{ label: string; href: string }>;
    signInText?: string;
    ctaButtonText?: string;
  };
  hero?: {
    tagBadge?: string;
    headlineLine1?: string;
    headlineLine2Gradient?: string;
    subtitle?: string;
    subtitleHighlight?: string;
    primaryCtaText?: string;
    secondaryCtaText?: string;
    proofBadges?: string[];
    profiles?: any[];
  };
  cinematicVideoShowcase?: {
    topHeading?: string;
    topBadge?: string;
    videoUrls?: string[];
    posterImage?: string;
    stats?: {
      matchRate?: string;
      assessmentVolume?: string;
      averageSalary?: string;
    };
    liveRoles?: Array<{
      title: string;
      comp: string;
      company: string;
      status: string;
    }>;
  };
  statsAndShift?: {
    stats?: Array<{ value: string; label: string; sub: string }>;
    sectionTag?: string;
    headingLine1?: string;
    headingLine2Gradient?: string;
    subtitle?: string;
    subtitleHighlight?: string;
    oldWay?: {
      title?: string;
      subtitle?: string;
      points?: Array<{ label: string; desc: string }>;
      statusText?: string;
    };
    letGetInWay?: {
      title?: string;
      badge?: string;
      subtitle?: string;
      points?: Array<{ label: string; desc: string }>;
    };
    liveRoles?: Array<{
      title: string;
      rate: string;
      status: string;
      field: string;
    }>;
  };
  corePlatformOS?: {
    sectionTag?: string;
    title?: string;
    titleHighlight?: string;
    titleSuffix?: string;
    subtitle?: string;
    features?: Array<{
      id: number;
      title: string;
      description: string;
      tag: string;
    }>;
  };
  dimensionsOfTalent?: {
    sectionTag?: string;
    title?: string;
    titleHighlight?: string;
    subtitle?: string;
    dimensions?: Array<{
      num: string;
      title: string;
      description: string;
    }>;
    expertInsight?: string;
  };
  blogMatrix?: {
    sectionTag?: string;
    title?: string;
    categories?: string[];
    articles?: Array<{
      id: number;
      title: string;
      description: string;
      category: string;
      date: string;
      readTime: string;
      author: string;
      featured: boolean;
      badge: string;
    }>;
  };
  videoContent?: {
    sectionTag?: string;
    title?: string;
    subtitle?: string;
    videoList?: Array<{
      id: number;
      title: string;
      duration: string;
      category: string;
      speaker: string;
      description: string;
      badge: string;
      tag: string;
    }>;
  };
  whyAndTestimonials?: {
    whyTag?: string;
    whyTitle?: string;
    whySubtitle?: string;
    othersProblemPoints?: string[];
    letGetInSolutionPoints?: string[];
    testimonialsTag?: string;
    testimonialsTitle?: string;
    testimonialsTitleHighlight?: string;
    testimonialsTitleSuffix?: string;
    testimonialsList?: Array<{
      quote: string;
      author: string;
      role: string;
      initials: string;
      rating: number;
    }>;
  };
  finalCTA?: {
    badge?: string;
    headline?: string;
    subtitle?: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    microAssurances?: string[];
  };
  footer?: {
    brandDescription?: string;
    statusText?: string;
    copyright?: string;
    complianceText?: string;
    socialLinks?: Array<{ label: string; href: string }>;
  };
}

let cachedCmsData: PublishedCmsData | null = null;

export const publicCmsService = {
  async getPublishedContent(): Promise<PublishedCmsData | null> {
    const baseUrl = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
    try {
      const res = await fetch(`${baseUrl}/cms/landing-page`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        console.warn(`[CMS] Failed to fetch published content, HTTP status: ${res.status}`);
        return cachedCmsData;
      }
      const json = await res.json();
      if (json.success && json.data) {
        cachedCmsData = json.data;
        return json.data;
      }
    } catch (err) {
      console.warn('[CMS] Network error fetching published CMS content:', err);
    }
    return cachedCmsData;
  },
};
