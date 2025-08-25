import { ProfileCard } from "./components/profile-card";
import { ProfileCommentsCard } from "./components/profile-comment";



export default function ProfilePage() {
  return (
    

      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Profile Layout - Left Profile Card, Right Comments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ProfileCard />
            </div>
            <div className="lg:col-span-2">
              <ProfileCommentsCard />
            </div>
          </div>
        </div>
      </div>
    
  )
}
