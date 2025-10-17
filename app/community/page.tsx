import { Suspense } from "react";
import Tabview from "./components/Tabview";
import Articles from "./components/Articles";
import Notification from "@/components/Notification";

interface PageProps {
  searchParams: Promise<{ view?: string }>
}

const Page = async ({ searchParams }: PageProps) => {
  const resolvedSearchParams = await searchParams;
  const view = resolvedSearchParams.view || 'feed';

  return (
    <div className="pb-24 lg:pb-0">
      <Suspense fallback={<div>Loading...</div>}>
        {view === 'feed' && <Tabview />}
        {view === 'article' && <Articles/>}
        {view === 'notification' && <Notification/>}
      </Suspense>
    </div>
  );
}

export default Page;