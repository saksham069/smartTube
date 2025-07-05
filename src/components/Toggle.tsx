type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
};

const Toggle = ({ label, checked, onChange }: ToggleProps) => {
  return (
    <div className="flex justify-between items-center w-full">
      <span className="text-sm">{label}</span>
      <button
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
          checked ? "bg-blue-500" : "bg-zinc-400"
        }`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};

export default Toggle;
