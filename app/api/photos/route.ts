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
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to create photo" }, { status: 500 });
  }
}