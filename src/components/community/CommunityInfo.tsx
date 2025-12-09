"use client";

import { useState } from "react";
import { Community, getSubcommunitiesByCommunity } from "@/lib/communityService";
import { Subcommunity } from "@/lib/communityService";
import { Plus, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import CreateSubcommunityModal from "@/components/community/CreateSubcommunityModal";

export default function CommunityInfo({
  community,
  isMember,
}: {
  community: Community;
  isMember: boolean;
}) {
  const [showCreateSubcommunity, setShowCreateSubcommunity] = useState(false);
  const [subcommunities, setSubcommunities] = useState<Subcommunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubcommunities = async () => {
      if (community.id) {
        setLoading(true);
        try {
          const subs = await getSubcommunitiesByCommunity(community.id);
          setSubcommunities(subs);
        } catch (error) {
          console.error("Error fetching subcommunities:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSubcommunities();
  }, [community.id]);

  const handleSubcommunityCreated = (newSubcommunity: Subcommunity) => {
    setSubcommunities([newSubcommunity, ...subcommunities]);
    setShowCreateSubcommunity(false);
  };

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <div className="bg-[#1a1a1a] border border-[#343536] rounded-lg p-4">
        <h3 className="text-white font-semibold mb-4">Community Info</h3>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-400">Category</p>
            <p className="text-white font-medium">{community.category}</p>
          </div>

          {community.tags && community.tags.length > 0 && (
            <div>
              <p className="text-gray-400 mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {community.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-[#2a2a2a] rounded-full text-gray-300 text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-[#343536]">
            <p className="text-gray-400 mb-2">Created by</p>
            <Link
              href={`/profile/${community.createdBy}`}
              className="text-blue-400 hover:underline text-sm"
            >
              u/{community.createdBy}
            </Link>
          </div>
        </div>
      </div>

      {/* Rules Card */}
      {community.rules && community.rules.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#343536] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertCircle size={18} />
            Rules
          </h3>

          <ol className="space-y-3 text-sm">
            {community.rules.map((rule, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-gray-400 font-medium min-w-fit">{index + 1}.</span>
                <span className="text-gray-300">{rule}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Subcommunities Card */}
      {isMember && (
        <div className="bg-[#1a1a1a] border border-[#343536] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Subcommunities</h3>
            <button
              onClick={() => setShowCreateSubcommunity(true)}
              className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
              title="Create subcommunity"
            >
              <Plus size={18} className="text-blue-400" />
            </button>
          </div>

          {loading ? (
            <div className="text-gray-400 text-sm text-center py-4">Loading...</div>
          ) : subcommunities.length > 0 ? (
            <div className="space-y-2">
              {subcommunities.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/c/${community.handle}/sc/${sub.handle}`}
                  className="block p-2 hover:bg-[#2a2a2a] rounded transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    {sub.iconUrl ? (
                      <img
                        src={sub.iconUrl}
                        alt={sub.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate group-hover:text-blue-400">
                        {sub.name}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        sc/{sub.handle}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm text-center py-4">
              No subcommunities yet
            </div>
          )}
        </div>
      )}

      {/* Create Subcommunity Modal */}
      <CreateSubcommunityModal
        isOpen={showCreateSubcommunity}
        community={community}
        onCloseAction={() => setShowCreateSubcommunity(false)}
        onSuccessAction={handleSubcommunityCreated}
      />
    </div>
  );
}
