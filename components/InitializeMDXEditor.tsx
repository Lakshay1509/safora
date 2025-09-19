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
  diffSourcePlugin, // Add this import
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
  DiffSourceToggleWrapper // Add this import
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

// Image upload handler function
async function imageUploadHandler(image: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', image)
  
  const response = await fetch('/api/article/upload-image', {
    method: 'POST',
    body: formData
  })
  
  const json = await response.json();
  return json.imageUrl
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
              <HighlightToggle/>
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
