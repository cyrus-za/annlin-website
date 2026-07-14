'use client'

import * as React from 'react'
import {
  Bold,
  Eye,
  FilePenLine,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
} from 'lucide-react'

import { MarkdownContent } from '@/components/content/MarkdownContent'
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
import { isSafeMarkdownUrl, normalizeMarkdownUrl } from '@/lib/markdown'
import { cn } from '@/lib/utils'

type MarkdownEditorProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'defaultValue' | 'onChange' | 'value'
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

type InsertDialog = 'link' | 'image' | null

type SelectionRange = {
  start: number
  end: number
}

function toolbarButtonLabel(label: string, shortcut?: string) {
  return shortcut ? `${label} (${shortcut})` : label
}

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
      rows = 18,
      ...textareaProps
    },
    forwardedRef
  ) => {
    const controlled = value !== undefined
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const [mobileMode, setMobileMode] = React.useState<'write' | 'preview'>('write')
    const [insertDialog, setInsertDialog] = React.useState<InsertDialog>(null)
    const [dialogLabel, setDialogLabel] = React.useState('')
    const [dialogUrl, setDialogUrl] = React.useState('')
    const [dialogError, setDialogError] = React.useState('')
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const dialogSelectionRef = React.useRef<SelectionRange>({ start: 0, end: 0 })
    const linkLabelId = React.useId()
    const linkUrlId = React.useId()
    const currentValue = controlled ? value : internalValue
    const deferredValue = React.useDeferredValue(currentValue)

    const setTextareaRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node

        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef) {
          forwardedRef.current = node
        }
      },
      [forwardedRef]
    )

    const updateValue = React.useCallback(
      (nextValue: string) => {
        if (!controlled) {
          setInternalValue(nextValue)
        }
        onValueChange?.(nextValue)
      },
      [controlled, onValueChange]
    )

    const replaceRange = React.useCallback(
      (range: SelectionRange, replacement: string, selectionStart: number, selectionEnd: number) => {
        const nextValue = `${currentValue.slice(0, range.start)}${replacement}${currentValue.slice(range.end)}`
        updateValue(nextValue)

        requestAnimationFrame(() => {
          const textarea = textareaRef.current
          if (!textarea) return
          textarea.focus()
          textarea.setSelectionRange(selectionStart, selectionEnd)
        })
      },
      [currentValue, updateValue]
    )

    const wrapSelection = React.useCallback(
      (before: string, after: string, placeholder: string) => {
        const textarea = textareaRef.current
        if (!textarea) return

        setMobileMode('write')
        const range = { start: textarea.selectionStart, end: textarea.selectionEnd }
        const selectedText = currentValue.slice(range.start, range.end)
        const content = selectedText || placeholder
        const replacement = `${before}${content}${after}`
        const selectionStart = range.start + before.length
        const selectionEnd = selectionStart + content.length

        replaceRange(range, replacement, selectionStart, selectionEnd)
      },
      [currentValue, replaceRange]
    )

    const transformSelectedLines = React.useCallback(
      (transform: (line: string, index: number) => string) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const selectionStart = textarea.selectionStart
        const selectionEnd = textarea.selectionEnd
        setMobileMode('write')
        const lineStart = currentValue.lastIndexOf('\n', Math.max(0, selectionStart - 1)) + 1
        const nextLineBreak = currentValue.indexOf('\n', selectionEnd)
        const lineEnd = nextLineBreak === -1 ? currentValue.length : nextLineBreak
        const range = { start: lineStart, end: lineEnd }
        const replacement = currentValue
          .slice(lineStart, lineEnd)
          .split('\n')
          .map(transform)
          .join('\n')

        replaceRange(range, replacement, lineStart, lineStart + replacement.length)
      },
      [currentValue, replaceRange]
    )

    const addHeading = React.useCallback(
      (level: 2 | 3) => {
        transformSelectedLines((line) => {
          const content = line.replace(/^\s*#{1,4}\s+/, '').trimStart()
          return content ? `${'#'.repeat(level)} ${content}` : `${'#'.repeat(level)} `
        })
      },
      [transformSelectedLines]
    )

    const addList = React.useCallback(
      (ordered: boolean) => {
        transformSelectedLines((line, index) => {
          const content = line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, '').trimStart()
          if (!content) return ordered ? `${index + 1}. ` : '- '
          return ordered ? `${index + 1}. ${content}` : `- ${content}`
        })
      },
      [transformSelectedLines]
    )

    const addQuote = React.useCallback(() => {
      transformSelectedLines((line) => {
        const content = line.replace(/^\s*>\s?/, '').trimStart()
        return content ? `> ${content}` : '> '
      })
    }, [transformSelectedLines])

    const addHorizontalRule = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      setMobileMode('write')
      const range = { start: textarea.selectionStart, end: textarea.selectionEnd }
      const needsLeadingBreak = range.start > 0 && !currentValue.slice(0, range.start).endsWith('\n\n')
      const needsTrailingBreak = range.end < currentValue.length && !currentValue.slice(range.end).startsWith('\n\n')
      const replacement = `${needsLeadingBreak ? '\n\n' : ''}---${needsTrailingBreak ? '\n\n' : ''}`
      const cursor = range.start + replacement.length

      replaceRange(range, replacement, cursor, cursor)
    }, [currentValue, replaceRange])

    const openInsertDialog = React.useCallback(
      (type: Exclude<InsertDialog, null>) => {
        const textarea = textareaRef.current
        if (!textarea) return

        setMobileMode('write')
        const range = { start: textarea.selectionStart, end: textarea.selectionEnd }
        dialogSelectionRef.current = range
        setDialogLabel(currentValue.slice(range.start, range.end))
        setDialogUrl('')
        setDialogError('')
        setInsertDialog(type)
      },
      [currentValue]
    )

    const closeInsertDialog = React.useCallback(() => {
      setInsertDialog(null)
      setDialogError('')
    }, [])

    const insertLinkOrImage = React.useCallback(() => {
      if (!insertDialog) return

      const image = insertDialog === 'image'
      const normalizedUrl = normalizeMarkdownUrl(dialogUrl)

      if (!normalizedUrl) {
        setDialogError('Voer asseblief ’n webadres in.')
        return
      }

      if (!isSafeMarkdownUrl(normalizedUrl, image)) {
        setDialogError(
          image
            ? 'Gebruik ’n geldige https://-adres of ’n webwerfpad wat met / begin.'
            : 'Gebruik ’n geldige webadres, e-posskakel of webwerfpad.'
        )
        return
      }

      const range = dialogSelectionRef.current
      const fallbackLabel = image ? 'Prentjie beskrywing' : 'Skakel teks'
      const label = cleanMarkdownLabel(dialogLabel) || fallbackLabel
      const replacement = image
        ? `![${label}](${normalizedUrl})`
        : `[${label}](${normalizedUrl})`
      const cursor = range.start + replacement.length

      closeInsertDialog()
      replaceRange(range, replacement, cursor, cursor)
    }, [closeInsertDialog, dialogLabel, dialogUrl, insertDialog, replaceRange])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!(event.metaKey || event.ctrlKey)) return

        const key = event.key.toLowerCase()
        if (key === 'b') {
          event.preventDefault()
          wrapSelection('**', '**', 'vet teks')
        } else if (key === 'i') {
          event.preventDefault()
          wrapSelection('*', '*', 'skuins teks')
        } else if (key === 'k') {
          event.preventDefault()
          openInsertDialog('link')
        }
      },
      [openInsertDialog, wrapSelection]
    )

    return (
      <div className={cn('overflow-hidden rounded-md border border-input bg-white', className)}>
        <div className="flex min-h-12 flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50 p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => wrapSelection('**', '**', 'vet teks')}
            disabled={disabled}
            aria-label={toolbarButtonLabel('Vetdruk', '⌘B')}
            title={toolbarButtonLabel('Vetdruk', '⌘B')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => wrapSelection('*', '*', 'skuins teks')}
            disabled={disabled}
            aria-label={toolbarButtonLabel('Skuinsdruk', '⌘I')}
            title={toolbarButtonLabel('Skuinsdruk', '⌘I')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="mx-1 h-6 border-l border-stone-300" aria-hidden="true" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => addHeading(2)}
            disabled={disabled}
            aria-label="Hoofopskrif"
            title="Hoofopskrif"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => addHeading(3)}
            disabled={disabled}
            aria-label="Subopskrif"
            title="Subopskrif"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => addList(false)}
            disabled={disabled}
            aria-label="Kolpuntlys"
            title="Kolpuntlys"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => addList(true)}
            disabled={disabled}
            aria-label="Genommerde lys"
            title="Genommerde lys"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={addQuote}
            disabled={disabled}
            aria-label="Aanhaling"
            title="Aanhaling"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <div className="mx-1 h-6 border-l border-stone-300" aria-hidden="true" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => openInsertDialog('link')}
            disabled={disabled}
            aria-label={toolbarButtonLabel('Voeg skakel in', '⌘K')}
            title={toolbarButtonLabel('Voeg skakel in', '⌘K')}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => openInsertDialog('image')}
            disabled={disabled}
            aria-label="Voeg prentjie in"
            title="Voeg prentjie in"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={addHorizontalRule}
            disabled={disabled}
            aria-label="Voeg skeidslyn in"
            title="Voeg skeidslyn in"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <div className="ml-auto flex rounded-md border border-stone-300 bg-white p-0.5 md:hidden">
            <Button
              type="button"
              size="sm"
              variant={mobileMode === 'write' ? 'secondary' : 'ghost'}
              className="h-8 gap-2 rounded-sm px-3"
              onClick={() => setMobileMode('write')}
              aria-pressed={mobileMode === 'write'}
            >
              <FilePenLine className="h-4 w-4" />
              Skryf
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mobileMode === 'preview' ? 'secondary' : 'ghost'}
              className="h-8 gap-2 rounded-sm px-3"
              onClick={() => setMobileMode('preview')}
              aria-pressed={mobileMode === 'preview'}
            >
              <Eye className="h-4 w-4" />
              Voorskou
            </Button>
          </div>
        </div>

        <div className="md:grid md:grid-cols-2">
          <div className={cn('min-w-0', mobileMode !== 'write' && 'hidden md:block')}>
            <div className="border-b border-stone-200 bg-stone-50/50 px-4 py-2 text-xs font-semibold uppercase text-stone-600 md:block">
              Skryf
            </div>
            <Textarea
              {...textareaProps}
              ref={setTextareaRef}
              value={currentValue}
              onChange={(event) => updateValue(event.target.value)}
              onBlur={onBlur}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              rows={rows}
              className="min-h-[28rem] resize-y rounded-none border-0 bg-white px-4 py-4 text-[15px] leading-7 shadow-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:ring-offset-0"
            />
          </div>

          <div
            className={cn(
              'min-w-0 bg-white md:block md:border-l md:border-stone-200',
              mobileMode !== 'preview' && 'hidden md:block'
            )}
          >
            <div className="border-b border-stone-200 bg-stone-50/50 px-4 py-2 text-xs font-semibold uppercase text-stone-600">
              Voorskou
            </div>
            <div className="min-h-[28rem] overflow-y-auto p-5 md:max-h-[42rem]">
              {deferredValue.trim() ? (
                <MarkdownContent markdown={deferredValue} />
              ) : (
                <p className="text-sm text-muted-foreground">Nog geen inhoud nie.</p>
              )}
            </div>
          </div>
        </div>

        <Dialog
          open={insertDialog !== null}
          onOpenChange={(open) => {
            if (!open) closeInsertDialog()
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {insertDialog === 'image' ? 'Voeg prentjie in' : 'Voeg skakel in'}
              </DialogTitle>
              <DialogDescription>
                {insertDialog === 'image'
                  ? 'Voeg die prentjie se webadres en ’n kort beskrywing by.'
                  : 'Voeg die skakel se teks en webadres by.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor={linkLabelId}>
                  {insertDialog === 'image' ? 'Prentjie beskrywing' : 'Skakel teks'}
                </Label>
                <Input
                  id={linkLabelId}
                  value={dialogLabel}
                  onChange={(event) => setDialogLabel(event.target.value)}
                  placeholder={insertDialog === 'image' ? 'Beskryf die prentjie' : 'Teks wat lesers sal sien'}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={linkUrlId}>Webadres</Label>
                <Input
                  id={linkUrlId}
                  value={dialogUrl}
                  onChange={(event) => {
                    setDialogUrl(event.target.value)
                    setDialogError('')
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      insertLinkOrImage()
                    }
                  }}
                  placeholder="https://..."
                  autoFocus
                  aria-invalid={Boolean(dialogError)}
                  aria-describedby={dialogError ? `${linkUrlId}-error` : undefined}
                />
                {dialogError ? (
                  <p id={`${linkUrlId}-error`} className="text-sm font-medium text-destructive">
                    {dialogError}
                  </p>
                ) : null}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeInsertDialog}>
                Kanselleer
              </Button>
              <Button type="button" onClick={insertLinkOrImage}>
                Voeg in
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
)

MarkdownEditor.displayName = 'MarkdownEditor'
