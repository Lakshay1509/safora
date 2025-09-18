'use client'
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Tabview from "./components/Tabview";
import Articles from "./components/Articles";

const CommunityContent = () => {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'feed';

  return (
    <>
      {view === 'feed' && <Tabview />}
      {view === 'article' && <Articles/>}
    </>
  );

}

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CommunityContent />
    </Suspense>
  );
}

export default Page;