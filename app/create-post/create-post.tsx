"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addPost } from "@/features/post/use-add-post";
import { EditPost} from "@/features/post/use-update-post";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetLocation } from "@/features/location/use-get-location";
import { useGetPost } from "@/features/post/use-get-byId";
import ChangeLocation from "./change_location";
import { toast } from "sonner";
import { useImagePreview } from "@/lib/imagePreview";

// Schema should match backend validation
const postSchema = z.object({
  heading: z.string()
    .min(10, "Heading must be at least 10 characters")
    .max(250, "Heading must be less than 250 characters"),
  body: z.string()
    .min(10, "Body must be at least 10 characters")
    .max(1500, "Body must be less than 1500 characters"),
  image: z.any()
    .refine((files) => files.length === 0 || files.length === 1, {
      message: "Please select only one file"
    })
    .refine((files) => {
      if (files.length === 0) return true; 
      const file = files[0];
      return file.size <= 10 * 1024 * 1024; 
    }, {
      message: "File size must be less than 10MB"
    })
    .optional()
});

type PostFormValues = z.infer<typeof postSchema>;

const CreatePost = () => {
  const [charCount, setCharCount] = useState({ heading: 0, body: 0 });
  const searchParams = useSearchParams();
  const router = useRouter();

  const isEditMode = searchParams.get('edit') === 'true';
  const postId = searchParams.get('post-id');
  const post_slug = searchParams.get('post-slug')
  

  const initialLocationId = searchParams.get('location-id');
  const [locationId, setLocationId] = useState<string | null>(initialLocationId);

  // Fetch post data if in edit mode
  const { data: postData, isLoading: isLoadingPost } = useGetPost(
    postId? postId : ''
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
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

  //Image Preview

  const { preview, createPreview, clearPreview } = useImagePreview();
  
  // Watch the image field
  const watchedImage = useWatch({
    control,
    name: "image"
  });

  // Create preview when file changes
  useEffect(() => {
    if (watchedImage && watchedImage.length > 0) {
      createPreview(watchedImage[0]);
    } else {
      clearPreview();
    }
  }, [watchedImage, createPreview, clearPreview]);

  const handleRemoveImage = () => {
    clearPreview();
    setValue("image", undefined);
    
    // Clear the file input
    const input = document.getElementById('image') as HTMLInputElement;
    if (input) input.value = '';
  };

  const {data: LocationData, isLoading: isLoadingLocation} = useGetLocation(locationId?locationId : '');

  // Create mutation
  const { mutate: createPost, isPending: isCreating } = addPost(locationId ?? '');
  
  // Update mutation
  const { mutate: updatePost, isPending: isUpdating } = EditPost(postId || '');

  const isPending = isCreating || isUpdating;
  const isLoading = isLoadingLocation || isLoadingPost;

  const onSubmit = (data: PostFormValues) => {
    const payload = {
      ...data,
      image: data.image && data.image.length > 0 ? data.image[0] : undefined,
    };
    if (isEditMode && postId) {
      const editPayload = {
        heading:data.heading,
        body:data.body,
        locationId:locationId? locationId:''
      }
      updatePost(editPayload, {
        onSuccess: () => {
          router.push(`/post/${postId}/${post_slug}`);
        },
      });
    } else {
      if (!locationId) {
        // Optionally, handle the case where location is not selected
        toast.error("Please select a location before creating a post.");
        return;
      }
      createPost(payload, {
        onSuccess: () => {
          reset();
          setCharCount({ heading: 0, body: 0 });
          router.push(`/community`);

        },
      });
    }
  };

  return (
    <div className="w-full  max-w-2xl mx-auto p-6  pb-20 ">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        {isEditMode ? 'Edit Post' : 'Create New Post'}
      </h1>
    
  
        <ChangeLocation 
          onLocationSelect={setLocationId} 
          currentLocationName={LocationData?.location?.name}
        />
      
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-8">
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
              <span className={`text-sm ${charCount.heading > 250 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {charCount.heading}/250
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

          {!isEditMode && <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Image (Optional)
            </Label>
            <p className="text-[12px]">Image cannot be edited after posting</p>
            <Input
              {...register("image")}
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="file:text-sm file:font-medium file:text-gray-700 dark:file:text-gray-300"
              disabled={isPending}
            />
            {preview && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
            <div className="relative w-full max-w-md">
              <img
                src={preview}
                alt="Image preview"
                className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg transition-colors"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          </div>
        )}
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image.message as string}</p>
            )}
          </div>}
          
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
              disabled={isPending || (!isEditMode && !locationId)}
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