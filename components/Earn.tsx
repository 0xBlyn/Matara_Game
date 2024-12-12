'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/utils/game-mechaincs';
import { formatNumber } from '@/utils/ui';
import { ToastContainer } from 'react-toastify';

interface Task {
  id: string;
  title: string;
  tokens: number;
  type: string;
  status: 'pending' | 'completed' | 'claimed';
  image: string;
  callToAction: string;
  link: string;
}

const TaskButton = ({ task }: { task: Task }) => {
  const getButtonStyle = () => {
    switch (task.status) {
      case 'completed':
        return 'bg-green-500 opacity-50 cursor-not-allowed';
      case 'claimed':
        return 'bg-gray-500 opacity-50 cursor-not-allowed';
      default:
        return 'bg-[#FFB948] hover:bg-[#FFA925]';
    }
  };

  const getButtonText = () => {
    switch (task.status) {
      case 'completed':
        return 'Completed';
      case 'claimed':
        return 'Claimed';
      default:
        return 'Perform Task';
    }
  };

  return (
    <button
      disabled={task.status === 'completed' || task.status === 'claimed'}
      className={`px-4 py-2 rounded-lg text-sm font-medium ${getButtonStyle()}`}
      onClick={() => {
        if (task.link) {
          window.open(task.link, '_blank');
        }
      }}
    >
      {getButtonText()}
    </button>
  );
};

export default function Earn() {
  const { userTelegramInitData } = useGameStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/tasks?initData=${encodeURIComponent(userTelegramInitData)}`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [userTelegramInitData]);

  const handleTaskAction = async (taskId: string) => {
    // Implementation for task action
  };

  return (
    <div className="min-h-screen bg-[#0a1118] text-white p-4">
      <ToastContainer />
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#ffd700] mb-4">Social Task</h1>
        <p className="text-center text-gray-400 mb-8">
          Perform Social Tasks to earn more Matara<br />
          Tokens ($MAT) and grow your rank.
        </p>

        <div className="grid grid-cols-3 text-sm text-gray-400 mb-4 px-4">
          <div>Task</div>
          <div>Earnings</div>
          <div className="text-right">Action</div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd700]" />
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex justify-between items-center py-3 border-b border-gray-700">
                <div className="flex-1">
                  <p className="text-white">{task.title}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#FFB948]">{task.tokens} $MAT</span>
                  <TaskButton task={task} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
