import { useState } from "react";
import z from "zod";

export type LoginFormData = z.infer<typeof loginSchema>;

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("El correo electrónico no es válido")
    .toLowerCase()
    .trim(),
});

export const useLoginForm = () => {
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
  });

  const validateField = (field: keyof LoginFormData, value: string) => {
    try {
      // Validar solo el campo específico
      loginSchema.shape[field].parse(value);
      // Si no hay error, limpiar el error del campo
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.errors[0]?.message }));
        return false;
      }
      return false;
    }
  };

  const validateForm = (): boolean => {
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    errors,
    validateForm,
    validateField,
    handleChange,
    formData,
  };
};
