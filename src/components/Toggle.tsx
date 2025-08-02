type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
};

const Toggle = ({ label, checked, onChange }: ToggleProps) => {
  return (
    <div className="flex justify-between items-center w-full">
      <span className="text-xl font-medium">{label}</span>
      <button
        className={`w-16 h-9 flex items-center rounded-full p-1 transition-colors duration-200 ${checked ? "bg-blue-500" : "bg-zinc-400"
          }`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <div
          className={`bg-white w-7 h-7 rounded-full shadow-md transform transition-transform duration-200 ${checked ? "translate-x-7" : "translate-x-0"
            }`}
        />
      </button>
    </div>
  );
};

export default Toggle;
