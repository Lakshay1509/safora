import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useGetLocation } from "@/features/location/use-get-location";
import { useParams } from "next/navigation";
import {MapPin} from "lucide-react"

export function AreaCard() {
  const params = useParams();
    const id = params.id as string

    const {
        data,
        isLoading,
        isError
    } = useGetLocation(id);
  return (
    <Card className="w-full  text-white bg-white/5 backdrop-blur-md border border-white/10" >
        
      <CardContent className="pt-0">
        <div className="space-y-4">
          <h2 className="flex items-center gap-x-3 text-3xl font-semibold">
  <MapPin className="h-8 w-8 " />
  {data?.location.area}
</h2>

          <div className="text-gray-200 ml-12">
            <span>{data?.location.state}, {data?.location.city}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
