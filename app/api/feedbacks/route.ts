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
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { error: `Failed to submit feedback: ${error instanceof Error ? error.message : 'Unknown error'}` },
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
    console.error('Error fetching feedbacks:', error)
    return NextResponse.json(
      { error: `Failed to fetch feedbacks: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}