
export interface GridAction {
    type: 'set_height' | 'set_color' | 'clear' | 'message' | 'spawn_text' | 'draw_line' | 'draw_area' | 'draw_ring';
    u?: number;
    v?: number;
    u2?: number; // End coord for lines
    v2?: number;
    radius?: number; // For circles/areas
    height?: number;
    color?: string;
    text?: string;
}

export interface MistralResponse {
    actions: GridAction[];
}

const SYSTEM_PROMPT = `You are the AI Architect of a Cyberpunk Hexagonal Grid.
You have access to powerful Architect Tools to shape the world instantly.

PRIMITIVE COMMANDS (High Priority - Use these!):
1. draw_area(u, v, radius, height, color): Create a solid hexagonal platform/base.
2. draw_ring(u, v, radius, height, color): Create a hollow wall/fence around a center.
3. draw_line(u, v, u2, v2, height, color): Draw a straight wall, road, or bridge between two points.
4. spawn_text(u, v, text, color): Place a floating 3D label.

ATOMIC COMMANDS (Low Priority - Use for details):
5. set_height(u, v, height): Modify single hex.
6. set_color(u, v, color): Paint single hex.

UTILITY:
7. clear(): Wipe the grid clean.
8. message(text): Talk to the user.

RULES:
- 0,0 is the center.
- Colors are Hex Strings (e.g. '#00ff00').
- Height: 0.1 (flat) to 20 (high).
- ALWAYS prefer 'draw_' commands over listing 50 hexes manually.
- Reply ONLY with valid JSON: { "actions": [ ... ] }
`;

export class MistralService {
    private apiKey: string;
    private history: { role: 'system' | 'user' | 'assistant', content: string }[] = [];

    constructor() {
        this.apiKey = import.meta.env.VITE_MISTRAL_API_KEY || '';
        this.history.push({ role: 'system', content: SYSTEM_PROMPT });
    }

    async sendMessage(message: string): Promise<MistralResponse> {
        if (!this.apiKey) {
            return {
                actions: [{ type: 'message', text: 'Error: No API Key found. Please set VITE_MISTRAL_API_KEY in .env' }]
            };
        }

        this.history.push({ role: 'user', content: message });

        try {
            const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'mistral-medium',
                    messages: this.history,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            console.log('[MistralService] Raw Response:', content);

            this.history.push({ role: 'assistant', content });

            try {
                const parsed = JSON.parse(content);
                return parsed as MistralResponse;
            } catch (e) {
                console.error("Failed to parse AI JSON response", content);
                return { actions: [{ type: 'message', text: "I understood, but I failed to format the grid commands correctly." }] };
            }

        } catch (error) {
            console.error(error);
            return { actions: [{ type: 'message', text: `Error: ${(error as Error).message}` }] };
        }
    }
}
