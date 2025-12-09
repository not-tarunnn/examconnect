"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/lib/communityService";
import { Community, getAllCommunities } from "@/lib/communityService";

type CreatePostModalProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  defaultCommunityId?: string;
};

export default function CreatePostModal({
  isOpen,
  onCloseAction,
  defaultCommunityId
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState(defaultCommunityId || "");
  const [communitiesLoading, setCommunitiesLoading] = useState(true);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setCommunitiesLoading(true);
        const { communities } = await getAllCommunities(100);
        setCommunities(communities);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setCommunitiesLoading(false);
      }
    };

    if (isOpen) {
      fetchCommunities();
    }
  }, [isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFile(reader.result as string); // Base64 string
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    if (!title.trim()) return;

    setLoading(true);
    try {
      // Fetch username by querying where uid == currentUser.uid
      const q = query(
        collection(db, "usernames"),
        where("uid", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("No username found for this user.");
      }

      const username = snapshot.docs[0].id; // doc ID is the username

      // Find selected community details
      const selectedCommunity = communities.find((c) => c.id === selectedCommunityId);

      await createPost({
        title,
        description: description.trim() || undefined,
        mediaUrl: file || undefined,
        type: file
          ? file.includes("video")
            ? "video"
            : "image"
          : "text",
        author: {
          id: user.uid,
          username,
        },
        communityId: selectedCommunityId || undefined,
        communityHandle: selectedCommunity?.handle || undefined,
        reactions: { likes: 0, dislikes: 0 },
        commentsCount: 0,
        views: 0,
      });

      // reset form
      setTitle("");
      setDescription("");
      setFile(null);
      setSelectedCommunityId("");
      onCloseAction();
    } catch (err) {
      console.error("Error adding post:", err);
    }
    setLoading(false);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div className="bg-[#1a1a1a] text-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Create a Post</h2>

        {/* Community Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Community (Optional)
          </label>
          {communitiesLoading ? (
            <div className="bg-[#2a2a2a] border border-[#343536] rounded-md px-3 py-2 text-gray-400">
              Loading communities...
            </div>
          ) : (
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-[#343536] text-white rounded-md px-3 py-2"
            >
              <option value="">General (No specific community)</option>
              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  c/{community.handle} - {community.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Title */}
        <Input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-3 bg-[#2a2a2a] border-none text-white placeholder-gray-400"
        />

        {/* Description */}
        <Textarea
          placeholder="Write a description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-3 bg-[#2a2a2a] border-none text-white placeholder-gray-400 min-h-[100px]"
        />

        {/* File Upload */}
        <label className="block mb-3">
          <span className="text-sm text-gray-400">Upload image/video</span>
          <Input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="mt-1 bg-[#2a2a2a] border-none text-white"
          />
        </label>

        {/* Preview */}
        {file && (
          <div className="mb-3">
            {file.startsWith("data:video") ? (
              <video src={file} controls className="w-full rounded-lg max-h-64" />
            ) : (
              <img
                src={file}
                alt="preview"
                className="w-full rounded-lg max-h-64 object-contain"
              />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button
            variant="ghost"
            onClick={onCloseAction}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
