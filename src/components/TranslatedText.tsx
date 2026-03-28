import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslationService } from '../hooks/useTranslationService';

interface TranslatedTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  text, 
  className = '', 
  as: Component = 'span' 
}) => {
  const { language } = useLanguage();
  const { translateContent } = useTranslationService();
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (language === 'en') {
      setDisplayText(text);
      return;
    }

    let isMounted = true;
    const translate = async () => {
      const translated = await translateContent(text, language);
      if (isMounted) setDisplayText(translated);
    };

    translate();
    return () => { isMounted = false; };
  }, [text, language, translateContent]);

  return <Component className={className}>{displayText}</Component>;
};
