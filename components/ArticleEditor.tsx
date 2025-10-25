'use client'

import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { ForwardRefEditor } from './ForwardRefEditor'
import { type MDXEditorMethods } from '@mdxeditor/editor'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from './ui/button'
import { Loader2, Pen, Rocket, Upload } from 'lucide-react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { addArticle } from '@/features/article/use-add-article'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGetPost } from '@/features/post/use-get-byId'
import { updateArticle } from '@/features/article/use-edit-article'

const articleSchema = z.object({
  heading: z.string()
    .min(10, "Heading must be at least 10 characters")
    .max(250, "Heading must be less than 250 characters"),
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
})

type ArticleFormData = z.infer<typeof articleSchema>

export default function ArticleEditor() {
  const searchParams = useSearchParams();
  const [charCount, setCharCount] = useState({ heading: 0, body: 0 });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter()
  const isEditMode = searchParams.get('edit') === 'true';
  const postId = searchParams.get('post-id');
  const post_slug = searchParams.get('post-slug')
  
  const { data: postData, isLoading: isLoadingPost } = useGetPost(
    postId ? postId : ''
  );
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setValue("image", undefined);
  };

  // Upload image directly to Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    try {
      setIsUploadingImage(true);
      setUploadProgress(0);

      // Get signature from API
      const sigResponse = await fetch('/api/upload/signature');
      if (!sigResponse.ok) {
        throw new Error('Failed to get upload signature');
      }
      
      const { signature, timestamp, cloudName, apiKey, folder } = await sigResponse.json();
      
      // Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('folder', folder);
      formData.append('quality', 'auto');
      formData.append('fetch_format', 'auto');
      
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }
      
      const data = await uploadResponse.json();
      setUploadProgress(100);
      
      return data.secure_url;
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image. Please try again.');
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const mutation = addArticle();
  const updateMutation = updateArticle(postId ?? '');
  const ref = useRef<MDXEditorMethods>(null)
  const [markdown, setMarkdown] = useState(`# My Article

Start writing your article here...

You can:
- **Bold** and *italic* text
- Add [links](https://example.com)
- Insert images using the toolbar
- Create lists and quotes

> This is a quote block

## Subheading

More content here...
`)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
  })

  useEffect(() => {
    if (isEditMode && postData) {
      setValue('heading', postData.post.heading);
      ref.current?.setMarkdown(postData.post.body);
      setMarkdown(postData.post.body);
      setCharCount({
        heading: postData.post.heading.length,
        body: postData.post.body.length
      });
      
      // Set existing image preview if available
      if (postData.post.image_url) {
        setImagePreview(postData.post.image_url);
      }
    }
  }, [isEditMode, postData, setValue]);

  const onPublish = async (data: ArticleFormData) => {
    const content = ref.current?.getMarkdown();
    if (content === undefined || content.length <= 10) {
      toast.error("Body should be greater than 10");
      return;
    }
    if (content.length > 15000) {
      toast.error("Body must be less than 15,000 characters");
      return;
    }

    try {
      let imageUrl: string | undefined;

      // Upload image first if present
      if (data.image && data.image.length > 0) {
        imageUrl = await uploadImageToCloudinary(data.image[0]);
      }

      // Send only the image URL to the API
      await mutation.mutateAsync({
        heading: data.heading,
        body: content,
        image_url: imageUrl,
      }, {
        onSuccess: () => {
          router.push('/community?view=article');
        }
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to create article. Please try again.');
    }
  };

  const onUpdate = async (data: ArticleFormData) => {
    const content = ref.current?.getMarkdown();
    if (content === undefined || content.length <= 10) {
      toast.error("Body should be greater than 10");
      return;
    }
    if (content.length > 15000) {
      toast.error("Body must be less than 15,000 characters");
      return;
    }

    try {
      let imageUrl: string | undefined;

      // Upload new image if changed
      if (data.image && data.image.length > 0) {
        imageUrl = await uploadImageToCloudinary(data.image[0]);
      } else if (postData?.post.image_url) {
        // Keep existing image if no new image uploaded
        imageUrl = postData.post.image_url;
      }

      // Send only the image URL to the API
      await updateMutation.mutateAsync({
        heading: data.heading,
        body: content,
        image_url: imageUrl,
      }, {
        onSuccess: () => {
          router.push(`/article/${postId}/${post_slug}`);
        },
      });
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update article. Please try again.');
    }
  };

  const isPending = mutation.isPending || updateMutation.isPending || isUploadingImage;

  return (
    <form onSubmit={handleSubmit(isEditMode ? onUpdate : onPublish)} className="max-w-6xl mr-auto py-6 px-6 lg:pl-10 pb-20 lg:pb-8 ">
      <div className="space-y-4 mb-6">
        <div>
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
        
        <div>
          <Label htmlFor="image" className="text-sm font-medium text-gray-700">
            Cover Image (optional)
            <p className='text-[12px]'>Max size 10 MB</p>
          </Label>

          <Input
            disabled={isPending}
            id="image"
            type="file"
            {...register("image")}
            accept="image/jpeg,image/jpg,image/png"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ref={(e) => {
              register("image").ref(e);
              fileInputRef.current = e;
            }}
            onChange={handleFileChange}
          />
          
          {/* Upload Progress */}
          {isUploadingImage && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Upload className="h-4 w-4 animate-pulse" />
                <span>Uploading image... {uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {imagePreview && !isUploadingImage && (
            <div className="mt-4 flex flex-col items-center justify-center gap-4 p-4 border rounded-xl bg-gray-50 shadow-sm">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs rounded-lg shadow-md object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow transition"
                disabled={isPending}
              >
                Remove Image
              </button>
            </div>
          )}
          
          {errors.image && (
            <p className="text-sm text-red-500 mt-1">{errors.image.message as string}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <span className={`text-sm ${charCount.body > 15000 ? 'text-red-500' : 'text-muted-foreground'}`}>
          {charCount.body}/15000
        </span>
      </div>
      <div className="border rounded-lg prose prose-lg max-w-none h-[500px] lg:h-[650px] overflow-auto">
        <ForwardRefEditor
          ref={ref}
          markdown={markdown}
          onChange={(newMarkdown) => {
            if (isMounted.current) {
              setMarkdown(newMarkdown)
              setCharCount(prev => ({ ...prev, body: newMarkdown.length }))
            }
          }}
        />
      </div>
      <div className="my-4 flex w-full items-center">
        <Button
          disabled={isPending}
          className="px-4 py-2 w-full"
          type="submit"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploadingImage ? "Uploading Image..." : isEditMode ? "Updating..." : "Publishing..."}
            </>
          ) : (
            <>
              {!isEditMode && <p className='flex'>Publish Article <Rocket className='ml-2'/></p>}
              {isEditMode && <p className='flex'>Edit Article <Pen className='ml-2'/></p>}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
