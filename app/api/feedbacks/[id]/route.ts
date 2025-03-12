import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()

    const feedback = await prisma.feedback.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Error updating feedback status:', error)
    return NextResponse.json(
      { error: `Failed to update feedback status: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}