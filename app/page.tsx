"use client";

import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useState } from "react";
import CardTitle from "./components/CardTitle";
import FormGroup from "./components/FormGroup";
import UploadBox from "./components/UploadBox";
import { useRouter } from "next/navigation";

type Activity = {
  id: number;
  title: string;
  description: string;
  beforeImages: string[];
  afterImages: string[];
  beforeFiles: File[];
  afterFiles: File[];
};

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [topos, setTopos] = useState("");
  const [hmerominia, setHmerominia] = useState("");
  const [skopos, setSkopos] = useState("");

  const addActivity = () => {
    setActivities((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        description: "",
        beforeImages: [],
        afterImages: [],
        beforeFiles: [],
        afterFiles: [],
      },
    ]);
  };

  const deleteActivity = (id: number) => {
    setActivities((prev) => prev.filter((activity) => activity.id !== id));
  };

  const handleImages = async (
    id: number,
    type: "beforeImages" | "afterImages",
    files: FileList | null,
  ) => {
    if (!files) return;

    const fileArray = Array.from(files);

    const compressedFiles = await Promise.all(
      fileArray.map((file) =>
        imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        }),
      ),
    );

    const urls = compressedFiles.map((file) => URL.createObjectURL(file));

    const fileKey = type === "beforeImages" ? "beforeFiles" : "afterFiles";

    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id
          ? {
              ...activity,
              [type]: [...activity[type], ...urls],
              [fileKey]: [...activity[fileKey], ...compressedFiles],
            }
          : activity,
      ),
    );
  };

  const handleSaveAndPreview = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("topos", topos);
      formData.append("hmerominia", hmerominia);
      formData.append("skopos", skopos);

      formData.append(
        "activities",
        JSON.stringify(
          activities.map((activity) => ({
            title: activity.title,
            description: activity.description,
          })),
        ),
      );

      activities.forEach((activity, index) => {
        activity.beforeFiles.forEach((file) => {
          formData.append(`beforeImages-${index}`, file);
        });

        activity.afterFiles.forEach((file) => {
          formData.append(`afterImages-${index}`, file);
        });
      });

      const res = await fetch("/api/storeImages", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save data");
      }

      router.push(`/preview?date=${encodeURIComponent(hmerominia)}`);
    } catch (error) {
      console.error(error);
      alert("Αποτυχία αποθήκευσης.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f0e8] pb-16 font-sans text-black">
      <header className="flex items-center gap-3 bg-[#2e3328] px-5 py-4">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#c8b96e]">
          <Image
            src="/9mptax.png"
            alt="header"
            fill
            className="object-contain"
          />
        </div>

        <h1 className="text-2xl tracking-[2px] text-[#e8d99e]">
          ΕΝΗΜΕΡΩΤΙΚΟΣ ΠΙΝΑΚΑΣ
        </h1>
      </header>

      <section className="mx-auto max-w-225 px-4 py-5">
        {/* ΣΤΟΙΧΕΙΑ */}
        <div className="mb-5 rounded-lg border border-[#b0a882] bg-[#faf8f4] p-5">
          <CardTitle number="1" title="Στοιχεία Πίνακα" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormGroup label="Τόπος">
              <input
                type="text"
                placeholder="π.χ. Στρατόπεδο"
                className="input"
                value={topos}
                onChange={(e) => setTopos(e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Ημερομηνία">
              <input
                type="date"
                className="input"
                value={hmerominia}
                onChange={(e) => setHmerominia(e.target.value)}
              />
            </FormGroup>

            <FormGroup label="Σκοπός" full>
              <textarea
                rows={3}
                placeholder="Περιγραφή σκοπού..."
                className="input resize-y"
                value={skopos}
                onChange={(e) => setSkopos(e.target.value)}
              />
            </FormGroup>
          </div>
        </div>

        {/* ΔΡΑΣΤΗΡΙΟΤΗΤΕΣ */}
        <div className="mb-5 rounded-lg border border-[#b0a882] bg-[#faf8f4] p-5">
          <CardTitle number="2" title="Δραστηριότητες" />

          <div className="flex flex-col gap-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="overflow-hidden rounded-lg border border-[#b0a882] bg-white"
              >
                <div className="flex items-center justify-between bg-[#4a5240] px-4 py-3 text-lg tracking-wide text-[#e8d99e]">
                  <span>Δραστηριότητα {index + 1}</span>

                  <button
                    type="button"
                    onClick={() => deleteActivity(activity.id)}
                    className="rounded bg-[#8b2020] px-3 py-1 text-sm font-bold text-white"
                  >
                    Διαγραφή
                  </button>
                </div>

                <div className="flex flex-col gap-4 p-4">
                  <FormGroup label="Τίτλος">
                    <input
                      type="text"
                      className="input"
                      value={activity.title}
                      onChange={(e) =>
                        setActivities((prev) =>
                          prev.map((item) =>
                            item.id === activity.id
                              ? { ...item, title: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </FormGroup>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <UploadBox
                      label="Πριν"
                      tagClass="bg-[#c8860a]"
                      images={activity.beforeImages}
                      onChange={(files) =>
                        handleImages(activity.id, "beforeImages", files)
                      }
                    />

                    <UploadBox
                      label="Μετά"
                      tagClass="bg-[#2a6b3a]"
                      images={activity.afterImages}
                      onChange={(files) =>
                        handleImages(activity.id, "afterImages", files)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addActivity}
            className="mt-4 rounded-md bg-[#c8b96e] px-5 py-3 font-bold text-[#2e3328] hover:bg-[#e8d99e]"
          >
            ＋ Προσθήκη Δραστηριότητας
          </button>
        </div>

        {/* PDF */}
        <div className="rounded-lg border border-[#b0a882] bg-[#faf8f4] p-5">
          <CardTitle number="3" title="Αποθήκευση και Προεπισκόπηση" />

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleSaveAndPreview}
              disabled={loading}
              className="rounded-md bg-[#c8b96e] px-5 py-3 font-bold text-[#2e3328] hover:bg-[#e8d99e] hover:cursor-pointer disabled:opacity-60"
            >
              {loading ? "Αποθήκευση..." : "Συνέχεια στην Προεπισκόπηση"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
