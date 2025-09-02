import { Suspense } from "react";
import MessagesPageClient from "./MessagesPageClient";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading chat...</div>}>
      <MessagesPageClient />
    </Suspense>
  );
}
