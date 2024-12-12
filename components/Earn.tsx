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
  status: 'pending' | 'completed';
}

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
              <div
                key={task.id}
                className="grid grid-cols-3 items-center px-4 py-3 text-gray-300"
              >
                <div>{task.title}</div>
                <div>{task.tokens} $MAT</div>
                <div className="text-right">
                  {task.status === 'completed' ? (
                    <span className="px-4 py-1 bg-green-500/20 text-green-500 rounded-full text-sm">
                      Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleTaskAction(task.id)}
                      className="px-4 py-1 bg-[#ffd700] text-black rounded-full text-sm hover:bg-[#ffd700]/90 transition-colors"
                    >
                      Perform Task
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
