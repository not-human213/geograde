import { NextApiRequest, NextApiResponse } from "next";

const BACKEND_BASE_URL = "http://127.0.0.1:8000"; // Your backend's IP and port

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { latitude, longitude, UType } = req.query;

  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/calculate-score/?latitude=${latitude}&longitude=${longitude}&UType=${UType}`,
      {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error proxying request to backend:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
