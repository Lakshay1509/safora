"use client";

import { useState } from "react";
import { CommentsCard } from "./comments-card";
import Posts from "./Posts";
import { MessageSquare, FileText } from "lucide-react";

const TabView = () => {
  const [activeTab, setActiveTab] = useState<"comments" | "posts">("posts");

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("comments")}
          className={`flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium transition-colors duration-200 ${
            activeTab === "comments"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Comments
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center justify-center gap-2 py-3 px-6 text-sm font-medium transition-colors duration-200 ${
            activeTab === "posts"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          <FileText className="w-4 h-4" />
          Posts
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "comments" ? <CommentsCard /> : <Posts />}
      </div>
    </div>
  );
};

export default TabView;
