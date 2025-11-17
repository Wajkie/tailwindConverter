import React from 'react';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'feature' | 'improvement' | 'fix';
    description: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '2025-11-17',
    changes: [
      {
        type: 'feature',
        description: 'Added configuration file support - Create style-convert.config.js to customize paths, file extensions, and naming conventions'
      },
      {
        type: 'feature',
        description: 'Support for .jsx and .js files - No longer limited to TypeScript! Now works with JavaScript files too'
      },
      {
        type: 'improvement',
        description: 'Configurable file extensions - Choose which file types to process'
      }
    ]
  },
  {
    version: '1.0.3',
    date: '2025-11-17',
    changes: [
      {
        type: 'improvement',
        description: 'Removed unnecessary demo dependencies from the CLI package'
      },
      {
        type: 'improvement',
        description: 'Reduced package size and installation time'
      }
    ]
  },
  {
    version: '1.0.0',
    date: '2025-11-17',
    changes: [
      {
        type: 'feature',
        description: 'Initial release of style-converter CLI'
      },
      {
        type: 'feature',
        description: 'Convert Tailwind and Bootstrap classes to CSS Modules'
      },
      {
        type: 'feature',
        description: 'Automatic TSX file updates with --replace flag'
      },
      {
        type: 'feature',
        description: 'Generate detailed conversion reports'
      }
    ]
  }
];

export const Changelog: React.FC = () => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-green-100 text-green-800';
      case 'improvement': return 'bg-blue-100 text-blue-800';
      case 'fix': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return '‚ú®';
      case 'improvement': return '‚ö°';
      case 'fix': return 'Ì∞õ';
      default: return 'Ì≥ù';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Changelog</h2>
      <div className="space-y-8">
        {changelog.map((entry) => (
          <div key={entry.version} className="border-l-4 border-blue-500 pl-6 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-gray-900">v{entry.version}</span>
              <span className="text-sm text-gray-500">{entry.date}</span>
              {entry.version === changelog[0].version && (
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-semibold">
                  Latest
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {entry.changes.map((change, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(change.type)} inline-flex items-center gap-1`}>
                    <span>{getTypeIcon(change.type)}</span>
                    <span className="capitalize">{change.type}</span>
                  </span>
                  <span className="text-gray-700 flex-1">{change.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
