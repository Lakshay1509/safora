'use client'
import AddCode from "@/components/referral/AddCode";
import GetCodePopover from "@/components/referral/GetCodePopover";
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Gift, Plus } from "lucide-react";
import { useState } from "react";

const Extra = () => {
     const [addCodeDialogOpen, setAddCodeDialogOpen] = useState<boolean>(false);
  return (
    <div className="mt-6  flex flex-col justify-start items-center gap-3">
          {/* Get Referral Code Button */}
          <GetCodePopover>
            <Button variant="outline" className="w-full ">
              <Gift className="w-4 h-4 mr-2" />
              Get Referral Code
            </Button>
          </GetCodePopover>

          {/* Add Referral Code Button */}
          <Dialog open={addCodeDialogOpen} onOpenChange={setAddCodeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full ">
                <Plus className="w-4 h-4 mr-2" />
                Add Referral Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                
              </DialogHeader>
              <AddCode onSuccess={() => setAddCodeDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
  )
}

export default Extra