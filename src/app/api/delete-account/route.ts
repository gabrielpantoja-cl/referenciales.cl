import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'No tienes autorización para realizar esta acción. Por favor, inicia sesión.',
          error: 'UNAUTHORIZED'
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { referenciales: true }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'No se encontró la cuenta de usuario. Por favor, contacta con soporte.',
          error: 'USER_NOT_FOUND'
        }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (user.referenciales.length > 0) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          message: 'No es posible eliminar tu cuenta debido a que tienes registros asociados. Por favor, elimina primero todos tus registros e inténtalo de nuevo.',
          error: 'HAS_ASSOCIATED_RECORDS',
          recordCount: user.referenciales.length
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await prisma.$transaction([
      prisma.account.deleteMany({ where: { userId: session.user.id } }),
      prisma.session.deleteMany({ where: { userId: session.user.id } }),
      prisma.user.delete({ where: { id: session.user.id } })
    ]);

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: 'Tu cuenta ha sido eliminada exitosamente. Gracias por usar nuestros servicios.'
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        message: 'Ocurrió un error al intentar eliminar tu cuenta. Por favor, inténtalo de nuevo más tarde.',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}