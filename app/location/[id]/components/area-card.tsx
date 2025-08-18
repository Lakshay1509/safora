import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useGetLocation } from "@/features/location/use-get-location";
import { useParams } from "next/navigation";
import { MapPin } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

export function AreaCard() {
  const safetyData = [
    { name: "Safe", value: 79, color: "#10B981" },
    { name: "Unsafe", value: 21, color: "#374151" },
  ]

  const params = useParams();
  const id = params.id as string

  const {
    data,
    isLoading,
    isError
  } = useGetLocation(id);
  return (
    <Card className="w-full  text-white bg-white/5 backdrop-blur-md border border-white/10" >

      <CardContent className="pt-0 flex w-full justify-between ">
        <div className="space-y-4">
          <h2 className="flex items-center gap-x-3 text-3xl font-semibold">
            <MapPin className="h-8 w-8 " />
            {data?.location.area}
          </h2>

          <div className="text-gray-200 ml-12">
            <span>{data?.location.state}, {data?.location.city}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: "#EAEAEA" }}>
                79% people felt safe here
              </p>
              
            </div>
            <div className="w-16 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={safetyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={32}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                  >
                    {safetyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
      </CardContent>
    </Card>
  )
}
