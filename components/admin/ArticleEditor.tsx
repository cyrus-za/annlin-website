'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  articleEditorExtensions, 
  editorContentClasses, 
  toolbarButtons,
  validateEditorContent,
  htmlToMarkdown
} from '@/lib/tiptap-config'
import { showSuccessToast, showErrorToast } from '@/lib/toast-helpers'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Underline,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link,
  Image,
  Upload,
  X,
} from 'lucide-react'

// Icon mapping
const iconMap = {
  Bold,
  Italic,
  Underline,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link,
  Image,
}

interface ArticleEditorProps {
  content?: string
  onChange?: (content: string, markdown: string) => void
  placeholder?: string
  editable?: boolean
  className?: string
}

export function ArticleEditor({
  content = '',
  onChange,
  placeholder = 'Begin skryf jou artikel hier...',
  editable = true,
  className,
}: ArticleEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = React.useState(false)
  const [showImageDialog, setShowImageDialog] = React.useState(false)
  const [linkUrl, setLinkUrl] = React.useState('')
  const [linkText, setLinkText] = React.useState('')
  const [imageUrl, setImageUrl] = React.useState('')
  const [imageAlt, setImageAlt] = React.useState('')
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: articleEditorExtensions,
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const markdown = htmlToMarkdown(html)
      onChange?.(html, markdown)
    },
    editorProps: {
      attributes: {
        class: editorContentClasses,
      },
    },
  })

  const handleToolbarAction = (button: any) => {
    if (!editor) return

    switch (button.name) {
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'underline':
        editor.chain().focus().toggleUnderline().run()
        break
      case 'code':
        editor.chain().focus().toggleCode().run()
        break
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run()
        break
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run()
        break
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run()
        break
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run()
        break
      case 'horizontalRule':
        editor.chain().focus().setHorizontalRule().run()
        break
      case 'link':
        handleLinkAction()
        break
      case 'image':
        setShowImageDialog(true)
        break
    }
  }

  const handleLinkAction = () => {
    if (!editor) return

    const { from, to } = editor.state.selection
    const selectedText = editor.state.doc.textBetween(from, to)
    
    if (editor.isActive('link')) {
      // Remove existing link
      editor.chain().focus().unsetLink().run()
    } else {
      // Add new link
      setLinkText(selectedText)
      setLinkUrl('')
      setShowLinkDialog(true)
    }
  }

  const handleAddLink = () => {
    if (!editor || !linkUrl) return

    if (linkText) {
      // Insert link with text
      editor.chain().focus().insertContent(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`).run()
    } else {
      // Set link on selected text
      editor.chain().focus().setLink({ href: linkUrl, target: '_blank', rel: 'noopener noreferrer' }).run()
    }

    setShowLinkDialog(false)
    setLinkUrl('')
    setLinkText('')
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showErrorToast('Slegs prentjie lêers word ondersteun')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Prentjie mag nie groter as 5MB wees nie')
      return
    }

    try {
      setIsUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'article-image')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Kon nie prentjie oplaai nie')
      }

      const { url } = await response.json()
      setImageUrl(url)
      setImageAlt(file.name.replace(/\.[^/.]+$/, '')) // Remove extension for alt text
      
      showSuccessToast('Prentjie opgelaai!', 'Jou prentjie is suksesvol opgelaai.')
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Kon nie prentjie oplaai nie')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddImage = () => {
    if (!editor || !imageUrl) return

    editor.chain().focus().setImage({ 
      src: imageUrl, 
      alt: imageAlt || 'Artikel prentjie',
      title: imageAlt || 'Artikel prentjie',
    }).run()

    setShowImageDialog(false)
    setImageUrl('')
    setImageAlt('')
  }

  if (!editor) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <span className="ml-3 text-gray-600">Laai redigeerder...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {editable && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Artikel Redigeerder</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-t-md bg-gray-50">
              {toolbarButtons.map((button) => {
                const IconComponent = iconMap[button.icon as keyof typeof iconMap]
                const isActive = button.isActive?.(editor) || false
                const isDisabled = button.isDisabled?.(editor) || false

                return (
                  <Button
                    key={button.name}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleToolbarAction(button)}
                    disabled={isDisabled}
                    title={button.label}
                    className="h-8 w-8 p-0"
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                )
              })}
            </div>

            {/* Editor */}
            <div className="border border-t-0 border-gray-200 rounded-b-md">
              <EditorContent 
                editor={editor} 
                className="min-h-[300px]"
              />
            </div>

            {/* Character count */}
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>
                {editor.storage.characterCount?.characters() || 0} karakters
              </span>
              <span>
                {editor.storage.characterCount?.words() || 0} woorde
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {!editable && (
        <div className="prose prose-sm max-w-none">
          <EditorContent editor={editor} />
        </div>
      )}

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voeg Skakel By</DialogTitle>
            <DialogDescription>
              Skep 'n skakel na 'n ander webwerf of bladsy
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkUrl">URL *</Label>
              <Input
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                type="url"
              />
            </div>
            
            <div>
              <Label htmlFor="linkText">Skakel Teks</Label>
              <Input
                id="linkText"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Teks wat gewys sal word"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Kanselleer
            </Button>
            <Button onClick={handleAddLink} disabled={!linkUrl}>
              Voeg Skakel By
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voeg Prentjie By</DialogTitle>
            <DialogDescription>
              Laai 'n prentjie op of voeg 'n URL by
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Laai Prentjie Op</Label>
              <div className="mt-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? 'Laai op...' : 'Kies Prentjie'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="text-center text-gray-500">of</div>
            
            <div>
              <Label htmlFor="imageUrl">Prentjie URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>
            
            <div>
              <Label htmlFor="imageAlt">Alternatiewe Teks</Label>
              <Input
                id="imageAlt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Beskryf die prentjie vir toeganklikheid"
              />
            </div>

            {imageUrl && (
              <div className="mt-4">
                <Label>Voorskou:</Label>
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  className="mt-2 max-w-full h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Kanselleer
            </Button>
            <Button onClick={handleAddImage} disabled={!imageUrl}>
              Voeg Prentjie By
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
