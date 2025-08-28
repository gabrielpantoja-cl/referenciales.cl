import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const docPath = params.path.join('/');
    const filePath = join(process.cwd(), 'docs', `${docPath}.md`);
    
    const content = await readFile(filePath, 'utf-8');
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error reading documentation file:', error);
    return new NextResponse('Documento no encontrado', { status: 404 });
  }
}