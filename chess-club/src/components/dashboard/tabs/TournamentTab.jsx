import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function TournamentTab({ achievementStats, recentMatches }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
        <CardDescription>Track tournament progress and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Achievement Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-600">5 Point Club</p>
              <p className="text-2xl font-bold">{achievementStats.fivePointClub || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-600">Chess Champions</p>
              <p className="text-2xl font-bold">{achievementStats.chessChampions || 0}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-yellow-600">Active Players</p>
              <p className="text-2xl font-bold">{achievementStats.activePlayers || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-600">Social Players</p>
              <p className="text-2xl font-bold">{achievementStats.socialPlayers || 0}</p>
            </div>
          </div>

          {/* Recent Matches List */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Latest Matches</h3>
            </div>
            <div className="divide-y">
              {recentMatches.map((match, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{match.player1}</p>
                      <p className="text-sm text-gray-500">vs</p>
                      <p className="font-medium">{match.player2}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{match.result}</p>
                    <p className="text-gray-500">{match.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}