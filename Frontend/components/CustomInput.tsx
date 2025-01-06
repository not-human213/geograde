import { Control, Controller, FieldValues } from "react-hook-form";

type CustomInputProps = {
  control: Control<FieldValues>;
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  error?: { message: string };
};

const CustomInput = ({ control, name, label, placeholder, type = "text", error }: CustomInputProps) => {
  return (
    <div className="flex flex-col w-full">
      <label htmlFor={name} className="font-medium text-gray-700">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input {...field} id={name} type={type} placeholder={placeholder} className={`mt-1 p-2 border rounded-md focus:outline-none ${error ? "border-red-500" : "border-gray-300"}`} />
        )}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default CustomInput;
