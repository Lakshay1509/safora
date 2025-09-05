import { Suspense } from "react"
import CreatePost from "./create-post"

// Loading component for suspense fallback
function CreatePostLoading() {
  return (
    <div className="w-full mt-20 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    </div>
  )
}

const page = () => {
  return (
    <Suspense fallback={<CreatePostLoading />}>
      <CreatePost/>
    </Suspense>
  )
}

export default page
