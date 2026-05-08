const UploadBox = ({
  label,
  images,
  tagClass,
  onChange,
}: {
  label: string;
  images: string[];
  tagClass: string;
  onChange: (files: FileList | null) => void;
}) => {
  return (
    <div className="relative flex min-h-30 flex-wrap items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed border-[#b0a882] bg-[#f5f0e8] p-2">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => onChange(e.target.files)}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />

      <div className="flex w-full flex-wrap items-center justify-center gap-2 text-center text-sm text-zinc-600">
        <span
          className={`rounded px-2 py-1 text-xs font-bold text-white ${tagClass}`}
        >
          {label}
        </span>

        {images.length === 0 && <span>Προσθήκη φωτογραφιών</span>}

        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`${label} ${index + 1}`}
            className="relative z-0 h-15 w-15 rounded object-cover"
          />
        ))}
      </div>
    </div>
  );
};
export default UploadBox;