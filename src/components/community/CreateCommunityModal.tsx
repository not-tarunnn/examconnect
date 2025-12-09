"use client";

import { useState, useRef } from "react";
import { createCommunity, Community } from "@/lib/communityService";
import { getAuth } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload } from "lucide-react";

type CreateCommunityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (community: Community & { id: string }) => void;
};

export default function CreateCommunityModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCommunityModalProps) {
  const auth = getAuth();
  const user = auth.currentUser;
  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    description: "",
    category: "General",
    rules: [""],
    tags: [""],
  });

  const [iconPreview, setIconPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a community");
      return;
    }

    if (!formData.name.trim() || !formData.handle.trim()) {
      setError("Name and handle are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const communityData: Community = {
        name: formData.name,
        handle: formData.handle,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.filter((t) => t.trim()),
        rules: formData.rules.filter((r) => r.trim()),
        createdBy: user.uid,
        memberCount: 1,
        isVerified: false,
        iconUrl: iconPreview || undefined,
        bannerUrl: bannerPreview || undefined,
      };

      const id = await createCommunity(communityData);
      onSuccess({ ...communityData, id });
      setFormData({
        name: "",
        handle: "",
        description: "",
        category: "General",
        rules: [""],
        tags: [""],
      });
      setIconPreview("");
      setBannerPreview("");
      onClose();
    } catch (err) {
      console.error("Error creating community:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create community. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
      <div className="bg-[#1a1a1a] text-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#343536] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create a Community</h2>
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

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Community Name *
            </label>
            <Input
              type="text"
              placeholder="e.g., JEE Mains Preparation"
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
              Community Handle *
            </label>
            <div className="flex items-center">
              <span className="bg-[#2a2a2a] border-[#343536] border px-3 py-2 rounded-l-md text-gray-400 text-sm">
                c/
              </span>
              <Input
                type="text"
                placeholder="jee-mains"
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
              This is your community's unique identifier
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Description
            </label>
            <Textarea
              placeholder="Describe your community..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-[#2a2a2a] border-[#343536] text-white placeholder-gray-500 min-h-[100px]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-[#2a2a2a] border border-[#343536] text-white rounded-md px-3 py-2"
            >
              <option>General</option>
              <option>Education</option>
              <option>Technology</option>
              <option>Science</option>
              <option>Arts</option>
              <option>Sports</option>
              <option>Entertainment</option>
              <option>Other</option>
            </select>
          </div>

          {/* Display Picture */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Display Picture (Avatar)
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => iconInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-[#343536] text-white rounded-md hover:bg-[#3a3a3a] transition-colors"
              >
                <Upload size={16} />
                Choose Image
              </button>
              {iconPreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={iconPreview}
                    alt="Display preview"
                    className="w-16 h-16 rounded-full object-cover border border-[#343536]"
                  />
                  <button
                    type="button"
                    onClick={() => setIconPreview("")}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <input
              ref={iconInputRef}
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-1">Square image works best</p>
          </div>

          {/* Banner Picture */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Banner Picture
            </label>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-[#343536] text-white rounded-md hover:bg-[#3a3a3a] transition-colors w-fit"
              >
                <Upload size={16} />
                Choose Image
              </button>
              {bannerPreview && (
                <div className="flex flex-col gap-2">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="w-full h-32 rounded-md object-cover border border-[#343536]"
                  />
                  <button
                    type="button"
                    onClick={() => setBannerPreview("")}
                    className="text-red-400 hover:text-red-300 text-sm w-fit"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-1">Wide image recommended (recommended ratio: 16:9)</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Tags
            </label>
            <div className="space-y-2">
              {formData.tags.map((tag, index) => (
                <Input
                  key={index}
                  type="text"
                  placeholder="e.g., exam, preparation"
                  value={tag}
                  onChange={(e) => {
                    const newTags = [...formData.tags];
                    newTags[index] = e.target.value;
                    setFormData({ ...formData, tags: newTags });
                  }}
                  className="bg-[#2a2a2a] border-[#343536] text-white placeholder-gray-500"
                />
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tags: [...formData.tags, ""] })}
                className="text-blue-400 text-sm hover:text-blue-300 font-medium"
              >
                + Add Tag
              </button>
            </div>
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Community Rules
            </label>
            <div className="space-y-2">
              {formData.rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <span className="bg-[#2a2a2a] border-[#343536] border px-3 py-2 rounded-l-md text-gray-400 text-sm min-w-fit">
                    {index + 1}.
                  </span>
                  <Input
                    type="text"
                    placeholder="Enter a rule..."
                    value={rule}
                    onChange={(e) => {
                      const newRules = [...formData.rules];
                      newRules[index] = e.target.value;
                      setFormData({ ...formData, rules: newRules });
                    }}
                    className="bg-[#2a2a2a] border-[#343536] text-white placeholder-gray-500 rounded-l-none"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, rules: [...formData.rules, ""] })}
                className="text-blue-400 text-sm hover:text-blue-300 font-medium"
              >
                + Add Rule
              </button>
            </div>
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
              {loading ? "Creating..." : "Create Community"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
