"use client";

import AddCode from "@/components/referral/AddCode";
import GetCodePopover from "@/components/referral/GetCodePopover";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Gift, Plus } from "lucide-react";
import { useState } from "react";
import Extra from "./extra";

const RightSidebar = () => {
  const [addCodeDialogOpen, setAddCodeDialogOpen] = useState<boolean>(false);
  return (
    <div className="fixed right-0 top-0 h-[90vh] w-80 bg-white border-l border-t border-r rounded-xl border-gray-200 mt-24 py-8 px-6 hidden lg:block overflow-y-auto shadow-sm">
      <h1 className="text-xl font-bold mb-4 text-gray-800">🏆 This Month's Prizes</h1>

      <div className="space-y-8 mt-10 text-sm text-gray-600">
        <p>
          💰 <span className="font-semibold text-gray-800">₹500 Amazon gift card</span> for the top referral — must have at least{" "}
          <span className="font-semibold">10 referees</span>.
        </p>

        <p>
          🥇 <span className="font-semibold text-gray-800">Top 3 referrers</span> also earn our special{" "}
          <span className="text-blue-600 font-semibold">Verified Badge</span> .
        </p>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          Keep inviting friends and climb the leaderboard — rewards await! 🚀
        </div>
      </div>

      <Extra/>
    </div>
  );
};

export default RightSidebar;
