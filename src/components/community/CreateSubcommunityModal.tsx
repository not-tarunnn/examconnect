"use client";

import { useState } from "react";
import { createSubcommunity, Subcommunity, Community } from "@/lib/communityService";
import { getAuth } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

type CreateSubcommunityModalProps = {
  isOpen: boolean;
  community: Community;
  onClose: () => void;
  onSuccess: (subcommunity: Subcommunity & { id: string }) => void;
};

export default function CreateSubcommunityModal({
  isOpen,
  community,
  onClose,
  onSuccess,
}: CreateSubcommunityModalProps) {
  const auth = getAuth();
  const user = auth.currentUser;

  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !community.id) {
      setError("You must be logged in to create a subcommunity");
      return;
    }

    if (!formData.name.trim() || !formData.handle.trim()) {
      setError("Name and handle are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const subcommunityData: Subcommunity = {
        name: formData.name,
        handle: formData.handle,
        description: formData.description,
        parentCommunityId: community.id,
        parentCommunityHandle: community.handle,
        createdBy: user.uid,
        memberCount: 1,
      };

      const id = await createSubcommunity(subcommunityData);
      onSuccess({ ...subcommunityData, id });
      setFormData({
        name: "",
        handle: "",
        description: "",
      });
      onClose();
    } catch (err) {
      console.error("Error creating subcommunity:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create subcommunity. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
      <div className="bg-[#1a1a1a] text-white rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="border-b border-[#343536] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create a Subcommunity</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <p className="text-gray-400 text-sm">
            Creating a subcommunity under <span className="text-blue-400 font-medium">c/{community.handle}</span>
          </p>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Subcommunity Name *
            </label>
            <Input
              type="text"
              placeholder="e.g., Physics Prep"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-[#2a2a2a] border-[#343536] text-white placeholder-gray-500"
            />
          </div>

          {/* Handle */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Handle *
            </label>
            <div className="flex items-center">
              <span className="bg-[#2a2a2a] border-[#343536] border px-3 py-2 rounded-l-md text-gray-400 text-sm whitespace-nowrap">
                sc/
              </span>
              <Input
                type="text"
                placeholder="physics-prep"
                value={formData.handle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    handle: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                className="bg-[#2a2a2a] border-[#343536] text-white placeholder-gray-500 rounded-l-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Unique identifier within {community.handle}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Description
            </label>
            <Textarea
              placeholder="What is this subcommunity about?"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-[#2a2a2a] border-[#343536] text-white placeholder-gray-500 min-h-[100px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-6 border-t border-[#343536]">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
