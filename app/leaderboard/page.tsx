'use client'

import { useGetleaderboard } from "@/features/referral/use-get-leaderboard"
import RightSidebar from "./RightSidebar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import ProfileLogo from "@/components/ProfileLogo";
import Link from "next/link";


const page = () => {

    const { data, isLoading, isError } = useGetleaderboard();

    const getMedal = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return rank;
        }
    }

    const formatPeriod = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const startDay = startDate.getDate();
        const endDay = endDate.getDate();
        const month = startDate.toLocaleDateString('en-US', { month: 'short' });
        return `(${startDay} ${month} to ${endDay} ${month})`;
    }



    return (
        <div className="flex flex-row justify-start w-full">
            <div className="flex-1 p-6">
                <div className="flex flex-col mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold">Leaderboard</h1>
                        {data && (
                            <div className="text-sm text-muted-foreground">
                                {formatPeriod(data.period.start, data.period.end)}
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                        Thank you to everyone who referred new members — your support helps our community grow! 🌟
                    </p>

                    {/* replaced the inline invite paragraph with a collapsible summary */}
                    <details className="mt-3 lg:hidden p-3 rounded-md border">
                        <summary className="cursor-pointer text-sm">Win Amazon gift card</summary>
                        <div className="mt-2 text-sm text-gray-600 leading-relaxed">
                            Invite your friends and climb the leaderboard! 🎯 The top referrer with at least
                            <span className="font-semibold text-gray-800"> 10 referrals</span> wins a
                            <span className="font-semibold text-gray-800"> ₹500 Amazon gift card</span>, and the
                            <span className="font-semibold text-gray-800"> top 3</span> earn our exclusive
                            <span className="text-blue-600 font-semibold"> Verified Badge</span>.
                            Get your referral code from your <span className="font-medium text-gray-800">Profile</span> section and start sharing today! 🚀
                        </div>
                    </details>
                    <div className="w-full flex justify-between items-center">
                    <Link href='/profile' className="mt-3 text-sm text-gray-600 lg:hidden">
                        Got a referral? 
                    </Link>
                    <Link href='/profile' className="mt-3 text-sm text-gray-600 lg:hidden">
                        Get your code
                    </Link>
                    </div>
                </div>


                {isLoading && <p>Loading...</p>}
                {isError && <p className="text-red-500">Failed to load leaderboard</p>}

                {data && (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30px] text-center">Rank</TableHead>
                                    <TableHead className="w-[80px]">Name</TableHead>
                                    <TableHead className="w-[50px] text-center">Referrals</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.data.map((user, index) => (
                                    <TableRow key={user.user_id}>
                                        <TableCell className="font-medium text-2xl text-center">
                                            {getMedal(index + 1)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-row space-x-2 items-center">
                                                <ProfileLogo
                                                    url={user.url}
                                                    name={user.name}
                                                    color=""
                                                    size="30"

                                                />
                                                <div>{user.name}</div>
                                            </div>

                                        </TableCell>
                                        <TableCell className="text-center">{user.referral_count}</TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            <aside className="hidden lg:block w-80 flex-shrink-0 p-4">
                <div className="sticky top-4">
                    <RightSidebar />
                </div>
            </aside>
        </div>

    )
}

export default page