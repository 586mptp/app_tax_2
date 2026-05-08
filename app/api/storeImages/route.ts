import { InformativeBoard } from "@/app/constants/types";
import { uploadImages } from "@/app/lib/Cloudinary";
import clientPromise from "@/app/lib/MongoDB";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const topos = formData.get("topos") as string;
    const hmerominia = formData.get("hmerominia") as string;
    const skopos = formData.get("skopos") as string;
    const activitiesRaw = formData.get("activities") as string;

    if (!topos || !hmerominia || !skopos || !activitiesRaw) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const activities = JSON.parse(activitiesRaw);

    const storedActivities = await Promise.all(
      activities.map(async (activity: any, activityIndex: number) => {
        const beforeImages = await uploadImages(
          formData.getAll(`beforeImages-${activityIndex}`) as File[],
          `drastiriotites/${hmerominia}/before`
        );

        const afterImages = await uploadImages(
          formData.getAll(`afterImages-${activityIndex}`) as File[],
          `drastiriotites/${hmerominia}/after`
        );

        return {
          title: activity.title,
          description: activity.description,
          beforeImages,
          afterImages,
        };
      })
    );

    const client = await clientPromise;
    const db = client.db("drastiriotites");
    const collection = db.collection<InformativeBoard>("informativeBoards");

    const existingBoard = await collection.findOne({ hmerominia });

    if (existingBoard) {
      await collection.updateOne(
        { hmerominia },
        {
          $push: {
            activities: {
              $each: storedActivities,
            },
          },
          $set: {
            topos,
            skopos,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json(
        {
          message: "Board updated successfully",
          date: hmerominia,
        },
        { status: 200 }
      );
    }

    const result = await collection.insertOne({
      topos,
      hmerominia,
      skopos,
      activities: storedActivities,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Board created successfully",
        insertedId: result.insertedId.toString(),
        date: hmerominia,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Store images error:", error);

    return NextResponse.json(
      { message: "Failed to store data" },
      { status: 500 }
    );
  }
}