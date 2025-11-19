//@ts-nocheck
'use client'

import { useGetLocationMetrics } from "@/features/location/use-get-location-metrics"
import { useParams } from "next/navigation";
import { Wind, Bus, Lightbulb, Wifi, Thermometer, Footprints, LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type MetricItemProps = {
    icon: LucideIcon;
    title: string;
    value: number | string;
    unit?: string;
    colorClass: string;
    maxValue?: number;
};

const MetricItem = ({ icon: Icon, title, value, unit, colorClass, maxValue = 10 }: MetricItemProps) => {
    return (
        <div className="flex items-center justify-between gap-4 py-3 mr-3">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${colorClass} flex-shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-[14px]  text-gray-700 dark:text-gray-300">{title} -</p>
            </div>
            <span className=" text-[14px]  text-gray-800 dark:text-gray-100">
                {value}{unit}
            </span>
        </div>
    );
};

const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-800'; // Hazardous
};

const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
};

const MetricsCard = () => {

    const params = useParams();
    const id = params.id as string
    const { data, isLoading } = useGetLocationMetrics(id);
    const { user, loading } = useAuth();

    if (isLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center space-y-6">
                <div className="text-center">
                    <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-pulse">
                        We're analyzing this location... give us a moment
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-200 dark:bg-gray-800 p-3 rounded-xl h-16 animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    

    if (!data) {
        return <div className="text-center py-8 text-gray-500">No metrics data available.</div>;
    }

    const metrics = data;

    const metricsData: MetricItemProps[] = [
        { icon: Wind, title: "Air Quality Index", value: metrics.AQI, colorClass: getAqiColor(metrics.AQI), maxValue: 500 },
        { icon: Thermometer, title: "Temp (Avg)", value: metrics.Temperature_C, unit: "°C", colorClass: "bg-blue-500", maxValue: 50 },
        { icon: Footprints, title: "Walkability", value: metrics.Walkability, unit: "/10", colorClass: getScoreColor(metrics.Walkability), maxValue: 10 },
        { icon: Bus, title: "Public Transport", value: metrics.Availability_of_Public_Transport, unit: "/10", colorClass: getScoreColor(metrics.Availability_of_Public_Transport), maxValue: 10 },
        { icon: Lightbulb, title: "Street Lighting ", value: metrics.Lighting_Quality, unit: "/10", colorClass: getScoreColor(metrics.Lighting_Quality), maxValue: 10 },
        { icon: Wifi, title: "Network", value: metrics.Network_Connectivity, unit: "/10", colorClass: getScoreColor(metrics.Network_Connectivity), maxValue: 10 },
    ];

    return (
        <>
            <div className="bg-white dark:bg-gray-900/50 p-6 rounded-xl shadow-sm min-h-75">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Additional Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 divide-y  dark:divide-gray-800">
                    {metricsData.map(metric => (
                        <MetricItem key={metric.title} {...metric} />
                    ))}
                </div>
            </div>
        </>
    )
}

export default MetricsCard