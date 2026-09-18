import unittest

from fastapi.testclient import TestClient

from app.main import app


class TalentRouterTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_post_talent_accepts_valid_payload(self):
        payload = {
            "fullName": "Ana García",
            "email": "ana.garcia@empresa.com",
            "phone": "+34 612 345 678",
            "country": "España",
            "yearsExperience": 5,
            "sector": "Tecnología",
            "englishLevel": "Avanzado",
            "availability": "Inmediata",
            "linkedin": "https://www.linkedin.com/in/ana-garcia",
            "comments": "Me interesa trabajar con equipos de producto y datos.",
            "consent": True,
        }

        response = self.client.post("/talent", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "accepted")

    def test_talent_endpoint_allows_website_origin(self):
        response = self.client.options(
            "/talent",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "http://localhost:3000")


if __name__ == "__main__":
    unittest.main()
