"use client";

import { Users, TrendingUp } from "lucide-react";

interface GroupData {
  id: string;
  name: string;
  memberCount: number;
  description: string;
  avatar?: string;
  trending?: boolean;
}

const mockGroups: GroupData[] = [
  {
    id: "1",
    name: "No Groups formed yet",
    memberCount: 0,
    description: "Study tips and motivation",
    trending: false,
  },
  // {
  //   id: "2",
  //   name: "examprep",
  //   memberCount: 89600,
  //   description: "Exam preparation strategies",
  // },
  // {
  //   id: "3",
  //   name: "coding",
  //   memberCount: 156700,
  //   description: "Programming and development",
  //   trending: true,
  // },
];

export default function SuggestedGroups() {
  const formatMemberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg p-3 sticky top-20 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex items-center space-x-2 mb-3">
        <TrendingUp size={16} className="text-orange-500" />
        <h3 className="text-white font-semibold text-xs">POPULAR COMMUNITIES</h3>
      </div>

      <div className="space-y-2">
        {mockGroups.map((group, index) => (
          <div
            key={group.id}
            className="flex items-center justify-between hover:bg-[#272729] p-1.5 rounded transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <span className="text-gray-400 text-xs font-medium w-4">
                {index + 1}
              </span>
              {/* <img
                src={group.avatar || "/api/placeholder/20/20"}
                alt={group.name}
                className="w-5 h-5 rounded-full bg-orange-500 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/20/20";
                }}
              /> */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <p className="text-white text-xs font-medium truncate">
                    #{group.name}
                  </p>
                  {group.trending && (
                    <TrendingUp size={10} className="text-orange-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-gray-400 text-xs truncate">
                  {formatMemberCount(group.memberCount)}
                </p>
              </div>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-0.5 rounded-full transition-colors flex-shrink-0">
              Join
            </button>
          </div>
        ))}
      </div>

      <button className="w-full mt-3 text-blue-400 hover:bg-[#272729] text-xs py-1.5 rounded transition-colors">
        View All
      </button>

      <div className="mt-4 pt-3 border-t border-[#343536]">
        <div className="flex items-center space-x-2 mb-2">
          <Users size={14} className="text-green-500" />
          <h4 className="text-white font-semibold text-xs">RECENT</h4>
        </div>

        <div className="space-y-1">
          {mockGroups.slice(0, 2).map((group) => (
            <div key={`recent-${group.id}`} className="flex items-center space-x-2 hover:bg-[#272729] p-1.5 rounded transition-colors cursor-pointer">
              {/* <img
                src={group.avatar || "/api/placeholder/16/16"}
                alt={group.name}
                className="w-4 h-4 rounded-full bg-green-500"
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/16/16";
                }}
              /> */}
              <span className="text-gray-300 text-xs truncate">#{group.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
