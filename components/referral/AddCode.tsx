'use client'

import { addCode } from "@/features/referral/use-post-code"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"


const AddCode = ({ onSuccess }: { onSuccess?: () => void }) => {
    const mutation = addCode();
    const [referralCode, setReferralCode] = useState("");
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!referralCode.trim()) {
            return;
        }

        try {
            await mutation.mutateAsync({ code: referralCode });
            setReferralCode("");
            onSuccess?.();
        } catch (error) {
            console.error('Failed to add referral code:', error);
        }
    };

    return (
        <div className="space-y-4">
           
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="referralCode">Referral Code</Label>
                    <Input
                        id="referralCode"
                        type="text"
                        placeholder="Enter referral code"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        disabled={mutation.isPending}
                        className="uppercase"
                    />
                </div>
                <Button 
                    type="submit" 
                    className="w-full"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? "Adding..." : "Add Code"}
                </Button>
            </form>
        </div>
    )
}

export default AddCode