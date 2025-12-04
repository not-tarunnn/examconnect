import { Suspense } from "react";
import GroupJoinPage from "./GroupJoinPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <GroupJoinPage />
    </Suspense>
  );
}
