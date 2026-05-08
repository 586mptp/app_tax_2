// app/api/boardsByDate/route.ts

import clientPromise from "@/app/lib/MongoDB";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { message: "Date is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("drastiriotites");

    console.log("Searching date:", date);
    
    const boards = await db
      .collection("informativeBoards")
      .find({ hmerominia: date })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ boards }, { status: 200 });
  } catch (error) {
    console.error("Fetch boards by date error:", error);

    return NextResponse.json(
      { message: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}