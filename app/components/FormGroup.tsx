const FormGroup = ({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) => {
  return (
    <div className={`flex flex-col gap-2 ${full ? "sm:col-span-2" : ""}`}>
      <label className="text-xs font-bold uppercase text-zinc-600">
        {label}
      </label>
      {children}
    </div>
  );
};

export default FormGroup;
