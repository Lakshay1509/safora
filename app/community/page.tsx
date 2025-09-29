'use client'
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Tabview from "./components/Tabview";
import Articles from "./components/Articles";
import Notification from "@/components/Notification";

const CommunityContent = () => {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'feed' ;

  return (
    <div className="pb-24 lg:pb-0">
      {view === 'feed' && <Tabview />}
      {view === 'article' && <Articles/>}
      {view==='notification' && <Notification/>}
    </div>
  );

}

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunityContent  />
    </Suspense>
  );
}

export default Page;