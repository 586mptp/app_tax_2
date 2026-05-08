// app/preview/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ImageGroup from "../components/ImageGroup";

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");

  const [boards, setBoards] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const toggleImageSelection = (publicId: string) => {
    setSelectedImages((prev) =>
      prev.includes(publicId)
        ? prev.filter((id) => id !== publicId)
        : [...prev, publicId],
    );
  };
  const handleDeleteSelectedImages = async () => {
    if (!date || selectedImages.length === 0) return;

    try {
      setDeleting(true);

      const res = await fetch("/api/deleteImages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          publicIds: selectedImages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete images");
      }

      setBoards((prev) =>
        prev.map((board) => ({
          ...board,
          activities: board.activities.map((activity: any) => ({
            ...activity,
            beforeImages: activity.beforeImages.filter(
              (image: any) => !selectedImages.includes(image.publicId),
            ),
            afterImages: activity.afterImages.filter(
              (image: any) => !selectedImages.includes(image.publicId),
            ),
          })),
        })),
      );

      setSelectedImages([]);
    } catch (error) {
      console.error(error);
      alert("Αποτυχία διαγραφής εικόνων.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!date) return;

    const fetchBoards = async () => {
      const res = await fetch(
        `/api/boardsByDate?date=${encodeURIComponent(date)}`,
      );
      const data = await res.json();

      if (res.ok) {
        setBoards(data.boards);
      }
    };

    fetchBoards();
  }, [date]);

  return (
    <main className="min-h-screen bg-[#f5f0e8] p-6">
      <section className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold">
          Προεπισκόπηση Δραστηριοτήτων {date}
        </h1>

        {boards.map((board) => (
          <div
            key={board._id}
            className="mb-6 rounded-lg border border-[#b0a882] bg-white p-5"
          >
            <h2 className="text-xl font-bold">{board.topos}</h2>
            <p className="mb-4 text-sm text-zinc-600">{board.skopos}</p>

            {board.activities.map((activity: any, index: number) => (
              <div key={index} className="mb-6 border-t pt-4">
                <h3 className="mb-3 font-bold">
                  Δραστηριότητα {index + 1}: {activity.title}
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ImageGroup
                    title="ΠΡΙΝ"
                    type="before"
                    images={activity.beforeImages}
                    selectedImages={selectedImages}
                    onToggleImage={toggleImageSelection}
                  />

                  <ImageGroup
                    title="ΜΕΤΑ"
                    type="after"
                    images={activity.afterImages}
                    selectedImages={selectedImages}
                    onToggleImage={toggleImageSelection}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
        <button
          type="button"
          onClick={handleDeleteSelectedImages}
          disabled={selectedImages.length === 0 || deleting}
          className="rounded bg-red-700 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deleting
            ? "Διαγραφή..."
            : `Αφαίρεση επιλεγμένων (${selectedImages.length})`}
        </button>
      </section>
    </main>
  );
}
