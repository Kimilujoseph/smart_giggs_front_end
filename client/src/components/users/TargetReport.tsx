import React from 'react';

const DailyTargetReport = ({ progressData, targets }) => {
  const getMotivationalMessage = (sold, target) => {
    if (sold === 0) {
      return "Let's get started!";
    }
    if (sold >= target) {
      return 'Target achieved! Great job!';
    }
    if (sold / target >= 0.5) {
      return "You're halfway there, keep going!";
    }
    return 'Keep pushing!';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {Object.keys(targets).map((type) => {
        const sold = progressData[type] || 0;
        const target = targets[type];
        const progress = Math.min(100, (sold / target) * 100);

        return (
          <div
            key={type}
            className="dark:bg-boxdark bg-white dark:text-bodydark p-4 rounded-lg shadow-md"
          >
            <h4 className="font-semibold text-lg capitalize mb-2">{type} Daily Target</h4>
            <div className="flex justify-between items-center mb-1 text-sm">
                <span>Sold: {sold} / {target}</span>
                <span className={`${progress === 100 ? 'text-green-500' : ''}`}>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className={`${
                  progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                } h-2.5 rounded-full`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs italic mt-2">{getMotivationalMessage(sold, target)}</p>
          </div>
        );
      })}
    </div>
  );
};

export default DailyTargetReport;
