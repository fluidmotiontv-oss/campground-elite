import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Park Ranger / Guest Concierge Assistant
  app.post("/api/gemini/concierge", async (req, res) => {
    try {
      const { message, guestContext, siteInfo, history } = req.body;
      const ai = getAiClient();

      const systemInstruction = `You are "Ranger Oakley", the head digital park ranger and concierge for Whispering Pines Holiday Park & Campground.
Your tone is warm, outdoor-savvy, helpful, safety-conscious, and hospitable.
Park Rules & Context:
- Whispering Pines Holiday Park is nestled beside Emerald Lake with 28 campsites, luxury glamping domes, safari tents, and waterfront cabins.
- Quiet hours: 10:00 PM to 7:00 AM daily. Generators are strictly prohibited during quiet hours.
- Campfire rules: Campfires permitted ONLY in designated fire rings. Never leave fires unattended. Current fire danger is Moderate. Local firewood must be used to prevent pest spread (available at the camp store or via direct pitch delivery).
- Gate access: Main gate is locked 10:00 PM to 6:00 AM; use the 4-digit code provided on the guest digital pass.
- Amenities: Heated bathhouses (Loop A & C), Camp Store (Open 7:30 AM - 8:30 PM), Kayak & E-Bike Rentals at Boat Launch, Lakefront Sauna (bookings required), Dog Park at Meadowbrook Loop.
- Trash & Wildlife: Bear-proof trash receptacles located near each loop entrance. Food must never be left outside overnight.
- Guest site: ${siteInfo ? JSON.stringify(siteInfo) : 'General Guest'}
- Guest name: ${guestContext?.guestName || 'Camper'}

Provide a helpful, friendly, and practical answer. If they ask to order firewood or book an activity, explain the details and offer encouragement. Keep answers concise, clear, and formatted nicely with bullet points where appropriate.`;

      const contents = history && Array.isArray(history) && history.length > 0 
        ? [...history, { role: "user", parts: [{ text: message }] }]
        : message;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: typeof contents === 'string' ? contents : JSON.stringify(contents),
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text || "Hello camper! How can I assist you with your stay at Whispering Pines today?" });
    } catch (error: any) {
      console.error("Concierge AI Error:", error);
      res.status(500).json({ error: error?.message || "Failed to contact Park Ranger AI." });
    }
  });

  // AI Executive Yield & Dynamic Pricing Optimizer
  app.post("/api/gemini/optimizer", async (req, res) => {
    try {
      const { parkStats, weatherForecast, currentRates } = req.body;
      const ai = getAiClient();

      const prompt = `You are the Executive Revenue Management AI for Whispering Pines Campground & Holiday Park.
Analyze the current park operational metrics:
- Current Occupancy: ${parkStats?.occupancyRate || '78%'}
- Total Sites: ${parkStats?.totalSites || 28}
- Today's Revenue: $${parkStats?.todayRevenue || 3420}
- Weather Outlook: Sunny, highs of 76°F, light breeze, peak outdoor conditions for the weekend.
- Current Base Rates: ${JSON.stringify(currentRates || {})}

Provide a strategic yield management plan in JSON format with recommendations on how to optimize rates, pitch allocations, and add-on promotions to maximize RevPAC (Revenue Per Available Campsite) and guest satisfaction.

Output strict JSON only matching this schema:
{
  "summary": "High-level 2-sentence executive summary of the pricing strategy",
  "recommendedAdjustments": [
    {
      "siteType": "Glamping Domes / Waterfront Cabins",
      "action": "increase",
      "percentage": 15,
      "recommendedRate": 195,
      "reasoning": "High demand surge for lakefront luxury accommodations with perfect weekend forecast."
    },
    {
      "siteType": "Meadowbrook Tent Sites",
      "action": "bundle",
      "percentage": 0,
      "recommendedRate": 48,
      "reasoning": "Offer free bundle of seasoned firewood for 2+ night bookings to fill 4 vacant mid-week pitches."
    }
  ],
  "projectedRevenueLift": "+$1,840 (14.2% increase)",
  "promotionalIdeas": [
    "Sunset Sauna & S'mores bundle for Cabin & Dome guests",
    "Early check-in pass ($20) for arriving Friday RV guests"
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Optimizer AI Error:", error);
      res.status(500).json({ error: error?.message || "Failed to generate rate optimization." });
    }
  });

  // AI Maintenance & Incident Dispatch Triage
  app.post("/api/gemini/dispatch", async (req, res) => {
    try {
      const { incidentTitle, description, category, siteNumber } = req.body;
      const ai = getAiClient();

      const prompt = `You are the Chief Maintenance & Operations Dispatcher for a premier Holiday Park & Campground.
A new incident ticket has been submitted:
- Site/Location: Site ${siteNumber || 'General Grounds'}
- Category: ${category || 'General Maintenance'}
- Title: ${incidentTitle}
- Description: ${description}

Analyze this incident and generate triage guidance in JSON:
{
  "severity": "critical" | "high" | "medium" | "low",
  "estimatedResolutionTime": "e.g. 25 minutes",
  "assignedCrew": "Plumbing Tech" | "Electrical Specialist" | "Grounds & Tree Crew" | "Housekeeping Lead" | "Ranger On-Duty",
  "safetyImmediateAction": "Immediate step to mitigate risk (e.g., Turn off isolation valve at Loop B pedestal 12)",
  "partsAndToolsRequired": ["Item 1", "Item 2"],
  "guestCommunicationMessage": "Polite SMS update to send to guest informing them that help is en route."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Dispatch AI Error:", error);
      res.status(500).json({ error: error?.message || "Failed to generate dispatch triage." });
    }
  });

  // AI Park Broadcast & Rule Notice Generator
  app.post("/api/gemini/broadcast", async (req, res) => {
    try {
      const { topic, alertLevel } = req.body;
      const ai = getAiClient();

      const prompt = `Compose an urgent or informational park broadcast announcement for Whispering Pines Campground guests.
Topic: ${topic}
Alert Level: ${alertLevel || 'info'}

Provide JSON:
{
  "headline": "Punchy alert title",
  "message": "Clear, reassuring, actionable advice for campers (max 2-3 sentences)",
  "badgeText": "e.g. FIRE ADVISORY / WILDLIFE ALERT / PARK EVENT",
  "actionRequired": "e.g. Ensure all embers extinguished by 10 PM"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Broadcast AI Error:", error);
      res.status(500).json({ error: error?.message || "Failed to compose broadcast." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Campground OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
