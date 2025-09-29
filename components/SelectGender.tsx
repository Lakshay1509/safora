"use client"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useUpdateUserGender } from "@/features/user/use-update-user-gender";
import { useRouter } from "next/navigation";
interface Props{
    DialogOpen: boolean,
    onClose?: () => void,
}

const SelectGender = ({DialogOpen, onClose}:Props) => {
    const router  = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(DialogOpen);
    const [selectedGender, setSelectedGender] = useState<"male" | "female" | "other">("male");
    
    const { mutate, isPending } = useUpdateUserGender();
    
    // Update state when prop changes
    useEffect(() => {
        setIsDialogOpen(DialogOpen);
    }, [DialogOpen]);
    
    const handleSubmit = () => {
        if (selectedGender) {
           
            mutate({ gender: selectedGender }, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    if (onClose) onClose();
                    router.push('/community')

                },
                onError:(err)=>{
                    setIsDialogOpen(true);
                    console.error("Gender update error:", err);
                }
            });
        }
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open && onClose) onClose();
    };
    
    return (
        <AlertDialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <AlertDialogContent className="bg-white border border-gray-200 text-gray-900">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900 font-semibold">Please select gender</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Please select your gender. This helps us maintain platform integrity. Your choice will remain private and cannot be changed later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="my-4">
                <Select value={selectedGender} onValueChange={(value) => setSelectedGender(value as "male" | "female" | "other")}>
                  <SelectTrigger className="w-full focus:ring-2 focus:ring-red-500">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                
              </div>
              
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleSubmit}
                  disabled={!selectedGender || isPending}
                  className="bg-green-500 hover:bg-green-600 text-white disabled:bg-red-300"
                >
                  {isPending ? "Submitting..." : "Submit"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
    )
}

export default SelectGender