import React from 'react';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GPA GAME</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t('footer.description')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {t('footer.links')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400">{t('footer.about')}</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400">{t('footer.contact')}</a></li>
              <li><a href="#" className="hover:text-cyan-600 dark:hover:text-cyan-400">{t('footer.privacy')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              {t('footer.support')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('footer.supportText')}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} GPA GAME. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};
