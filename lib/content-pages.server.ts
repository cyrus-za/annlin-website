import { prisma } from '@/lib/db'
import {
  getContentPageDefinition,
  mergeContentPageSections,
  type ContentPageDefinition,
} from '@/lib/content-page-definitions'

export interface ResolvedContentPage {
  definition: ContentPageDefinition
  title: string
  description: string
  sections: Record<string, unknown>
}

export async function getPublicContentPage(slug: string): Promise<ResolvedContentPage> {
  const definition = getContentPageDefinition(slug)
  if (!definition) throw new Error(`Unknown content page: ${slug}`)

  try {
    const page = await prisma.contentPage.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
      },
    })

    return {
      definition,
      title: page?.title || definition.title,
      description: page?.description || definition.description,
      sections: mergeContentPageSections(definition, page?.sections),
    }
  } catch (error) {
    console.error(`Could not load public content page ${slug}:`, error)
    return {
      definition,
      title: definition.title,
      description: definition.description,
      sections: mergeContentPageSections(definition, undefined),
    }
  }
}
