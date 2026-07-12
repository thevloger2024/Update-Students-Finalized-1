import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
  jobPosting?: {
    title: string;
    description: string;
    datePosted: string;
    validThrough: string;
    hiringOrganization: {
      name: string;
      logo?: string;
    };
    jobLocation: {
      addressRegion: string;
      addressCountry: string;
    };
  };
}

export function SEO({ title, description, keywords, url, jobPosting }: SEOProps) {
  const { settings } = useSiteSettings();
  const siteName = settings.siteName;
  const siteUrl = window.location.origin;
  const currentUrl = url || `${siteUrl}${window.location.pathname}`;

  return (
    <Helmet>
      <title>{title} | {siteName}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />
      <link rel="canonical" href={currentUrl} />

      {jobPosting && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            "title": jobPosting.title,
            "description": jobPosting.description,
            "datePosted": jobPosting.datePosted,
            "validThrough": jobPosting.validThrough,
            "hiringOrganization": {
              "@type": "Organization",
              "name": jobPosting.hiringOrganization.name,
              "logo": jobPosting.hiringOrganization.logo || `${siteUrl}/icon.png`
            },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressRegion": jobPosting.jobLocation.addressRegion,
                "addressCountry": jobPosting.jobLocation.addressCountry
              }
            }
          })}
        </script>
      )}
    </Helmet>
  );
}
