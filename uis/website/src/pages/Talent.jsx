import { useMemo, useState } from "react";

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  yearsExperience: "",
  sector: "",
  englishLevel: "",
  availability: "",
  linkedin: "",
  comments: "",
  consent: false,
};

const ERROR_MESSAGES = {
  fullName: "El nombre debe contener al menos nombre y apellido",
  email: "Ingresa un email válido (ejemplo: nombre@empresa.com)",
  phone: "El teléfono debe incluir código de país (ejemplo: +34 612 345 678)",
  country: "Selecciona tu país de residencia",
  yearsExperience: "Los años de experiencia deben estar entre 0 y 50",
  sector: "Selecciona el sector de tu interés",
  englishLevel: "Indica tu nivel de inglés",
  availability: "Selecciona tu disponibilidad",
  linkedin: "Si incluyes LinkedIn, debe ser una URL válida",
  comments: "Los comentarios no pueden exceder 500 caracteres (quedan X)",
  consent: "Debes aceptar la política de tratamiento de datos para continuar",
};

const COUNTRY_OPTIONS = ["España", "Estados Unidos", "Otro"];
const SECTOR_OPTIONS = [
  "Tecnología",
  "Retail",
  "Servicios Financieros",
  "Consultoría",
  "Otro",
];
const ENGLISH_OPTIONS = ["Básico", "Intermedio", "Avanzado", "Nativo"];
const AVAILABILITY_OPTIONS = [
  "Inmediata",
  "1 mes",
  "2-3 meses",
  "Solo explorando",
];

const isValidEmail = (value) => {
  if (!value) return false;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value.trim());
};

const isValidLinkedIn = (value) => {
  if (!value) return true;
  return /^https?:\/\//i.test(value.trim());
};

const isValidPhone = (value) => /^\+\d{1,3}\s.+/.test(value.trim());

const getCommentsError = (value) => {
  const maxLength = 500;
  if (value.length <= maxLength) return "";
  const remaining = Math.max(0, maxLength - value.length);
  return ERROR_MESSAGES.comments.replace("X", remaining);
};

const validateForm = (values) => {
  const nextErrors = {};

  if (values.fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
    nextErrors.fullName = ERROR_MESSAGES.fullName;
  }

  if (!isValidEmail(values.email)) {
    nextErrors.email = ERROR_MESSAGES.email;
  }

  if (!isValidPhone(values.phone)) {
    nextErrors.phone = ERROR_MESSAGES.phone;
  }

  if (!values.country) {
    nextErrors.country = ERROR_MESSAGES.country;
  }

  const years = Number(values.yearsExperience);
  if (values.yearsExperience === "" || Number.isNaN(years) || years < 0 || years > 50) {
    nextErrors.yearsExperience = ERROR_MESSAGES.yearsExperience;
  }

  if (!values.sector) {
    nextErrors.sector = ERROR_MESSAGES.sector;
  }

  if (!values.englishLevel) {
    nextErrors.englishLevel = ERROR_MESSAGES.englishLevel;
  }

  if (!values.availability) {
    nextErrors.availability = ERROR_MESSAGES.availability;
  }

  if (!isValidLinkedIn(values.linkedin)) {
    nextErrors.linkedin = ERROR_MESSAGES.linkedin;
  }

  const commentsError = getCommentsError(values.comments);
  if (commentsError) {
    nextErrors.comments = commentsError;
  }

  if (!values.consent) {
    nextErrors.consent = ERROR_MESSAGES.consent;
  }

  return nextErrors;
};

export const Talent = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const remainingCharacters = useMemo(() => 500 - formData.comments.length, [formData.comments.length]);
  const hasErrors = Object.values(errors).some(Boolean);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;
    const nextForm = { ...formData, [name]: nextValue };

    setFormData(nextForm);

    const nextErrors = validateForm(nextForm);
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: nextErrors[name],
    }));

    if (name === "comments") {
      setErrors((currentErrors) => ({
        ...currentErrors,
        comments: nextErrors.comments || "",
      }));
    }

    if (name === "consent") {
      setErrors((currentErrors) => ({
        ...currentErrors,
        consent: nextErrors.consent || "",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);
    const nextErrors = validateForm(formData);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitted(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/talent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          yearsExperience: Number(formData.yearsExperience),
          sector: formData.sector,
          englishLevel: formData.englishLevel,
          availability: formData.availability,
          linkedin: formData.linkedin || null,
          comments: formData.comments,
          consent: formData.consent,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const apiError = errorBody?.detail?.[0]?.msg || errorBody?.detail || "No se pudo enviar la solicitud.";
        setErrors((current) => ({
          ...current,
          submit: apiError,
        }));
        setSubmitted(false);
        return;
      }

      setErrors({});
      setSubmitted(true);
    } catch (error) {
      setErrors((current) => ({
        ...current,
        submit: "No se pudo contactar con el servidor. Inténtalo de nuevo más tarde.",
      }));
      setSubmitted(false);
    }
  };

  const renderFieldError = (fieldName) => {
    if (!errors[fieldName]) {
      return null;
    }

    return (
      <p id={`${fieldName}-error`} className="mt-2 text-sm text-red-600" aria-live="polite">
        {errors[fieldName]}
      </p>
    );
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <div className="mb-8 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
        <span className="font-semibold">¿Eres una empresa buscando talento? </span>
        Escríbenos a <a href="mailto:contacto@nexova.com" className="font-semibold underline">contacto@nexova.com</a>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">
            Nexova
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Registro de talento
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Completa este formulario para unirte a nuestro banco de talento y ser contactado por nuestro equipo de selección.
          </p>
        </div>

        {submitAttempted && hasErrors && (
          <div aria-live="polite" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Corrige los campos marcados para continuar.
          </div>
        )}

        {errors.submit && (
          <div aria-live="polite" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.submit}
          </div>
        )}

        {submitted ? (
          <div aria-live="polite" className="rounded-2xl border border-green-200 bg-green-50 p-6 text-slate-800">
            <p className="text-2xl font-bold text-slate-900">¡Gracias por tu interés en Nexova!</p>
            <p className="mt-4">
              Hemos recibido tu información. Nuestro equipo de selección la revisará y te contactaremos en caso de que tu perfil encaje con alguna de nuestras oportunidades actuales o futuras.
            </p>
            <p className="mt-4">
              Mientras tanto, síguenos en LinkedIn para estar al día de nuestras vacantes y contenido sobre desarrollo profesional.
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  placeholder="Ej: Ana García"
                />
                {renderFieldError("fullName")}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  placeholder="nombre@empresa.com"
                />
                {renderFieldError("email")}
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">Teléfono</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.phone)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  placeholder="+34 612 345 678"
                />
                {renderFieldError("phone")}
              </div>

              <div>
                <label htmlFor="country" className="mb-2 block text-sm font-medium text-slate-700">País de residencia</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.country)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Selecciona una opción</option>
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {renderFieldError("country")}
              </div>

              <div>
                <label htmlFor="yearsExperience" className="mb-2 block text-sm font-medium text-slate-700">Años de experiencia</label>
                <input
                  id="yearsExperience"
                  name="yearsExperience"
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={formData.yearsExperience}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.yearsExperience)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  placeholder="0"
                />
                {renderFieldError("yearsExperience")}
              </div>

              <div>
                <label htmlFor="sector" className="mb-2 block text-sm font-medium text-slate-700">Sector de interés</label>
                <select
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.sector)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Selecciona una opción</option>
                  {SECTOR_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {renderFieldError("sector")}
              </div>

              <div>
                <label htmlFor="englishLevel" className="mb-2 block text-sm font-medium text-slate-700">Nivel de inglés</label>
                <select
                  id="englishLevel"
                  name="englishLevel"
                  value={formData.englishLevel}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.englishLevel)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Selecciona una opción</option>
                  {ENGLISH_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {renderFieldError("englishLevel")}
              </div>

              <div className="md:col-span-2">
                <fieldset>
                  <legend className="mb-2 block text-sm font-medium text-slate-700">Disponibilidad</legend>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <label key={option} className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
                        <input
                          type="radio"
                          name="availability"
                          value={option}
                          checked={formData.availability === option}
                          onChange={handleChange}
                          className="h-4 w-4 text-brand-600 focus:ring-brand-500"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {renderFieldError("availability")}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="linkedin" className="mb-2 block text-sm font-medium text-slate-700">LinkedIn (URL del perfil)</label>
                <input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.linkedin)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  placeholder="https://www.linkedin.com/in/usuario"
                />
                {renderFieldError("linkedin")}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="comments" className="mb-2 block text-sm font-medium text-slate-700">
                  Comentarios adicionales
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  rows="5"
                  value={formData.comments}
                  onChange={handleChange}
                  maxLength={500}
                  aria-invalid={Boolean(errors.comments)}
                  aria-describedby="comments-counter comments-error"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  placeholder="Cuéntanos un poco sobre tu experiencia y tus intereses profesionales."
                />
                <div id="comments-counter" className="mt-2 flex items-center justify-between text-sm text-slate-500">
                  <span>Máximo 500 caracteres</span>
                  <span>{Math.max(0, remainingCharacters)} caracteres restantes</span>
                </div>
                {renderFieldError("comments")}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Acepto política de datos</span>
              </label>
              {renderFieldError("consent")}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-brand-600 px-6 py-3 font-medium text-white transition hover:bg-brand-700"
              >
                Enviar mi candidatura
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};
