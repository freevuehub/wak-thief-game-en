
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Thief, ThiefAction } from '../types';
import { ACTION_DETAILS, ACTION_RESPONSE_DIALOGUES } from "../constants";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ThiefProfile {
  name: string;
  personality: string;
  background: string;
  dialogue: string[];
}

export const generateThiefProfile = async (
  name: string,
  personality: string,
  background: string
): Promise<ThiefProfile> => {
  const prompt = `
    You are a game master for a dark, noir-themed crime syndicate management game.
    You need to create a profile for a new thief.
    If any of the following fields are empty, please fill them with appropriate values:
    - Name: "${name}"
    - Personality (a single adjective tag): "${personality}"
    - Background (a short phrase tag): "${background}"

    Based on the completed profile, please generate an introductory dialogue for this thief, as if they are reporting to the boss for the first time.
    This dialogue must be **long and detailed, at least 4-5 sentences**, to make the character feel alive.
    It should reveal their personality, background, ambitions, or even a hint of anxiety.
    Please format the dialogue as an array of short sentences.

    Return ONLY a valid JSON object with the following structure:
    {
      "name": "...",
      "personality": "...",
      "background": "...",
      "dialogue": [
        "This is the first sentence.",
        "Here is the second one.",
        "And so on...",
        "This is the last sentence."
      ]
    }
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-04-17",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });
  
  let jsonStr = response.text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  
  try {
    return JSON.parse(jsonStr) as ThiefProfile;
  } catch (e) {
    console.error("Failed to parse JSON from Gemini:", e);
    return {
      name: "John Doe",
      personality: "Mysterious",
      background: "Ex-spy",
      dialogue: ["Boss, I'm here to work.", "I'll do whatever you ask.", "Just don't ask about my past."]
    };
  }
};

export const generateThiefPortrait = async (
  name: string,
  personality: string,
  background: string
): Promise<string> => {
  const prompt = `
    You are a character illustrator. Create a high-quality digital painting portrait of a character for a game. The visual style of the portrait should be **entirely dictated by the character's profile**.

    **Character Profile:**
    - **Name:** ${name}
    - **Personality:** '${personality}'
    - **Background:** '${background}'

    ---

    **CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY:**

    1.  **PERSONALITY DRIVES EXPRESSION AND MOOD:** The character's facial expression and the overall mood of the image are the top priority. They **MUST** be a direct and obvious representation of the 'Personality' tag.
        -   **If the personality is positive (e.g., 'Cheerful', 'Positive', 'Jovial', 'Laughter'), the character MUST be visibly smiling or laughing.** The entire portrait should feel bright and optimistic. A neutral or serious expression is an absolute failure in this case.
        -   If the personality is negative (e.g., 'Pessimistic', 'Gloomy'), the expression and lighting must reflect this.

    2.  **BACKGROUND DRIVES APPEARANCE:** The character's clothing and environment **MUST** reflect their 'Background' tag.
        -   For example, a 'Fisherman' should look like a fisherman, with appropriate clothing (like a beanie or weathered jacket, NOT a suit) and perhaps a hint of the sea in the background.
        -   An 'Ex-soldier' might have a disciplined posture or a specific haircut.

    3.  **DIVERSITY IS REQUIRED:** Create unique individuals. Vary gender, age, and ethnicity. Do not rely on common stereotypes or always generate middle-aged men.

    4.  **TECHNICAL DETAILS:**
        -   **Style:** Digital painting, character concept art. The style should be clean and expressive.
        -   **Framing:** Head-and-shoulders portrait.
        -   **Visibility:** The face and expression must be clear and fully visible. NO masks, NO heavy obscuring shadows.
        -   **Quality:** Clean, high-quality art. No text or watermarks.
  `;
  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: prompt,
    config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
  });

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};

interface DailyBriefing {
    narration: string;
    dialogue: string[];
}

export const generateDailyDialogue = async (
  thief: Pick<Thief, 'name' | 'personality' | 'background' | 'condition' | 'loyalty'>,
  eventSummary: string
): Promise<DailyBriefing> => {
    const prompt = `
    You are the game master of a noir crime game. One of your syndicate members has entered the office to give their morning report to the Boss.
    
    Member's Information:
    - Name: ${thief.name}
    - Personality: ${thief.personality}
    - Background: ${thief.background}
    - Current Condition: ${thief.condition}/100
    - Current Loyalty: ${thief.loyalty}/100

    Key Activity from Yesterday: ${eventSummary}

    Please generate a short background narration and the member's report dialogue for this situation.
    - The narration should briefly describe the member entering the office in 1-2 sentences. (e.g., "Rain was pouring outside. ${thief.name} entered the office, shrugging off a wet coat. A hint of exhaustion was plain on his face.")
    - The dialogue must **strongly** reflect the member's personality, background, condition, and loyalty. Make the speech style unique and not stiff. (e.g., a cynical personality might speak sarcastically, a loyal one enthusiastically).
    - If condition is below 50, the dialogue MUST include fatigue. If loyalty is below 50, it MUST include discontent.
    - Format the dialogue as an array of short sentences (at least 3 sentences).
    
    Return ONLY a valid JSON object with the following structure. Do not add any other explanations.
    {
      "narration": "...",
      "dialogue": ["...", "...", "..."]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-04-17",
    contents: prompt,
    config: { 
        responseMimeType: "application/json",
    }
  });

  try {
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    return JSON.parse(jsonStr) as DailyBriefing;
  } catch (e) {
      console.error("Failed to parse dialogue JSON from Gemini:", e);
      return {
          narration: `${thief.name} opened the office door and walked in.`,
          dialogue: ["I have something to report, Boss.", "Yesterday... nothing special happened."]
      };
  }
};


export const generateNewsReport = async (events: string[]): Promise<string> => {
  if (events.length === 0) {
    return "The city was quiet last night. Too quiet.";
  }
  
  const prompt = `
    You are a news anchor for 'KNIGHTLY NEWS' in a crime-ridden city.
    Write a short, dramatic news broadcast summarizing the events below that occurred last night.
    Keep it concise and maintain a 1940s noir style. Omit sensational descriptions or sound effects like 'static'.
    Events:
    - ${events.join('\n- ')}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-04-17",
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 0 } }
  });

  return response.text;
};

interface ActionResponse {
    responseDialogue: string;
    closingNarration: string;
}

export const generateActionResponse = async (
    thief: Pick<Thief, 'name' | 'personality' | 'loyalty'>,
    action: ThiefAction
): Promise<ActionResponse> => {
    const prompt = `
    You are the game master of a noir crime game. The Boss has just given a member an order.
    
    Member's Information:
    - Name: ${thief.name}
    - Personality: ${thief.personality}
    - Loyalty: ${thief.loyalty}/100

    Assigned Mission: ${ACTION_DETAILS[action].name}

    Please generate a short reply (1 sentence) from the member and a narration (1-2 sentences) describing their reaction.
    - Both the dialogue and narration must **strongly** reflect the member's personality and loyalty.
    - If loyalty is high, they should react happily or enthusiastically. If it's low, they should seem reluctant or disgruntled.

    Return ONLY a valid JSON object with the following structure:
    {
      "responseDialogue": "...",
      "closingNarration": "..."
    }
  `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        return JSON.parse(jsonStr) as ActionResponse;
    } catch (e) {
        console.error("Failed to generate action response:", e);
        return ACTION_RESPONSE_DIALOGUES[action];
    }
};