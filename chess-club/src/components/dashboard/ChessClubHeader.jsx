import React from 'react';
import { ChessKnight, Clock, CalendarDays } from 'lucide-react';

export default function ChessClubHeader({ sessionStart, sessionEnd }) {
  const currentDate = new Date();
  
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ChessKnight className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Sherwood Elementary Chess Club
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{sessionStart} - {sessionEnd}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <CalendarDays className="h-4 w-4" />
              <span>Every Wednesday</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}