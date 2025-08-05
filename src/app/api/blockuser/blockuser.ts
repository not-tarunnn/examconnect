// /pages/api/blockUser.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { rtdb } from "@/lib/firebase";
import { ref, set, remove } from "firebase/database";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { currentUserId, targetUserId, block } = JSON.parse(req.body);

  try {
    const blockRef = ref(rtdb, `blockedUsers/${currentUserId}/${targetUserId}`);

    if (block) {
      await set(blockRef, true);
    } else {
      await remove(blockRef);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
}
