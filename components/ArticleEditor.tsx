'use client'

import React, { ChangeEvent, useRef, useState } from 'react'
import { ForwardRefEditor } from './ForwardRefEditor'
import { type MDXEditorMethods } from '@mdxeditor/editor'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from './ui/button'
import { Rocket } from 'lucide-react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { addArticle } from '@/features/article/use-add-article'
import { toast } from 'sonner'

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
  };
  const mutation = addArticle();
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
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
  })

  const handleSave = (data: ArticleFormData) => {
    const content = ref.current?.getMarkdown()
    if (content === undefined || content.length <= 10) {
      toast.error("Body should be greater than 10")
      return;
    }


    mutation.mutateAsync({
      heading: data.heading,
      image: data.image && data.image.length > 0 ? data.image[0] : undefined,
      body: content
    })
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} className="max-w-6xl mr-auto py-6 px-6 lg:pl-10">
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="heading" className="block text-sm font-medium text-gray-700">
            Heading
          </Label>
          <Input
            disabled={mutation.isPending}
            id="heading"
            {...register('heading')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.heading && <p className="mt-1 text-sm text-red-600">{errors.heading.message}</p>}
        </div>
        <div>
          <Label htmlFor="image" className=" text-sm font-medium text-gray-700">
            Cover Image (optional)
            <p className='text-[12px]'>Max size 10 MB</p>
          </Label>

          <Input
            disabled={mutation.isPending}
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
          {imagePreview && (
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
              >
                Remove Image
              </button>
            </div>
          )}

        </div>
      </div>

      <div className="border rounded-lg overflow-hidden prose prose-lg max-w-none">
        <ForwardRefEditor
          ref={ref}
          markdown={markdown}
          onChange={(newMarkdown) => setMarkdown(newMarkdown)}
        />
      </div>
      <div className="my-4 flex w-full items-center">
        <Button
          disabled={mutation.isPending}
          className="px-4 py-2  w-full"
        >
          Publish Article <Rocket />
        </Button>
      </div>
    </form>
  )
}
