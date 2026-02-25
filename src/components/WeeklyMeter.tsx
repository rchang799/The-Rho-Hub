import React from 'react';
import { PlanEvent } from '../types';

interface WeeklyMeterProps {
  tasks: PlanEvent[];
}

const WeeklyMeter: React.FC<WeeklyMeterProps> = ({ tasks }) => {
  const totalWeight = tasks.reduce((sum, task) => sum + (task.weight || 0), 0);
  const completedWeight = tasks.reduce((sum, task) => {
    return task.completed ? sum + (task.weight || 0) : sum;
  }, 0);

  const progress = totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-white text-lg font-semibold mb-2">Week 3 Progress</h3>
      <div className="w-full bg-gray-700 rounded-full h-4">
        <div
          className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-right text-white text-sm mt-1">{Math.round(progress)}%</p>
    </div>
  );
};

export default WeeklyMeter;
