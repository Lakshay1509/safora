"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addPost } from "@/features/post/use-add-post";
import { EditPostComment } from "@/features/post/use-update-post";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetLocation } from "@/features/location/use-get-location";
import { useGetPost } from "@/features/post/use-get-byId";

// Schema should match backend validation
const postSchema = z.object({
  heading: z.string()
    .min(10, "Heading must be at least 10 characters")
    .max(50, "Heading must be less than 50 characters"),
  body: z.string()
    .min(10, "Body must be at least 10 characters")
    .max(1500, "Body must be less than 1500 characters"),
});

type PostFormValues = z.infer<typeof postSchema>;

const CreatePost = () => {
  const [charCount, setCharCount] = useState({ heading: 0, body: 0 });
  const searchParams = useSearchParams();
  const router = useRouter();

  const isEditMode = searchParams.get('edit') === 'true';
  const postId = searchParams.get('post-id');
  const locationId = searchParams.get('location-id');

  // Fetch post data if in edit mode
  const { data: postData, isLoading: isLoadingPost } = useGetPost(
    postId? postId : ''
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      heading: '',
      body: '',
    },
  });

  // Set form values when post data is loaded
  useEffect(() => {
    if (isEditMode && postData) {
      setValue('heading', postData.post.heading);
      setValue('body', postData.post.body);
      setCharCount({
        heading: postData.post.heading.length,
        body: postData.post.body.length,
      });
    }
  }, [isEditMode, postData, setValue]);

  const {data: LocationData, isLoading: isLoadingLocation} = useGetLocation(locationId ? locationId : '');

  // Create mutation
  const { mutate: createPost, isPending: isCreating } = addPost(LocationData?.location?.id ?? '');
  
  // Update mutation
  const { mutate: updatePost, isPending: isUpdating } = EditPostComment(postId || '');

  const isPending = isCreating || isUpdating;
  const isLoading = isLoadingLocation || isLoadingPost;

  const onSubmit = (data: PostFormValues) => {
    if (isEditMode && postId) {
      updatePost({
        ...data,
      }, {
        onSuccess: () => {
          router.push(`/post/${postId}`);
        },
      });
    } else {
      createPost({
        ...data,
      }, {
        onSuccess: () => {
          reset();
          setCharCount({ heading: 0, body: 0 });
          router.push(`/location/${locationId}`);

        },
      });
    }
  };

  return (
    <div className="w-full mt-20 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        {isEditMode ? 'Edit Post' : 'Create New Post'}
      </h1>
      
      {/* Show location info at the top if available and not in edit mode */}
      {!isEditMode && LocationData?.location?.name && (
        <div className="flex justify-between items-center mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-800 dark:text-blue-200">
            <p className="font-medium">Posting in: {LocationData?.location?.name}</p>
          </div>
          <div>
            <Button>
              Change location
            </Button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="heading" className="text-sm font-medium">
              Heading
            </Label>
            <Input
              {...register("heading")}
              id="heading"
              className={errors.heading ? "border-red-500" : ""}
              disabled={isPending}
              onChange={(e) => setCharCount(prev => ({ ...prev, heading: e.target.value.length }))}
            />
            <div className="flex justify-between">
              {errors.heading ? (
                <p className="text-sm text-red-500">{errors.heading.message}</p>
              ) : (
                <span className="text-sm text-muted-foreground">Min 10 characters</span>
              )}
              <span className={`text-sm ${charCount.heading > 50 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {charCount.heading}/50
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="body" className="text-sm font-medium">
              Body
            </Label>
            <Textarea
              {...register("body")}
              id="body"
              rows={5}
              className={errors.body ? "border-red-500" : ""}
              disabled={isPending}
              onChange={(e) => setCharCount(prev => ({ ...prev, body: e.target.value.length }))}
            />
            <div className="flex justify-between">
              {errors.body ? (
                <p className="text-sm text-red-500">{errors.body.message}</p>
              ) : (
                <span className="text-sm text-muted-foreground">Min 10 characters</span>
              )}
              <span className={`text-sm ${charCount.body > 1500 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {charCount.body}/1500
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isPending}
              className={isEditMode ? "" : "w-full"}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Submitting..."}
                </>
              ) : isEditMode ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreatePost;