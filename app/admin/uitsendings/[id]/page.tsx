import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { SermonVideoForm } from '../shared'

export default async function EditSermonVideoPage({ params }: { params: { id: string } }) {
  const video = await prisma.sermonVideo.findUnique({ where: { id: params.id } })

  if (!video) notFound()

  return <SermonVideoForm video={video} />
}
