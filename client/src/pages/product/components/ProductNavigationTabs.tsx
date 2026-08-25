import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface SectionItem {
  name: string;
  key: string;
  icon: LucideIcon;
}

interface ProductNavigationTabsProps {
  sections: SectionItem[];
  activeSection: string;
  onSelectTab: (key: string) => void;
}

const ProductNavigationTabs: React.FC<ProductNavigationTabsProps> = ({
  sections,
  activeSection,
  onSelectTab,
}) => {
  return (
    <div className="mb-6">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-md overflow-x-auto">
        <div className="flex">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => onSelectTab(section.key)}
              className={`w-full md:w-auto flex items-center justify-center md:justify-start p-4 border-b md:border-b-0 last:border-b-0 outline-none ${
                activeSection === section.key
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-meta-4'
              }`}
            >
              <section.icon className="mr-3 w-5 h-5 block" />
              <div className="text-sm font-medium whitespace-nowrap">
                {section.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductNavigationTabs;
