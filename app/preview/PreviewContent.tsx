"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ImageGroup from "../components/ImageGroup";

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfMode, setPdfMode] = useState(false);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, publicIds: selectedImages }),
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

  const handleGeneratePdf = async () => {
    const element = pdfRef.current;

    if (!element) return;

    setPdfMode(true);
    setSelectedImages([]);

    setTimeout(async () => {
      const html2pdf = (await import("html2pdf.js")).default;

      await html2pdf()
        .set({
          margin: 10,
          filename: `drastiriotites-${date}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#f5f0e8",
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        })
        .from(element)
        .save();

      setPdfMode(false);
    }, 100);
  };

  return (
    <main
      className="min-h-screen p-6"
      style={{
        backgroundColor: "#f5f0e8",
        color: "#111111",
      }}
    >
      <section className="mx-auto max-w-5xl">
        <div
          className="mb-6 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#b0a882",
            color: "#111111",
          }}
        >
          <div>
            <h1 className="text-2xl font-bold">
              Προεπισκόπηση Δραστηριοτήτων {date}
            </h1>

            <p className="text-sm" style={{ color: "#525252" }}>
              Επιλέξτε φωτογραφίες για αφαίρεση ή δημιουργήστε PDF.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 sm:justify-end">
            <button
              type="button"
              onClick={handleDeleteSelectedImages}
              disabled={selectedImages.length === 0 || deleting}
              className="rounded px-4 py-2 text-sm font-bold hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: "#b91c1c",
                color: "#ffffff",
              }}
            >
              {deleting
                ? "Διαγραφή..."
                : `Αφαίρεση επιλεγμένων (${selectedImages.length})`}
            </button>

            <button
              type="button"
              onClick={handleGeneratePdf}
              className="rounded px-4 py-2 text-sm font-bold hover:cursor-pointer"
              style={{
                backgroundColor: "#2e3328",
                color: "#e8d99e",
              }}
            >
              Δημιουργία PDF
            </button>
          </div>
        </div>

        <div
          ref={pdfRef}
          style={{
            backgroundColor: "#f5f0e8",
            color: "#111111",
            padding: "8px",
          }}
        >
          {boards.map((board) => (
            <div
              key={board._id}
              className="mb-6 rounded-lg border p-5"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#b0a882",
                color: "#111111",
              }}
            >
              <h2 className="text-xl font-bold" style={{ color: "#111111" }}>
                {" "}
                Προεπισκόπηση Δραστηριοτήτων {date}
              </h2>
              <h2 className="text-xl font-bold" style={{ color: "#111111" }}>
                ΤΟΠΟΣ: {board.topos}
              </h2>

              <p className="mb-4 text-sm" style={{ color: "#525252" }}>
                ΣΚΟΠΟΣ: {board.skopos}
              </p>

              {board.activities.map((activity: any, index: number) => (
                <div
                  key={index}
                  className="mb-6 border-t pt-4"
                  style={{ borderColor: "#d4d4d4" }}
                >
                  <h3 className="mb-3 font-bold" style={{ color: "#111111" }}>
                    Δραστηριότητα {index + 1}: {activity.title}
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ImageGroup
                      title="ΠΡΙΝ"
                      type="before"
                      images={activity.beforeImages}
                      selectedImages={selectedImages}
                      onToggleImage={toggleImageSelection}
                      pdfMode={pdfMode}
                    />

                    <ImageGroup
                      title="ΜΕΤΑ"
                      type="after"
                      images={activity.afterImages}
                      selectedImages={selectedImages}
                      onToggleImage={toggleImageSelection}
                      pdfMode={pdfMode}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
