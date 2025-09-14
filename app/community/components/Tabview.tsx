"use client"
import React, { useState, useEffect } from 'react'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Posts } from './Posts'
import { Following } from './Following'
import { useAuth } from '@/contexts/AuthContext'
import RightSidebar from './RightSidebar'

const Tabview = () => {
    const [view, setView] = useState<string>("recent")
    const {user,loading} = useAuth();

    useEffect(() => {
        if (!user) {
            setView("recent");
        }
    }, [user]);
    
    return (
        <div className='flex'>
            <div className='flex-1'>
                <div className='max-w-4xl flex justify-end px-8 font-semibold'>
                    <ToggleGroup 
                        type="single" 
                        value={view} 
                        onValueChange={(value) => value && setView(value)}
                        className="gap-1"
                    >
                        <ToggleGroupItem 
                            value="recent" 
                            aria-label="Recent"
                            className="data-[state=on]:bg-[#FF3130] data-[state=on]:text-white hover:bg-blue-100"
                        >
                            Recent
                        </ToggleGroupItem>
                        {user && <ToggleGroupItem 
                            value="following" 
                            aria-label="Following"
                            className="data-[state=on]:bg-[#FF3130] data-[state=on]:text-white hover:bg-blue-100 px-4"
                        >
                            Following
                        </ToggleGroupItem>}
                    </ToggleGroup>
                </div>

                {view === 'recent' && <Posts/>}
                {view === 'following' && <Following/>}
            </div>
            <div className="hidden lg:block w-80 p-4">
                <RightSidebar/>
            </div>
        </div>
    )
}

export default Tabview
