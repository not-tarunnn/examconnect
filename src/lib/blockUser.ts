import { ref, set, remove, get } from "firebase/database";
import { rtdb } from "./firebase";

/**
 * Block a user by saving the block entry in Realtime Database
 * @param blockerId - UID of the user performing the block
 * @param blockedId - UID of the user to be blocked
 */
export const blockUser = async (blockerId: string, blockedId: string) => {
  const blockRef = ref(rtdb, `blockedUsers/${blockerId}/${blockedId}`);
  await set(blockRef, true);
};

/**
 * Unblock a previously blocked user
 * @param blockerId - UID of the user performing the unblock
 * @param blockedId - UID of the user to be unblocked
 */
export const unblockUser = async (blockerId: string, blockedId: string) => {
  const blockRef = ref(rtdb, `blockedUsers/${blockerId}/${blockedId}`);
  await remove(blockRef);
};

/**
 * Check if a user has blocked another user
 * @param blockerId - UID of the blocking user
 * @param blockedId - UID of the potentially blocked user
 * @returns boolean - true if blocked, false otherwise
 */
export const isBlocked = async (blockerId: string, blockedId: string): Promise<boolean> => {
  const blockRef = ref(rtdb, `blockedUsers/${blockerId}/${blockedId}`);
  const snapshot = await get(blockRef);
  return snapshot.exists();
};
