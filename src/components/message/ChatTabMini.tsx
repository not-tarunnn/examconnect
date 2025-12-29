"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { rtdb, db } from "@/lib/firebase";
import {
  onChildAdded,
  push,
  ref,
  set,
  onValue,
  remove,
  get,
  update,
} from "firebase/database";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import ChatHeader from "./ChatHeader";
import GroupHeader from "./GroupHeader";
import AddGroupMembersModal from "@/components/message/AddGroupMembersModal";
import { useChatStore } from "@/store/useChatStore";
import useAuth from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Send, Check, CheckCheck, MoreVertical } from "lucide-react";
import AttachmentPicker from "@/components/message/AttachmentPicker";
import Link from "next/link";

type ChatTabProps = {
  compact?: boolean; // when true, render compact mini messenger styling
};

export default function ChatTabMini({ compact = true }: ChatTabProps) {
  const { user } = useAuth();
  const { selectedUser, selectedGroup } = useChatStore();

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isGroup = Boolean(selectedGroup?.groupId);
  const groupId = selectedGroup?.groupId || null;
  const typingSetRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanedRef = useRef(false);

  // Attachment staging before sending
  const [attachments, setAttachments] = useState<
    Array<{ base64: string; mime: string; filename: string; previewUrl: string }>
  >([]);
  const addAttachment = (base64: string, mime: string, filename: string) => {
    const previewUrl = `data:${mime};base64,${base64}`;
    setAttachments((prev) => [...prev, { base64, mime, filename, previewUrl }]);
  };
  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const [lastActiveSelf, setLastActiveSelf] = useState<number>(0);
  const [lastActiveOther, setLastActiveOther] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());
  const [myDisplayName, setMyDisplayName] = useState<string>("");
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});
  const [memberInfo, setMemberInfo] = useState<Record<string, { name: string; username: string; profilePic?: string | null }>>({});
  const [memberStates, setMemberStates] = useState<Record<string, { muted: boolean; role?: string }>>({});
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [memberUids, setMemberUids] = useState<string[]>([]);

  const OFFLINE_THRESHOLD_MS = Number.POSITIVE_INFINITY;

  const chatId =
    !isGroup && user?.uid && selectedUser?.uid
      ? user.uid < selectedUser.uid
        ? `${user.uid}_${selectedUser.uid}`
        : `${selectedUser.uid}_${user.uid}`
      : null;

  // Fetch my display name
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      const d: any = snap.data();
      setMyDisplayName(d?.fullName || d?.username || user.displayName || "Me");
      setLastActiveSelf(d?.lastActive?.toMillis ? d.lastActive.toMillis() : 0);
    });
    return () => unsub();
  }, [user?.uid]);

  // For group: load members list and names + admin state
  useEffect(() => {
    if (!isGroup || !groupId) return;
    const membersRef = ref(rtdb, `chats/${groupId}/members`);
    const adminsRef = ref(rtdb, `chats/${groupId}/admins`);

    const unsubMembers = onValue(membersRef, async (snap) => {
      const members = snap.val() || {};
      const uids = Object.keys(members);
      setMemberUids(uids);
      const names: Record<string, string> = {};
      const info: Record<string, { name: string; username: string; profilePic?: string | null }> = {};
      const states: Record<string, { muted: boolean; role?: string }> = {};
      await Promise.all(
        uids.map(async (uid) => {
          const state = members[uid] || {};
          states[uid] = { muted: !!state.muted, role: state.role };
          try {
            const s = await getDoc(doc(db, "users", uid));
            const d: any = s.data() || {};
            const nm = d.fullName || d.username || uid;
            names[uid] = nm;
            info[uid] = { name: nm, username: d.username || "", profilePic: d.profilePic || d.profilePicture || null };
          } catch (_) {
            names[uid] = uid;
            info[uid] = { name: uid, username: "", profilePic: null };
          }
        })
      );
      setMemberNames(names);
      setMemberInfo(info);
      setMemberStates(states);
    });

    const unsubAdmins = onValue(adminsRef, (snap) => {
      const admins = snap.val() || {};
      setIsAdmin(!!(user?.uid && admins[user.uid]));
    });

    return () => { unsubMembers(); unsubAdmins(); };
  }, [isGroup, groupId, user?.uid]);

  // Typing refs
  const typingRef = useMemo(() => {
    if (!user) return null;
    if (isGroup && groupId) return ref(rtdb, `groupMessages/${groupId}/typing/${user.uid}`);
    if (chatId) return ref(rtdb, `messages/${chatId}/typing/${user.uid}`);
    return null;
  }, [user, isGroup, groupId, chatId]);

  const otherTypingRef = useMemo(() => {
    if (isGroup) return null;
    if (selectedUser && chatId) return ref(rtdb, `messages/${chatId}/typing/${selectedUser.uid}`);
    return null;
  }, [isGroup, selectedUser, chatId]);

  const groupTypingRootRef = useMemo(() => {
    if (!isGroup || !groupId) return null;
    return ref(rtdb, `groupMessages/${groupId}/typing`);
  }, [isGroup, groupId]);

  // Subscribe to messages
  useEffect(() => {
    const path = isGroup && groupId ? `groupMessages/${groupId}` : chatId ? `messages/${chatId}` : null;
    if (!path) return;
    const messagesRef = ref(rtdb, path);
    setMessages([]);

    // ensure participants include me
    if (user?.uid) {
      set(ref(rtdb, `${path}/participants/${user.uid}`), true).catch(() => {});
    }
    if (!isGroup && selectedUser?.uid && user?.uid) {
      set(ref(rtdb, `${path}/participants/${selectedUser.uid}`), true).catch(() => {});
    }

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const key = snapshot.key;
      if (!key || key === "typing" || key === "participants" || key === "lastMessageAt") return;
      setMessages((prev) => [...prev, snapshot.val()]);
    });
    return () => unsubscribe();
  }, [isGroup, groupId, chatId, selectedUser?.uid, user?.uid]);

  // Mark all messages in this chat as read by current user when opening the chat
  useEffect(() => {
    const path = isGroup && groupId ? `groupMessages/${groupId}` : chatId ? `messages/${chatId}` : null;
    if (!path || !user?.uid) return;
    const markRead = async () => {
      try {
        const snap = await get(ref(rtdb, path));
        if (!snap.exists()) return;
        const updates: any = {};
        snap.forEach((child) => {
          const key = child.key;
          if (!key) return;
          if (key === "typing" || key === "participants" || key === "lastMessageAt") return;
          const val = child.val() || {};
          if (!(val.readBy && val.readBy[user.uid])) {
            updates[`${path}/${key}/readBy/${user.uid}`] = true;
          }
          // store name in seenBy for groups
          if (isGroup) {
            updates[`${path}/${key}/seenBy/${user.uid}`] = myDisplayName || user.uid;
          }
        });
        if (Object.keys(updates).length) {
          await update(ref(rtdb), updates);
        }
      } catch (_) {}
    };
    void markRead();
  }, [isGroup, groupId, chatId, user?.uid, myDisplayName]);

  // Typing subscriptions
  useEffect(() => {
    if (!otherTypingRef) return;
    const unsubscribeTyping = onValue(otherTypingRef, (snapshot) => {
      setOtherTyping(Boolean(snapshot.val()));
    });
    return () => unsubscribeTyping();
  }, [otherTypingRef]);

  useEffect(() => {
    if (!groupTypingRootRef || !user?.uid) return;
    const unsub = onValue(groupTypingRootRef, (snap) => {
      const val = snap.val() || {};
      const names: string[] = [];
      Object.keys(val).forEach((uid) => {
        if (uid === user.uid) return;
        const display = typeof val[uid] === "string" ? val[uid] : (memberNames[uid] || uid);
        if (display) names.push(display);
      });
      setTypingNames(names);
    });
    return () => unsub();
  }, [groupTypingRootRef, user?.uid, memberNames]);

  // Clear typing on blur or visibility change
  useEffect(() => {
    if (!typingRef) return;
    const clearTyping = () => {
      typingSetRef.current = false;
      remove(typingRef);
    };
    const onVisibility = () => {
      if (document.visibilityState !== "visible") clearTyping();
    };
    window.addEventListener("blur", clearTyping);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", clearTyping);
      document.removeEventListener("visibilitychange", onVisibility);
      clearTyping();
    };
  }, [typingRef]);

  // Write typing state when input changes
  useEffect(() => {
    if (!typingRef) return;
    const ensureRemove = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      remove(typingRef);
      typingSetRef.current = false;
    };
    if (input.length > 0) {
      if (!typingSetRef.current) {
        const val = isGroup ? (myDisplayName || "Typing") : true;
        set(typingRef, val as any).catch(() => {});
        typingSetRef.current = true;
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(ensureRemove, 2000);
    } else {
      ensureRemove();
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [input, typingRef, isGroup, myDisplayName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      const data: any = snap.data();
      setLastActiveSelf(
        data?.lastActive?.toMillis ? data.lastActive.toMillis() : 0
      );
    });
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (!selectedUser?.uid) return;
    const unsub = onSnapshot(doc(db, "users", selectedUser.uid), (snap) => {
      const data: any = snap.data();
      setLastActiveOther(
        data?.lastActive?.toMillis ? data.lastActive.toMillis() : 0
      );
    });
    return () => unsub();
  }, [selectedUser?.uid]);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!chatId) return;
    if (!lastActiveSelf && !lastActiveOther) return;
    const selfOffline = lastActiveSelf
      ? now - lastActiveSelf > OFFLINE_THRESHOLD_MS
      : false;
    const otherOffline = lastActiveOther
      ? now - lastActiveOther > OFFLINE_THRESHOLD_MS
      : false;
    if (selfOffline || otherOffline) {
      if (cleanedRef.current) return;
      cleanedRef.current = true;
      const doCleanup = async () => {
        try {
          const [typingSnap, participantsSnap, lastAtSnap] = await Promise.all([
            get(ref(rtdb, `messages/${chatId}/typing`)),
            get(ref(rtdb, `messages/${chatId}/participants`)),
            get(ref(rtdb, `messages/${chatId}/lastMessageAt`)),
          ]);
          await remove(ref(rtdb, `messages/${chatId}`));
          const updates: any = {};
          if (typingSnap.exists()) updates["typing"] = typingSnap.val();
          if (participantsSnap.exists()) updates["participants"] =
            participantsSnap.val();
          if (lastAtSnap.exists()) updates["lastMessageAt"] = lastAtSnap.val();
          if (Object.keys(updates).length)
            await update(ref(rtdb, `messages/${chatId}`), updates);
          setMessages([]);
        } catch (_) {}
      };
      void doCleanup();
    } else {
      cleanedRef.current = false;
    }
  }, [now, lastActiveSelf, lastActiveOther, chatId]);

  useEffect(() => {
    if (!chatId || !user) return;
    remove(ref(rtdb, `typing/${chatId}/${user.uid}`)).catch(() => {});
  }, [chatId, user?.uid]);

  const formatHHMM = (ts: any): string => {
    const ms =
      typeof ts === "number"
        ? ts
        : typeof ts === "string"
        ? parseInt(ts, 10)
        : ts?.toMillis
        ? ts.toMillis()
        : NaN;
    if (!Number.isFinite(ms)) return "";
    const d = new Date(ms);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const getReadStatusDM = (msg: any): "none" | "single" | "double" => {
    const rb = (msg && msg.readBy) || {};
    const hasMe = user?.uid ? Boolean(rb[user.uid]) : false;
    const hasOther = selectedUser?.uid ? Boolean(rb[selectedUser.uid]) : false;
    const count = (hasMe ? 1 : 0) + (hasOther ? 1 : 0);
    if (count >= 2) return "double";
    if (count >= 1) return "single";
    return "none";
  };

  const getReadStatusGroup = (msg: any): "none" | "single" | "double" => {
    const rb = (msg && msg.readBy) || {};
    const memberCount = memberUids.length || 0;
    let seenCount = 0;
    memberUids.forEach((uid) => {
      if (rb[uid]) seenCount += 1;
    });
    if (memberCount > 0 && seenCount >= memberCount) return "double";
    if (seenCount > 0) return "single";
    return "none";
  };

  const getReadStatus = (msg: any) => (isGroup ? getReadStatusGroup(msg) : getReadStatusDM(msg));

  const textElsRef = useRef<Map<number, HTMLElement>>(new Map());
  const [singleLineMap, setSingleLineMap] = useState<Record<number, boolean>>(
    {}
  );
// Helper to detect if a message contains only emojis (and whitespace)
  const isEmojiOnly = (text: string): boolean => {
    if (!text || !text.trim()) return false;
    // Remove all emojis and whitespace, if anything remains, it's not emoji-only
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji})/gu;
    const withoutEmojis = text.replace(emojiRegex, "").trim();
    return withoutEmojis.length === 0 && text.trim().length > 0;
  };

  // Get emoji font size based on count
  const getEmojiFontSize = (text: string): string => {
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji})/gu;
    const emojiMatches = text.match(emojiRegex) || [];
    const count = emojiMatches.length;
    if (count === 1) return "text-6xl";
    if (count <= 3) return "text-5xl";
    return "text-4xl";
  };
  // Store refs without causing re-renders
  const measureTextEl = (index: number, el: HTMLElement | null) => {
    if (!el) return;
    textElsRef.current.set(index, el);
  };
  
const inputRef = useRef<HTMLInputElement | null>(null);

  // Measure all elements *after* render (not during); recalc on messages change and on resize
  useEffect(() => {
    const recalc = () => {
      const newMap: Record<number, boolean> = {};
      textElsRef.current.forEach((el, idx) => {
        const style = window.getComputedStyle(el);
        const lineHeight = parseFloat(style.lineHeight || "16");
        newMap[idx] = el.scrollHeight <= lineHeight * 1.5;
      });
      setSingleLineMap((prev) => {
        const prevKeys = Object.keys(prev);
        const newKeys = Object.keys(newMap);
        if (prevKeys.length === newKeys.length) {
          const same = Object.entries(newMap).every(([k, v]) => prev[k as any] === v);
          if (same) return prev;
        }
        return newMap;
      });
    };

    // run once after render so refs are populated
    recalc();

    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [messages]);

 const sendMessage = async () => {
  if (!user) return;
  const path = isGroup && groupId ? `groupMessages/${groupId}` : chatId ? `messages/${chatId}` : null;
  if (!path) return;

  const hasText = Boolean(input.trim());
  const hasAttachments = attachments.length > 0;
  if (!hasText && !hasAttachments) return;

  const messagesRef = ref(rtdb, path);
  try {
    for (const att of attachments) {
      await push(messagesRef, {
        image: true,
        data: att.base64,
        mime: att.mime,
        filename: att.filename,
        sender: user.uid,
        senderName: myDisplayName || user.uid,
        timestamp: Date.now(),
        readBy: { [user.uid]: true },
        ...(isGroup ? { seenBy: { [user.uid]: myDisplayName || user.uid } } : {}),
      });
    }
    if (hasText) {
      await push(messagesRef, {
        text: input.trim(),
        sender: user.uid,
        senderName: myDisplayName || user.uid,
        timestamp: Date.now(),
        readBy: { [user.uid]: true },
        ...(isGroup ? { seenBy: { [user.uid]: myDisplayName || user.uid } } : {}),
      });
    }
    await update(messagesRef, { lastMessageAt: Date.now() }).catch(() => {});
    await set(ref(rtdb, `${path}/participants/${user.uid}`), true).catch(() => {});
    if (!isGroup && selectedUser?.uid) {
      await set(ref(rtdb, `${path}/participants/${selectedUser.uid}`), true).catch(() => {});
    }
  } catch (_) {}

  if (typingRef) {
    remove(typingRef);
    typingSetRef.current = false;
  }
  setAttachments([]);
  setInput("");
  inputRef.current?.focus();
};


  if (!user || (!selectedUser && !selectedGroup)) {
    return (
      <div className={`flex flex-1 items-center justify-center text-gray-400 ${compact ? "w-[320px] h-[500px]" : ""}`}>
        Select a chat to start messaging.
      </div>
    );
  }


// ✅ Unified responsive styles
const containerWidth = compact ? "max-w-[380px] w-full" : "w-full";
const containerHeight = compact ? "max-h-[520px] h-full" : "h-full";

const messageMaxWidth = compact ? "max-w-[80%]" : "max-w-[75%]";
const bubbleTextClass = compact ? "text-[13px]" : "text-[14px]";
const timeTextClass = compact ? "text-[10px]" : "text-[11px]";

const inputPadding = compact ? "py-2.5 px-3" : "py-3 px-4";
const inputFontSize = compact ? "text-[13px]" : "text-[14px]";
const attachmentThumbSize = compact ? "w-10 h-10" : "w-12 h-12";


  // --- UI merged from modern version ---
  return (
    <div
      className={`flex flex-col overflow-hidden bg-transparent backdrop-blur-xl relative ${containerWidth} ${containerHeight}`}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={async (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files || []);
        for (const file of files) {
          if (!file.type.startsWith("image/")) continue;
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const comma = result.indexOf(",");
              resolve(comma >= 0 ? result.slice(comma + 1) : result);
            };
            reader.readAsDataURL(file);
          });
          addAttachment(base64, file.type || "image/png", file.name || "image");
        }
      }}
      style={compact ? { borderRadius: 18 } : undefined}
    >
      {isGroup && groupId && selectedGroup ? (
        <GroupHeader
          groupId={groupId}
          name={selectedGroup.name}
          iconBase64={selectedGroup.iconBase64 || null}
          iconMime={selectedGroup.iconMime || null}
          onInfoAction={() => setGroupInfoOpen(true)}
          onAddAction={() => setAddMembersOpen(true)}
        />
      ) : selectedUser ? (
        <ChatHeader user={selectedUser} currentUserId={user.uid} />
      ) : null}

      {/* Messages */}
      <div
        className={`flex-1 overflow-y-auto px-3 ${compact ? "pt-2 pb-20" : "pt-3 pb-20"} space-y-3 scrollbar-thin scrollbar-thumb-gray-700`}
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.16 }}
              className={`flex ${msg.sender === user.uid ? "justify-end" : "justify-start"}`}
            >
              <div className={messageMaxWidth}>
                {isGroup && msg.sender !== user.uid && (
                  <div className="text-[10px] text-zinc-400 mb-0.5 ml-1">
                    {memberNames[msg.sender] || msg.sender}
                  </div>
                )}
                {msg && msg.data && msg.mime ? (
                  <div className="relative inline-block">
                    <img
                      src={`data:${msg.mime};base64,${msg.data}`}
                      alt={msg.filename || "image"}
                      className="rounded-md w-full h-auto"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                      <span>{formatHHMM(msg.timestamp)}</span>
                      {getReadStatus(msg) === "double" ? (
                        <CheckCheck size={12} className="opacity-80" />
                      ) : getReadStatus(msg) === "single" ? (
                        <Check size={12} className="opacity-80" />
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`px-3 py-2 rounded-2xl shadow-sm ${bubbleTextClass} inline-block ${
                      msg.sender === user.uid
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-[#1e1e1e] text-gray-200 rounded-bl-md"
                    }`}
                  >
                    {singleLineMap[index] ? (
                      <div className="inline-flex items-baseline gap-2">
                        <span
                          ref={(el) => measureTextEl(index, el)}
                          className="whitespace-pre-wrap break-words"
                        >
                          {msg.text}
                        </span>
                        <span className={`relative top-[2px] ${timeTextClass} ${msg.sender === user.uid ? "text-white/80" : "text-zinc-400"} inline-flex items-center`}>
                          <span>{formatHHMM(msg.timestamp)}</span>
                          {getReadStatus(msg) === "double" ? (
                            <CheckCheck size={12} className="ml-1 opacity-80" />
                          ) : getReadStatus(msg) === "single" ? (
                            <Check size={12} className="ml-1 opacity-80" />
                          ) : null}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div
                          ref={(el) => measureTextEl(index, el)}
                          className="whitespace-pre-wrap break-words"
                        >
                          {msg.text}
                        </div>
                        <div
                          className={`mt-1 ${timeTextClass} ${
                            msg.sender === user.uid ? "text-white/80" : "text-zinc-400"
                          } text-right inline-flex items-center justify-end gap-1`}
                        >
                          <span>{formatHHMM(msg.timestamp)}</span>
                          {getReadStatus(msg) === "double" ? (
                            <CheckCheck size={12} className="opacity-80" />
                          ) : getReadStatus(msg) === "single" ? (
                            <Check size={12} className="opacity-80" />
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`absolute left-1/2 -translate-x-1/2 bottom-4 ${compact ? "w-[92%]" : "w-[min(900px,92%)]"} max-w-3xl pointer-events-auto`}>
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="mx-auto"
          >
            <div className="relative">
              <AnimatePresence>
                {isGroup ? (
                  typingNames.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute -top-8 left-4"
                    >
                      <div className="inline-flex items-center gap-2 text-xs text-gray-300 bg-[#202020]/70 border border-gray-700 rounded-full px-3 py-1 backdrop-blur">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                        </span>
                        <span>
                          {typingNames.slice(0, 3).join(", ")}
                          {typingNames.length > 3 ? ` +${typingNames.length - 3}` : ""}
                          {typingNames.length === 1 ? " is typing…" : " are typing…"}
                        </span>
                      </div>
                    </motion.div>
                  )
                ) : (
                  otherTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute -top-8 left-4"
                    >
                      <div className="inline-flex items-center gap-2 text-xs text-gray-300 bg-[#202020]/70 border border-gray-700 rounded-full px-3 py-1 backdrop-blur">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                        </span>
                        <span>Typing…</span>
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
              <div
                className={`flex items-center gap-3 ${inputPadding} rounded-full shadow-lg border border-white/10 bg-transparent backdrop-blur-3xl`}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files || []);
                  for (const file of files) {
                    if (!file.type.startsWith("image/")) continue;
                    const base64 = await new Promise<string>((resolve) => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = reader.result as string;
                        const comma = result.indexOf(",");
                        resolve(comma >= 0 ? result.slice(comma + 1) : result);
                      };
                      reader.readAsDataURL(file);
                    });
                    addAttachment(base64, file.type || "image/png", file.name || "image");
                  }
                }}
              >
                <button aria-label="Emoji" className="p-1 rounded-full hover:bg-white/5">
                  <Smile size={compact ? 16 : 18} />
                </button>

                {attachments.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto max-w-[50%] py-1 pr-1">
                    {attachments.map((att, i) => (
                      <div key={i} className="relative">
                        <img src={att.previewUrl} alt={att.filename} className={`${attachmentThumbSize} rounded-md object-cover border border-white/10`} />
                        <button
                          onClick={() => removeAttachment(i)}
                          className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black/70 text-white text-[10px] leading-5 text-center"
                          aria-label="Remove attachment"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder="Message"
                  className={`flex-1 bg-transparent outline-none text-zinc-100 placeholder-zinc-400 ${inputFontSize}`}
                />
                <AttachmentPicker onUploadAction={(base64: string, mime: string, filename: string) => {
                  addAttachment(base64, mime, filename);
                }} />
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={sendMessage}
                  aria-label="Send"
                  className={`-ml-2 inline-flex items-center gap-2 rounded-full px-3 py-1 ${compact ? "bg-indigo-600/95" : "bg-indigo-600"} hover:bg-indigo-700 text-white text-sm`}
                >
                  <Send size={14} />
                  
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {isGroup && groupInfoOpen && groupId && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-0 h-full w-[320px] bg-[#181818] border-l border-white/10 shadow-xl flex flex-col z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="font-semibold">Group info</div>
            <button onClick={() => setGroupInfoOpen(false)} className="text-sm text-zinc-300 hover:text-white">Close</button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto">
            <GroupDescription groupId={groupId} />
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Members</div>
              <div className="space-y-2">
                {memberUids.map((uid) => {
                  const info = memberInfo[uid];
                  const name = info?.name || memberNames[uid] || uid;
                  const username = info?.username || "";
                  const muted = !!memberStates[uid]?.muted;
                  const profileLink = username ? `/profile/${encodeURIComponent(username)}` : "#";
                  return (
                    <div key={uid} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                      {info?.profilePic ? (
                        <img src={info.profilePic} alt={name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link href={profileLink} className="text-sm text-white hover:underline truncate">{name}</Link>
                        {username && <div className="text-xs text-zinc-400 truncate">@{username}</div>}
                      </div>
                      {isAdmin && uid !== user?.uid && (
                        <button
                          onClick={async () => {
                            try {
                              await set(ref(rtdb, `chats/${groupId}/members/${uid}/muted`), !muted);
                              setMemberStates((s) => ({ ...s, [uid]: { ...s[uid], muted: !muted } }));
                            } catch (_) {}
                          }}
                          className={`text-xs px-2 py-1 rounded border ${muted ? "border-green-500 text-green-400" : "border-zinc-500 text-zinc-300"}`}
                        >
                          {muted ? "Unmute" : "Mute"}
                        </button>
                      )}
                      <Link href={profileLink} className="p-1.5 rounded-lg hover:bg-white/10" aria-label="More actions">
                        <MoreVertical size={16} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.aside>
      )}

      <AddGroupMembersModal
        open={!!(isGroup && addMembersOpen && groupId)}
        onOpenChangeAction={setAddMembersOpen}
        groupId={groupId || ""}
        currentUid={user?.uid || null}
        existingMemberUids={memberUids}
      />
    </div>
  );
}

function GroupDescription({ groupId }: { groupId: string }) {
  const [desc, setDesc] = useState<string>("");
  useEffect(() => {
    const infoRef = ref(rtdb, `chats/${groupId}/description`);
    const unsub = onValue(infoRef, (snap) => setDesc(snap.val() || ""));
    return () => unsub();
  }, [groupId]);
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-zinc-400 mb-1">Description</div>
      <div className="text-sm text-zinc-200 whitespace-pre-wrap break-words bg-white/5 border border-white/10 rounded-lg p-3 min-h-[44px]">
        {desc || "No description"}
      </div>
    </div>
  );
}
