import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client with required header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Assistant endpoint for military administrative operations
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { message, context, actionType, personnelData } = req.body;

    if (!apiKey || !aiClient) {
      // Fallback mock responses when API key isn't provided
      return res.json({
        success: true,
        text: generateAdministrativeFallback(actionType, message, personnelData),
        source: 'system-rule-engine',
      });
    }

    const systemInstruction = `You are COMMANDER 360 AI Administrative Advisor, an authorized military personnel administration intelligence system.
Your mission is to support military commanders and administrators (General, Brigade, Battalion, Company, Platoon, Section) in:
1. Organizing and auditing personnel rosters and strength reports (PERSTAT).
2. Generating duty schedules (Staff Duty Officer, Officer of the Day, Guard roster) with equitable rotation and zero conflict.
3. Drafting official military memorandums, letters of commendation, counseling statements, and operational announcements according to military administrative standards.
4. Analyzing equipment inventories, maintenance logs, and training readiness gaps (ACFT/fitness, weapons qualification, certifications).
5. Reviewing welfare, medical convalescence, and leave requests.

GOVERNANCE RESTRICTION: You strictly handle personnel administration, welfare, logistics, and unit scheduling. Do NOT suggest or generate combat tactics, weapons targeting, or kinetic operations. Maintain professional military decorum, high discipline, structured formatting with sections, timestamps, and actionable recommendations.`;

    const prompt = `COMMAND ACTION REQUEST:
Action Type: ${actionType || 'General Consultation'}
User Command Query: ${message}

Unit Operational Context:
${context ? JSON.stringify(context, null, 2) : 'No unit context provided'}

Current Personnel Roster Summary:
${personnelData ? JSON.stringify(personnelData, null, 2) : 'No personnel data provided'}

Please provide an authorized, highly structured, professional military administrative response, including formatted checklists or draft documents where appropriate.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      success: true,
      text: response.text || 'Directive processed with no additional remarks.',
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Return graceful fallback message
    const fallbackText = generateAdministrativeFallback(req.body.actionType, req.body.message, req.body.personnelData);
    return res.json({
      success: true,
      text: fallbackText,
      source: 'system-rule-engine-fallback',
      warning: error?.message || 'AI service transient notice',
    });
  }
});

// Helper for realistic military administrative fallbacks
function generateAdministrativeFallback(actionType?: string, query?: string, personnel?: any): string {
  if (actionType === 'duty_schedule') {
    return `### [OFFICIAL MEMORANDUM] PROPOSED 7-DAY ADMINISTRATIVE DUTY ROSTER
**AUTHORITY:** Headquarters, Unit Administration Office  
**SUBJECT:** Shift Assignment & Accountability Roster  

1. **OFFICER OF THE DAY (OD):**
   - Mon-Wed: CPT Vance, Marcus (Alpha Co CDR)
   - Thu-Fri: 1LT Sterling, Elena (1st Platoon CDR)
   - Sat-Sun: 2LT Chen, David (Executive Officer)

2. **STAFF DUTY NCO (SDNCO):**
   - Mon-Tue: MSG Rodriguez, Carlos (Operations NCOIC)
   - Wed-Thu: SFC Hayes, Donald (1st Platoon PSG)
   - Fri-Sun: SSG Miller, Bradley (Section 1 Leader)

3. **CHARGE OF QUARTERS (CQ) & BARRACKS RUNNER:**
   - Mon: SGT Walker, Travis & SPC Evans, Jordan
   - Tue: SGT Kim, Min-Jun & PFC Thorne, Caleb
   - Wed: SGT Vance, Sarah & SPC Jackson, Noah
   - Thu: CPL Washington, Andre & PFC Reed, Dylan
   - Fri: SGT Bailey, Scott & SPC Diaz, Rosa
   - Sat-Sun: CPL Foster, Liam & PFC Myers, Ethan

**ADMINISTRATIVE DIRECTIVES:**
- Primary and alternate personnel must report 30 minutes prior to shift turnover for logbook inspection and weapons accountability verification.
- Sick in quarters (SIQ) and personnel on approved leave are restricted from roster eligibility.`;
  }

  if (actionType === 'perstat_summary') {
    return `### [CONFIDENTIAL - FOR OFFICIAL USE ONLY] DAILY PERSONNEL STATUS REPORT (PERSTAT)
**REPORTING AS OF:** 0700 HOURS LOCAL  
**ECHELON:** Headquarters & Subordinate Units  

- **Total Assigned Strength:** 142 Personnel
- **Present for Duty (P):** 118 Personnel (83.1%)
- **Authorized Leave (L):** 9 Personnel (Ordinary: 6, Emergency: 1, Paternity/Maternity: 2)
- **Official Training / TDY (T):** 7 Personnel (Advanced NCO Academy: 3, CLS Certification: 4)
- **Medical Convalescence / Quarters (M):** 5 Personnel
- **Pending Administrative Action (A):** 3 Personnel

**READINESS ASSESSMENT:**
Unit readiness meets GREEN threshold. No critical MOS deficiencies observed in primary staff roles.`;
  }

  if (actionType === 'records_audit') {
    return `### [ADMINISTRATIVE AUDIT] PERSONNEL RECORD DISCREPANCY & EXPIRATION LOG
**FINDINGS:**
1. **Physical Fitness Assessment (ACFT):**
   - 4 personnel overdue for semi-annual assessment (>180 days).
   - Recommended Action: Schedule for diagnostic evaluation on upcoming training cycle.
2. **Weapons Qualification Certifications:**
   - 6 personnel require marksmanship re-certification within next 30 days.
3. **Security Clearance Renewals:**
   - SPC Reed, Dylan: Secret Clearance review due in 45 days. Packet initiated by S-1.
4. **Mandatory Cyber Awareness / Safety Briefing:**
   - 94% unit compliance. 8 individuals require refresher module completion.`;
  }

  return `### [COMMAND DIRECTIVE ACKNOWLEDGED]
**TOPIC:** ${query || 'Administrative Assessment'}

**ADMINISTRATIVE GUIDANCE:**
1. **Compliance Check:** All administrative actions must adhere strictly to Command SOP and regulatory personnel guidelines.
2. **Chain of Command Verification:** Ensure requests are routed through Section Leader -> Platoon Commander -> Company Commander before endorsement.
3. **Records Maintenance:** Updated paperwork should be filed in the Digital Service Record (201 File) with digital timestamp.`;
}

import http from 'http';

// Dev vs Prod Vite mounting
async function startServer() {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server },
        watch: isHmrDisabled ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`COMMANDER 360 Server operational on http://0.0.0.0:${PORT}`);
  });
}

startServer();
