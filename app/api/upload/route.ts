import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAuth } from '@/lib/auth-config'

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'general'
    
    if (!file) {
      return NextResponse.json(
        { error: 'Geen lêer ontvang nie' },
        { status: 400 }
      )
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Lêer mag nie groter as 10MB wees nie' },
        { status: 400 }
      )
    }
    
    // Generate filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${type}/${timestamp}-${user.id}.${extension}`
    
    try {
      const blob = await put(filename, file, {
        access: 'public',
      })
      
      return NextResponse.json({
        url: blob.url,
        filename: blob.pathname,
      })
    } catch (error) {
      console.error('Blob upload error:', error)
      return NextResponse.json(
        { error: 'Kon nie lêer oplaai nie' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Ongemagtigde toegang' },
      { status: 401 }
    )
  }
}
