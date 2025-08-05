"use client";

 interface ChatHeaderProps {
  user: {
    fullName: string;
    username: string;
    profilePic?: string;
    uid: string;
  };
  currentUserId: string;
}

export default function ChatHeader({ user }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-[#181818]">
      <img
        src={user.profilePic || "/avatar.png"}
        alt={user.username}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div>
        <p className="font-medium text-white">{user.fullName}</p>
        <p className="text-sm text-gray-400">@{user.username}</p>
      </div>
    </div>
  );
}
