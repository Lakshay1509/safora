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
};

const MetricItem = ({ icon: Icon, title, value, unit, colorClass }: MetricItemProps) => (
    <div className="bg-white dark:bg-gray-900/50 p-3 rounded-xl shadow-sm flex items-center space-x-3">
        <div className={`p-1.5 rounded-lg ${colorClass}`}>
            <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-base lg:text-xl font-semibold text-gray-800 dark:text-gray-100">{value}{unit && <span className="text-base">{unit}</span>}</p>
        </div>
    </div>
);

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

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-200 dark:bg-gray-800 p-3 rounded-xl h-12 animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="relative">
                {/* Blurred Content */}
                <div className="blur-sm pointer-events-none select-none">
                    <img src="/log_in_metrics.png" alt="Stats" className="hidden md:block"/>
                    <img src="/log_in_metrics_phone.png" alt="Stats" className="block md:hidden" />
                </div>

                {/* Login Prompt Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-xs rounded-2xl">
                    
                </div>
            </div>
        );
    }

    if (!data) {
        return <div className="text-center py-8 text-gray-500">No metrics data available.</div>;
    }

    const metrics = data;

    const metricsData: MetricItemProps[] = [
        { icon: Wind, title: "Air Quality Index ", value: metrics.AQI, colorClass: getAqiColor(metrics.AQI) },
        { icon: Thermometer, title: "Temp (Avg)", value: metrics.Temperature_C, unit: "°C", colorClass: "bg-blue-500" },
        { icon: Footprints, title: "Walkability", value: `${metrics.Walkability}/10`, colorClass: getScoreColor(metrics.Walkability) },
        { icon: Bus, title: "Public Transport", value: `${metrics.Availability_of_Public_Transport}/10`, colorClass: getScoreColor(metrics.Availability_of_Public_Transport) },
        { icon: Lightbulb, title: "Lighting Quality", value: `${metrics.Lighting_Quality}/10`, colorClass: getScoreColor(metrics.Lighting_Quality) },
        { icon: Wifi, title: "Network", value: `${metrics.Network_Connectivity}/10`, colorClass: getScoreColor(metrics.Network_Connectivity) },
    ];

    return (
        <>


            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

                {metricsData.map(metric => (
                    <MetricItem key={metric.title} {...metric} />
                ))}
            </div>
        </>
    )
}

export default MetricsCard