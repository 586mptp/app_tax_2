import clientPromise from "@/app/lib/MongoDB";
import { deleteImages } from "@/app/lib/Cloudinary";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const { date, publicIds } = await req.json();

    if (!date || !Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json(
        { message: "Date and publicIds are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("drastiriotites");
    const collection = db.collection("informativeBoards");

    const board = await collection.findOne({ hmerominia: date });

    if (!board) {
      return NextResponse.json(
        { message: "Board not found" },
        { status: 404 }
      );
    }

    const updatedActivities = board.activities.map((activity: any) => ({
      ...activity,
      beforeImages: activity.beforeImages.filter(
        (image: any) => !publicIds.includes(image.publicId)
      ),
      afterImages: activity.afterImages.filter(
        (image: any) => !publicIds.includes(image.publicId)
      ),
    }));

    await deleteImages(publicIds);

    await collection.updateOne(
      { hmerominia: date },
      {
        $set: {
          activities: updatedActivities,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      { message: "Images deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete images error:", error);

    return NextResponse.json(
      { message: "Failed to delete images" },
      { status: 500 }
    );
  }
}