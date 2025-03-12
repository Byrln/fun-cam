import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: `Failed to fetch photos: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    const photo = await prisma.photo.create({
      data: {
        imageUrl,
      },
    });
    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error creating photo:', error);
    return NextResponse.json({ error: `Failed to create photo: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}