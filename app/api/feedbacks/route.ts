import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { name, message } = await request.json()

    const feedback = await prisma.feedback.create({
      data: {
        name,
        content: message,
        status: 'pending'
      }
    })

    return NextResponse.json(feedback)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    )
  }
}