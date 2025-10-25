'use client'

import type { ForwardedRef } from 'react'
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  imagePlugin,
  toolbarPlugin,
  linkPlugin,
  linkDialogPlugin,
  HighlightToggle,
  diffSourcePlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  ListsToggle,
  Separator,
  DiffSourceToggleWrapper
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { toast } from 'sonner'

// Image upload handler function
async function imageUploadHandler(file: File): Promise<string> {
  // Validate file size (10 MB = 10 * 1024 * 1024 bytes)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes
  
  if (file.size > MAX_FILE_SIZE) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    toast.error(`File size (${fileSizeMB} MB) exceeds the maximum limit of 10 MB`);
    throw new Error('File size exceeds 10 MB limit');
  }

  try {
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
    return data.secure_url;
  } catch (error) {
    console.error('Image upload error:', error);
    toast.error('Failed to upload image. Please try again.');
    throw error;
  }
}

export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        // Core plugins for article writing
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkPlugin(),
        linkDialogPlugin(),

        // Image plugin with upload support
        imagePlugin({
          imageUploadHandler,
        }),

        // Add the diff/source plugin for markdown toggle
        diffSourcePlugin({
          viewMode: 'rich-text', // Start in rich text mode
          diffMarkdown: '' // Optional: for comparing with previous version
        }),

        // Toolbar plugin with toggle wrapper
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <HighlightToggle />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <CreateLink />
              <InsertImage />
              <Separator />
              <ListsToggle />
            </DiffSourceToggleWrapper>
          )
        })
      ]}
      {...props}
      ref={editorRef}
    />
  )
}
