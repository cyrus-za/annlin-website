import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import Code from '@tiptap/extension-code'
import Blockquote from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'

// Custom image extension with upload functionality
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return { width: attributes.width }
        },
      },
      height: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return { height: attributes.height }
        },
      },
      alt: {
        default: '',
        renderHTML: attributes => {
          return { alt: attributes.alt }
        },
      },
      title: {
        default: '',
        renderHTML: attributes => {
          if (!attributes.title) {
            return {}
          }
          return { title: attributes.title }
        },
      },
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImage: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})

// Custom link extension with proper validation
const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      target: {
        default: '_blank',
      },
      rel: {
        default: 'noopener noreferrer',
      },
    }
  },
}).configure({
  openOnClick: false,
  HTMLAttributes: {
    class: 'text-blue-600 hover:text-blue-800 underline',
  },
})

// Tiptap editor configuration for articles
export const articleEditorExtensions = [
  StarterKit.configure({
    // Disable default extensions we're replacing
    heading: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
    bold: false,
    italic: false,
    code: false,
    blockquote: false,
    horizontalRule: false,
  }),
  
  // Typography extensions
  Heading.configure({
    levels: [1, 2, 3, 4],
    HTMLAttributes: {
      class: 'prose-heading',
    },
  }),
  
  Bold.configure({
    HTMLAttributes: {
      class: 'font-bold',
    },
  }),
  
  Italic.configure({
    HTMLAttributes: {
      class: 'italic',
    },
  }),
  
  Underline,
  
  Code.configure({
    HTMLAttributes: {
      class: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
    },
  }),
  
  // List extensions
  BulletList.configure({
    HTMLAttributes: {
      class: 'prose-ul',
    },
  }),
  
  OrderedList.configure({
    HTMLAttributes: {
      class: 'prose-ol',
    },
  }),
  
  ListItem,
  
  // Block extensions
  Blockquote.configure({
    HTMLAttributes: {
      class: 'border-l-4 border-gray-300 pl-4 italic text-gray-700',
    },
  }),
  
  HorizontalRule.configure({
    HTMLAttributes: {
      class: 'my-6 border-gray-300',
    },
  }),
  
  // Media extensions
  CustomImage,
  CustomLink,
]

// Editor content styling classes
export const editorContentClasses = `
  prose prose-sm max-w-none
  prose-headings:text-gray-900
  prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4
  prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3
  prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2
  prose-h4:text-base prose-h4:font-medium prose-h4:mb-2
  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
  prose-strong:text-gray-900
  prose-em:text-gray-700
  prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
  prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:pl-4 prose-blockquote:italic
  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
  prose-li:mb-1
  prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-a:underline
  prose-img:rounded-lg prose-img:shadow-sm
  prose-hr:border-gray-300 prose-hr:my-6
  focus:outline-none
  min-h-[200px]
  p-4
  border border-gray-200 rounded-md
`

// Toolbar button configuration
export interface ToolbarButton {
  name: string
  label: string
  icon: string
  action: string
  isActive?: (editor: any) => boolean
  isDisabled?: (editor: any) => boolean
}

export const toolbarButtons: ToolbarButton[] = [
  {
    name: 'bold',
    label: 'Vet',
    icon: 'Bold',
    action: 'toggleBold',
    isActive: (editor) => editor.isActive('bold'),
  },
  {
    name: 'italic',
    label: 'Skuins',
    icon: 'Italic',
    action: 'toggleItalic',
    isActive: (editor) => editor.isActive('italic'),
  },
  {
    name: 'underline',
    label: 'Onderstreep',
    icon: 'Underline',
    action: 'toggleUnderline',
    isActive: (editor) => editor.isActive('underline'),
  },
  {
    name: 'code',
    label: 'Kode',
    icon: 'Code',
    action: 'toggleCode',
    isActive: (editor) => editor.isActive('code'),
  },
  {
    name: 'heading1',
    label: 'Hoofopskrif 1',
    icon: 'Heading1',
    action: () => 'toggleHeading',
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
  },
  {
    name: 'heading2',
    label: 'Hoofopskrif 2',
    icon: 'Heading2',
    action: () => 'toggleHeading',
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
  },
  {
    name: 'heading3',
    label: 'Hoofopskrif 3',
    icon: 'Heading3',
    action: () => 'toggleHeading',
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
  },
  {
    name: 'bulletList',
    label: 'Kolletjie Lys',
    icon: 'List',
    action: 'toggleBulletList',
    isActive: (editor) => editor.isActive('bulletList'),
  },
  {
    name: 'orderedList',
    label: 'Genommerde Lys',
    icon: 'ListOrdered',
    action: 'toggleOrderedList',
    isActive: (editor) => editor.isActive('orderedList'),
  },
  {
    name: 'blockquote',
    label: 'Aanhaling',
    icon: 'Quote',
    action: 'toggleBlockquote',
    isActive: (editor) => editor.isActive('blockquote'),
  },
  {
    name: 'horizontalRule',
    label: 'Horisontale Lyn',
    icon: 'Minus',
    action: 'setHorizontalRule',
  },
  {
    name: 'link',
    label: 'Skakel',
    icon: 'Link',
    action: 'toggleLink',
    isActive: (editor) => editor.isActive('link'),
  },
  {
    name: 'image',
    label: 'Prentjie',
    icon: 'Image',
    action: 'addImage',
  },
]

// Editor placeholder text in Afrikaans
export const editorPlaceholders = {
  article: 'Begin skryf jou artikel hier... Gebruik die werkbalk bo-aan om teks te formateer.',
  description: 'Voeg \'n kort beskrywing by...',
  content: 'Skryf jou inhoud hier...',
}

// Content validation
export const validateEditorContent = (content: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Check minimum length (excluding HTML tags)
  const textContent = content.replace(/<[^>]*>/g, '').trim()
  if (textContent.length < 10) {
    errors.push('Inhoud moet ten minste 10 karakters bevat')
  }
  
  // Check maximum length
  if (textContent.length > 10000) {
    errors.push('Inhoud mag nie langer as 10,000 karakters wees nie')
  }
  
  // Check for empty content
  if (!textContent || textContent === '') {
    errors.push('Inhoud is verplig')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Convert HTML to markdown (for storage)
export const htmlToMarkdown = (html: string): string => {
  // Basic HTML to Markdown conversion
  // In a production app, you might want to use a proper library like turndown
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<u[^>]*>(.*?)<\/u>/gi, '<u>$1</u>')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n'
    })
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      let counter = 1
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n'
    })
    .replace(/<hr[^>]*>/gi, '\n---\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
    .trim()
}

// Convert markdown to HTML (for display)
export const markdownToHtml = (markdown: string): string => {
  // Basic Markdown to HTML conversion
  // In a production app, you might want to use a proper library like marked
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="rounded-lg shadow-sm" />')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$1</li>')
    .replace(/^---$/gim, '<hr>')
    .replace(/\n/gim, '<br>')
}
