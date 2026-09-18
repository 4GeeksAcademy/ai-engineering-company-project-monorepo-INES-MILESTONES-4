from fastapi import APIRouter
from pydantic import BaseModel, EmailStr, Field, field_validator

router = APIRouter(tags=["talent"])


class TalentSubmission(BaseModel):
    fullName: str = Field(..., min_length=2)
    email: EmailStr
    phone: str
    country: str
    yearsExperience: int = Field(..., ge=0, le=50)
    sector: str
    englishLevel: str
    availability: str
    linkedin: str | None = None
    comments: str = ""
    consent: bool = Field(...)

    @field_validator("fullName")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        if len(value.strip().split()) < 2:
            raise ValueError("El nombre debe contener al menos nombre y apellido")
        return value.strip()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not value or not value.startswith("+"):
            raise ValueError("El teléfono debe incluir código de país (ejemplo: +34 612 345 678)")
        return value.strip()

    @field_validator("country")
    @classmethod
    def validate_country(cls, value: str) -> str:
        if not value:
            raise ValueError("Selecciona tu país de residencia")
        return value.strip()

    @field_validator("sector")
    @classmethod
    def validate_sector(cls, value: str) -> str:
        if not value:
            raise ValueError("Selecciona el sector de tu interés")
        return value.strip()

    @field_validator("englishLevel")
    @classmethod
    def validate_english_level(cls, value: str) -> str:
        if not value:
            raise ValueError("Indica tu nivel de inglés")
        return value.strip()

    @field_validator("availability")
    @classmethod
    def validate_availability(cls, value: str) -> str:
        if not value:
            raise ValueError("Selecciona tu disponibilidad")
        return value.strip()

    @field_validator("linkedin")
    @classmethod
    def validate_linkedin(cls, value: str | None) -> str | None:
        if value is None or value == "":
            return None
        if not value.startswith(("http://", "https://")):
            raise ValueError("Si incluyes LinkedIn, debe ser una URL válida")
        return value.strip()

    @field_validator("comments")
    @classmethod
    def validate_comments(cls, value: str) -> str:
        if len(value) > 500:
            raise ValueError("Los comentarios no pueden exceder 500 caracteres (quedan X)")
        return value.strip()

    @field_validator("consent")
    @classmethod
    def validate_consent(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Debes aceptar la política de tratamiento de datos para continuar")
        return value


@router.post("/talent")
def submit_talent(payload: TalentSubmission):
    return {
        "status": "accepted",
        "message": "¡Gracias por tu interés en Nexova!",
        "data": {
            "fullName": payload.fullName,
            "email": payload.email,
            "country": payload.country,
        },
    }
