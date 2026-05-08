const CardTitle = ({ number, title }: { number: string; title: string }) => {
  return (
    <div className="mb-5 flex items-center gap-2 border-b-2 border-[#c8b96e] pb-2 text-xl tracking-[2px]">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2e3328] text-sm text-[#c8b96e]">
        {number}
      </span>
      {title}
    </div>
  );
};

export default CardTitle;
