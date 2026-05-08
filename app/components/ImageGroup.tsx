export default function ImageGroup({
  title,
  images,
  type,
  selectedImages,
  onToggleImage,
}: {
  title: string;
  images: any[];
  type: "before" | "after";
  selectedImages: string[];
  onToggleImage: (publicId: string) => void;
}) {
  const styles =
    type === "before"
      ? {
          border: "border-[#c8860a]",
          header: "bg-[#c8860a]",
          bg: "bg-[#fff8e8]",
        }
      : {
          border: "border-[#2a6b3a]",
          header: "bg-[#2a6b3a]",
          bg: "bg-[#edf7ef]",
        };

  return (
    <div className={`overflow-hidden rounded-lg border-2 ${styles.border}`}>
      <div className={`${styles.header} px-4 py-2`}>
        <h4 className="font-bold text-white">{title}</h4>
      </div>

      <div className={`${styles.bg} min-h-45 p-3`}>
        {images.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Δεν υπάρχουν φωτογραφίες.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map((image) => {
              const isSelected = selectedImages.includes(image.publicId);

              return (
                <div
                  key={image.publicId}
                  onClick={() => onToggleImage(image.publicId)}
                  className={`relative cursor-pointer overflow-hidden rounded border-4 transition-all ${
                    isSelected
                      ? "border-red-600 scale-[0.98]"
                      : "border-transparent hover:border-zinc-300"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="h-40 w-full rounded object-cover"
                  />

                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded bg-red-700 px-3 py-1 text-sm font-bold text-white">
                        Επιλεγμένη
                      </span>
                    </div>
                  )}

                  <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs font-bold text-white">
                    {isSelected ? "✓" : "Επιλογή"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}