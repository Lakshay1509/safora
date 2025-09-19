import { ProfileCard } from "./components/profile-card";
import { ProfileCommentsCard } from "./components/profile-comment";
import { ProfileFollowingCard } from "./components/profile-following";
import { ProfilePostsCard } from "./components/profile-posts";



export default function ProfilePage() {
  return (
    

      <div className="p-4 md:p-6 lg:p-8 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto">
          {/* Profile Layout - Left Profile Card, Right Comments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-5">
              <ProfileCard />
              <ProfileFollowingCard/>
            </div>
            <div className="lg:col-span-2 space-y-5">
              <ProfileCommentsCard />
              <ProfilePostsCard/>
            </div>
          </div>
        </div>
      </div>
    
  )
}
