import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const photo = await prisma.photo.delete({
      where: {
        id: params.id
      }
    })
    return NextResponse.json(photo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}