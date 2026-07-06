import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { SermonVideoForm } from '../shared'

export default async function EditSermonVideoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const video = await prisma.sermonVideo.findUnique({ where: { id } })

  if (!video) notFound()

  return <SermonVideoForm video={video} />
}
