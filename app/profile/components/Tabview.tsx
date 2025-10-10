"use client";

import { useState } from "react";
import { MessageSquare, FileText } from "lucide-react";

interface ProfileTabViewProps {
  commentsContent: React.ReactNode;
  postsContent: React.ReactNode;
  followingContent : React.ReactNode;
}

export function ProfileTabView({ commentsContent, postsContent, followingContent }: ProfileTabViewProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "posts" | "following">("posts");

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("posts")}
            className={`
              flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === "posts"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <FileText className="w-5 h-5" />
            <span>Posts</span>
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`
              flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === "comments"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Comments</span>
          </button>
          
          {/* <button
            onClick={() => setActiveTab("following")}
            className={`
              flex items-center gap-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === "following"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            <FileText className="w-5 h-5" />
            <span>Following</span>
          </button> */}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "comments" && commentsContent}
        {activeTab === "posts" && postsContent}
        {activeTab === "following" && followingContent}
      </div>
    </div>
  );
}