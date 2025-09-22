import React from 'react';
interface FormFieldProps {
  label: string;
  htmlFor?: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  helper,
  error,
  children,
  required
}) => {
  return (
    <label className="flex flex-col gap-2 text-sm" htmlFor={htmlFor}>
      <span className="font-medium text-ink">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      {children}
      <div className="min-h-[1.25rem]">
        {error ? (
          <p className="text-xs text-danger font-medium">{error}</p>
        ) : helper ? (
          <p className="text-xs text-muted">{helper}</p>
        ) : null}
      </div>
    </label>
  );
};

export default FormField;
