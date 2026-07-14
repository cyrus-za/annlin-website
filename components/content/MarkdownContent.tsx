import { cn } from '@/lib/utils'
import { markdownToHtml } from '@/lib/markdown'

type MarkdownContentProps = {
  markdown: string
  className?: string
}

export function MarkdownContent({ markdown, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'break-words text-[15px] leading-7 text-stone-700',
        '[&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-stone-900',
        '[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:text-stone-900',
        '[&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-tight [&_h3]:text-stone-900',
        '[&_h4]:mb-2 [&_h4]:mt-6 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-stone-900',
        '[&_p]:my-4 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0',
        '[&_strong]:font-semibold [&_strong]:text-stone-900',
        '[&_a]:font-semibold [&_a]:text-amber-800 [&_a]:underline [&_a]:decoration-amber-700/50 [&_a]:underline-offset-4 [&_a:hover]:text-amber-950',
        '[&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6',
        '[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6',
        '[&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-700 [&_blockquote]:bg-stone-50 [&_blockquote]:px-5 [&_blockquote]:py-1 [&_blockquote]:italic',
        '[&_code]:rounded-sm [&_code]:bg-stone-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-stone-900',
        '[&_hr]:my-8 [&_hr]:border-stone-200',
        '[&_img]:mx-auto [&_img]:my-6 [&_img]:h-auto [&_img]:max-h-[34rem] [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-md [&_img]:object-contain',
        className
      )}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
    />
  )
}
