export default function ImageGroup({
  title,
  images,
  type,
  selectedImages,
  onToggleImage,
  pdfMode = false,
}: {
  title: string;
  images: any[];
  type: "before" | "after";
  selectedImages: string[];
  onToggleImage: (publicId: string) => void;
  pdfMode?: boolean;
}) {
  const styles =
    type === "before"
      ? {
          border: "#c8860a",
          header: "#c8860a",
          bg: "#fff8e8",
        }
      : {
          border: "#2a6b3a",
          header: "#2a6b3a",
          bg: "#edf7ef",
        };

  return (
    <div
      className="overflow-hidden rounded-lg border-2"
      style={{ borderColor: styles.border }}
    >
      <div className="px-4 py-2" style={{ backgroundColor: styles.header }}>
        <h4 className="font-bold" style={{ color: "#ffffff" }}>
          {title}
        </h4>
      </div>

      <div className="min-h-45 p-3" style={{ backgroundColor: styles.bg }}>
        {images.length === 0 ? (
          <p className="text-sm" style={{ color: "#717171" }}>
            Δεν υπάρχουν φωτογραφίες.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map((image) => {
              const isSelected = selectedImages.includes(image.publicId);

              return (
                <div
                  key={image.publicId}
                  onClick={() => {
                    if (!pdfMode) {
                      onToggleImage(image.publicId);
                    }
                  }}
                  className={`relative overflow-hidden rounded border-4 transition-all ${
                    pdfMode ? "" : "cursor-pointer"
                  }`}
                  style={{
                    borderColor:
                      !pdfMode && isSelected
                        ? "#dc2626"
                        : "transparent",
                    transform:
                      !pdfMode && isSelected
                        ? "scale(0.98)"
                        : "scale(1)",
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    crossOrigin="anonymous"
                    className="h-40 w-full rounded object-cover"
                  />

                  {!pdfMode && isSelected && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                    >
                      <span
                        className="rounded px-3 py-1 text-sm font-bold"
                        style={{
                          backgroundColor: "#b91c1c",
                          color: "#ffffff",
                        }}
                      >
                        Επιλεγμένη
                      </span>
                    </div>
                  )}

                  {!pdfMode && (
                    <div
                      className="absolute right-2 top-2 rounded px-2 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "#ffffff",
                      }}
                    >
                      {isSelected ? "✓" : "Επιλογή"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}