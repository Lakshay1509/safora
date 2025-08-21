import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useGetLocation } from "@/features/location/use-get-location";
import { useParams } from "next/navigation";
import { MapPin } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

export function AreaCard() {
  const daySafetyData = [
    { name: "Safe", value: 85, color: "#10B981" },
    { name: "Unsafe", value: 15, color: "#374151" },
  ]

  const nightSafetyData = [
    { name: "Safe", value: 62, color: "#10B981" },
    { name: "Unsafe", value: 38, color: "#374151" },
  ]

  const params = useParams();
  const id = params.id as string

  const {
    data,
    isLoading,
    isError
  } = useGetLocation(id);
  
  return (
    <Card className="w-full bg-white border border-white/10" >

      <CardContent className="pt-0 flex w-full justify-between ">
        <div className="space-y-4">
          <h2 className="flex items-center gap-x-3 text-3xl font-semibold">
            <MapPin className="h-8 w-8 " />
            {data?.location.area}
          </h2>

          <div className="text-black ml-12">
            <span>{data?.location.state}, {data?.location.city}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: "#000000" }}>
                  Day
                </p>
                <p className="text-xs" style={{ color: "#000000" }}>
                  85% safe
                </p>
              </div>
              <div className="w-12 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={daySafetyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={16}
                      outerRadius={24}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                    >
                      {daySafetyData.map((entry, index) => (
                        <Cell key={`day-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: "#000000" }}>
                  Night
                </p>
                <p className="text-xs" style={{ color: "#000000" }}>
                  62% safe
                </p>
              </div>
              <div className="w-12 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nightSafetyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={16}
                      outerRadius={24}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                    >
                      {nightSafetyData.map((entry, index) => (
                        <Cell key={`night-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
      </CardContent>
    </Card>
  )
}
