'use client'

import * as React from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import {
  Bold,
  Braces,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Type,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { isSafeMarkdownUrl, markdownToHtml, normalizeMarkdownUrl } from '@/lib/markdown'
import { articleEditorExtensions } from '@/lib/tiptap-config'
import { tiptapJsonToMarkdown } from '@/lib/tiptap-markdown'
import { cn } from '@/lib/utils'

type MarkdownEditorProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'defaultValue' | 'onChange' | 'value'
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type EditorMode = 'visual' | 'markdown'
type InsertDialog = 'link' | 'image' | null
type SelectionRange = { start: number; end: number }

function cleanMarkdownLabel(value: string) {
  return value.replace(/[\[\]]/g, '').trim()
}

export const MarkdownEditor = React.forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  (
    {
      value,
      defaultValue = '',
      onValueChange,
      onBlur,
      className,
      disabled = false,
      placeholder = 'Begin skryf hier...',
      rows = 18,
      required,
      ...textareaProps
    },
    forwardedRef
  ) => {
    const controlled = value !== undefined
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const [mode, setMode] = React.useState<EditorMode>('visual')
    const [insertDialog, setInsertDialog] = React.useState<InsertDialog>(null)
    const [dialogLabel, setDialogLabel] = React.useState('')
    const [dialogUrl, setDialogUrl] = React.useState('')
    const [dialogError, setDialogError] = React.useState('')
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const rawSelectionRef = React.useRef<SelectionRange>({ start: 0, end: 0 })
    const visualSelectionRef = React.useRef<SelectionRange>({ start: 0, end: 0 })
    const visualMarkdownRef = React.useRef(controlled ? value : defaultValue)
    const linkLabelId = React.useId()
    const linkUrlId = React.useId()
    const currentValue = controlled ? value : internalValue

    const updateValue = React.useCallback(
      (nextValue: string) => {
        if (!controlled) setInternalValue(nextValue)
        onValueChange?.(nextValue)
      },
      [controlled, onValueChange]
    )

    const editor = useEditor({
      extensions: articleEditorExtensions,
      content: markdownToHtml(currentValue),
      editable: !disabled,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            'tiptap min-h-full px-5 py-4 text-[15px] leading-7 text-stone-800 focus:outline-none ' +
            '[&_a]:text-amber-700 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-amber-300 ' +
            '[&_blockquote]:pl-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold ' +
            '[&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-6 [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-7 ' +
            '[&_p]:my-3 [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-md [&_ul]:list-disc [&_ul]:pl-7',
          'aria-label': 'Visuele inhoudredigeerder',
          'aria-required': String(Boolean(required)),
        },
      },
      onUpdate: ({ editor: updatedEditor }) => {
        const markdown = tiptapJsonToMarkdown(updatedEditor.getJSON())
        visualMarkdownRef.current = markdown
        updateValue(markdown)
      },
      onBlur: () => {
        const textarea = textareaRef.current
        if (!textarea) return
        onBlur?.({ currentTarget: textarea, target: textarea } as React.FocusEvent<HTMLTextAreaElement>)
      },
    })

    React.useEffect(() => {
      editor?.setEditable(!disabled)
    }, [disabled, editor])

    React.useEffect(() => {
      if (!editor || mode !== 'visual' || currentValue === visualMarkdownRef.current) return
      visualMarkdownRef.current = currentValue
      editor.commands.setContent(markdownToHtml(currentValue), { emitUpdate: false })
    }, [currentValue, editor, mode])

    const setTextareaRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef]
    )

    const switchMode = React.useCallback(
      (nextMode: EditorMode) => {
        if (nextMode === mode) return
        if (nextMode === 'visual' && editor) {
          visualMarkdownRef.current = currentValue
          editor.commands.setContent(markdownToHtml(currentValue), { emitUpdate: false })
        }
        setMode(nextMode)
      },
      [currentValue, editor, mode]
    )

    const replaceRawRange = React.useCallback(
      (range: SelectionRange, replacement: string, selectionStart: number, selectionEnd: number) => {
        updateValue(`${currentValue.slice(0, range.start)}${replacement}${currentValue.slice(range.end)}`)
        requestAnimationFrame(() => {
          textareaRef.current?.focus()
          textareaRef.current?.setSelectionRange(selectionStart, selectionEnd)
        })
      },
      [currentValue, updateValue]
    )

    const wrapRawSelection = React.useCallback(
      (before: string, after: string, fallback: string) => {
        const textarea = textareaRef.current
        if (!textarea) return
        const range = { start: textarea.selectionStart, end: textarea.selectionEnd }
        const content = currentValue.slice(range.start, range.end) || fallback
        replaceRawRange(range, `${before}${content}${after}`, range.start + before.length, range.start + before.length + content.length)
      },
      [currentValue, replaceRawRange]
    )

    const transformRawLines = React.useCallback(
      (transform: (line: string, index: number) => string) => {
        const textarea = textareaRef.current
        if (!textarea) return
        const lineStart = currentValue.lastIndexOf('\n', Math.max(0, textarea.selectionStart - 1)) + 1
        const nextBreak = currentValue.indexOf('\n', textarea.selectionEnd)
        const lineEnd = nextBreak === -1 ? currentValue.length : nextBreak
        const replacement = currentValue.slice(lineStart, lineEnd).split('\n').map(transform).join('\n')
        replaceRawRange({ start: lineStart, end: lineEnd }, replacement, lineStart, lineStart + replacement.length)
      },
      [currentValue, replaceRawRange]
    )

    const runCommand = React.useCallback(
      (command: 'bold' | 'italic' | 'heading2' | 'heading3' | 'bulletList' | 'orderedList' | 'blockquote' | 'horizontalRule') => {
        if (mode === 'visual') {
          if (!editor) return
          const chain = editor.chain().focus()
          if (command === 'bold') chain.toggleBold().run()
          if (command === 'italic') chain.toggleItalic().run()
          if (command === 'heading2') chain.toggleHeading({ level: 2 }).run()
          if (command === 'heading3') chain.toggleHeading({ level: 3 }).run()
          if (command === 'bulletList') chain.toggleBulletList().run()
          if (command === 'orderedList') chain.toggleOrderedList().run()
          if (command === 'blockquote') chain.toggleBlockquote().run()
          if (command === 'horizontalRule') chain.setHorizontalRule().run()
          return
        }

        if (command === 'bold') wrapRawSelection('**', '**', 'vet teks')
        if (command === 'italic') wrapRawSelection('*', '*', 'skuins teks')
        if (command === 'heading2' || command === 'heading3') {
          const level = command === 'heading2' ? 2 : 3
          transformRawLines((line) => `${'#'.repeat(level)} ${line.replace(/^\s*#{1,4}\s+/, '').trimStart()}`)
        }
        if (command === 'bulletList' || command === 'orderedList') {
          transformRawLines((line, index) => {
            const content = line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '').trimStart()
            return command === 'orderedList' ? `${index + 1}. ${content}` : `- ${content}`
          })
        }
        if (command === 'blockquote') {
          transformRawLines((line) => `> ${line.replace(/^\s*>\s?/, '').trimStart()}`)
        }
        if (command === 'horizontalRule') {
          const textarea = textareaRef.current
          if (!textarea) return
          const range = { start: textarea.selectionStart, end: textarea.selectionEnd }
          replaceRawRange(range, '\n\n---\n\n', range.start + 7, range.start + 7)
        }
      },
      [editor, mode, replaceRawRange, transformRawLines, wrapRawSelection]
    )

    const openInsertDialog = React.useCallback(
      (type: Exclude<InsertDialog, null>) => {
        if (mode === 'visual' && editor) {
          const { from, to } = editor.state.selection
          visualSelectionRef.current = { start: from, end: to }
          setDialogLabel(editor.state.doc.textBetween(from, to))
        } else {
          const textarea = textareaRef.current
          if (!textarea) return
          const range = { start: textarea.selectionStart, end: textarea.selectionEnd }
          rawSelectionRef.current = range
          setDialogLabel(currentValue.slice(range.start, range.end))
        }
        setDialogUrl('')
        setDialogError('')
        setInsertDialog(type)
      },
      [currentValue, editor, mode]
    )

    const closeInsertDialog = React.useCallback(() => {
      setInsertDialog(null)
      setDialogError('')
    }, [])

    const insertLinkOrImage = React.useCallback(() => {
      if (!insertDialog) return
      const image = insertDialog === 'image'
      const normalizedUrl = normalizeMarkdownUrl(dialogUrl)
      if (!normalizedUrl || !isSafeMarkdownUrl(normalizedUrl, image)) {
        setDialogError(image ? 'Gebruik ’n geldige https://-adres of ’n webwerfpad wat met / begin.' : 'Gebruik ’n geldige webadres, e-posskakel of webwerfpad.')
        return
      }

      const label = cleanMarkdownLabel(dialogLabel) || (image ? 'Prentjie beskrywing' : 'Skakel teks')
      closeInsertDialog()

      if (mode === 'visual' && editor) {
        const range = visualSelectionRef.current
        const chain = editor.chain().focus().deleteRange({ from: range.start, to: range.end })
        if (image) chain.setImage({ src: normalizedUrl, alt: label }).run()
        else chain.insertContent({ type: 'text', text: label, marks: [{ type: 'link', attrs: { href: normalizedUrl } }] }).run()
        return
      }

      const range = rawSelectionRef.current
      const replacement = image ? `![${label}](${normalizedUrl})` : `[${label}](${normalizedUrl})`
      replaceRawRange(range, replacement, range.start + replacement.length, range.start + replacement.length)
    }, [closeInsertDialog, dialogLabel, dialogUrl, editor, insertDialog, mode, replaceRawRange])

    const toolbarButtons = [
      { command: 'bold' as const, label: 'Vetdruk', icon: Bold, active: editor?.isActive('bold') },
      { command: 'italic' as const, label: 'Skuinsdruk', icon: Italic, active: editor?.isActive('italic') },
      { command: 'heading2' as const, label: 'Hoofopskrif', icon: Heading2, active: editor?.isActive('heading', { level: 2 }) },
      { command: 'heading3' as const, label: 'Subopskrif', icon: Heading3, active: editor?.isActive('heading', { level: 3 }) },
      { command: 'bulletList' as const, label: 'Kolpuntlys', icon: List, active: editor?.isActive('bulletList') },
      { command: 'orderedList' as const, label: 'Genommerde lys', icon: ListOrdered, active: editor?.isActive('orderedList') },
      { command: 'blockquote' as const, label: 'Aanhaling', icon: Quote, active: editor?.isActive('blockquote') },
    ]

    return (
      <div className={cn('overflow-hidden rounded-md border border-input bg-white', className)}>
        <div className="flex min-h-12 flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50 p-2">
          {toolbarButtons.map(({ command, label, icon: Icon, active }, index) => (
            <React.Fragment key={command}>
              {(index === 2 || index === 7) && <div className="mx-1 h-6 border-l border-stone-300" aria-hidden="true" />}
              <Button type="button" variant={mode === 'visual' && active ? 'secondary' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => runCommand(command)} disabled={disabled} aria-label={label} title={label} aria-pressed={mode === 'visual' ? Boolean(active) : undefined}>
                <Icon className="h-4 w-4" />
              </Button>
            </React.Fragment>
          ))}
          <div className="mx-1 h-6 border-l border-stone-300" aria-hidden="true" />
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openInsertDialog('link')} disabled={disabled} aria-label="Voeg skakel in" title="Voeg skakel in"><LinkIcon className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openInsertDialog('image')} disabled={disabled} aria-label="Voeg prentjie in" title="Voeg prentjie in"><ImageIcon className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => runCommand('horizontalRule')} disabled={disabled} aria-label="Voeg skeidslyn in" title="Voeg skeidslyn in"><Minus className="h-4 w-4" /></Button>

          <div className="ml-auto flex rounded-md border border-stone-300 bg-white p-0.5" aria-label="Redigeermodus">
            <Button type="button" size="sm" variant={mode === 'visual' ? 'secondary' : 'ghost'} className="h-8 gap-1.5 rounded-sm px-2.5" onClick={() => switchMode('visual')} aria-pressed={mode === 'visual'}><Type className="h-4 w-4" />Visueel</Button>
            <Button type="button" size="sm" variant={mode === 'markdown' ? 'secondary' : 'ghost'} className="h-8 gap-1.5 rounded-sm px-2.5" onClick={() => switchMode('markdown')} aria-pressed={mode === 'markdown'}><Braces className="h-4 w-4" />Markdown</Button>
          </div>
        </div>

        {mode === 'visual' ? (
          <div className="relative h-[28rem] overflow-y-auto bg-white md:h-[42rem]">
            {!currentValue.trim() && <p className="pointer-events-none absolute left-5 top-7 text-[15px] text-muted-foreground">{placeholder}</p>}
            <EditorContent editor={editor} className="min-h-full" />
            <Textarea {...textareaProps} ref={setTextareaRef} value={currentValue} readOnly disabled={disabled} required={false} rows={1} tabIndex={-1} aria-hidden="true" className="sr-only" />
          </div>
        ) : (
          <div>
            <div className="border-b border-stone-200 bg-stone-50/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-600">Markdown-bron</div>
            <Textarea {...textareaProps} ref={setTextareaRef} value={currentValue} onChange={(event) => updateValue(event.target.value)} onBlur={onBlur} disabled={disabled} required={required} rows={rows} placeholder={placeholder} className="h-[28rem] resize-none overflow-y-auto rounded-none border-0 bg-white px-4 py-4 font-mono text-sm leading-6 shadow-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:ring-offset-0 md:h-[42rem]" />
          </div>
        )}

        <Dialog open={insertDialog !== null} onOpenChange={(open) => { if (!open) closeInsertDialog() }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{insertDialog === 'image' ? 'Voeg prentjie in' : 'Voeg skakel in'}</DialogTitle>
              <DialogDescription>{insertDialog === 'image' ? 'Voeg die prentjie se webadres en ’n kort beskrywing by.' : 'Voeg die skakel se teks en webadres by.'}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor={linkLabelId}>{insertDialog === 'image' ? 'Prentjie beskrywing' : 'Skakel teks'}</Label>
                <Input id={linkLabelId} value={dialogLabel} onChange={(event) => setDialogLabel(event.target.value)} placeholder={insertDialog === 'image' ? 'Beskryf die prentjie' : 'Teks wat lesers sal sien'} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={linkUrlId}>Webadres</Label>
                <Input id={linkUrlId} value={dialogUrl} onChange={(event) => { setDialogUrl(event.target.value); setDialogError('') }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); insertLinkOrImage() } }} placeholder="https://..." autoFocus aria-invalid={Boolean(dialogError)} aria-describedby={dialogError ? `${linkUrlId}-error` : undefined} />
                {dialogError && <p id={`${linkUrlId}-error`} className="text-sm font-medium text-destructive">{dialogError}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeInsertDialog}>Kanselleer</Button>
              <Button type="button" onClick={insertLinkOrImage}>Voeg in</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
)

MarkdownEditor.displayName = 'MarkdownEditor'
