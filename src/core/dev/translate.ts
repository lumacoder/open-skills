import * as fs from 'node:fs';
import * as path from 'node:path';

function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!process.env[key]) process.env[key] = value;
        }
      });
    }
  } catch (e) {
    // ignore
  }
}
loadEnv();

export async function translateToChinese(text: string): Promise<string> {
  if (!text) return text;
  // If it already contains Chinese characters, return as is.
  if (/[\u4e00-\u9fa5]/.test(text)) {
    return text;
  }
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${encodeURIComponent(text)}`;
    // Using global fetch
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        return data[0].map((item: any) => item[0]).join('');
      }
    }
  } catch (e) {
    // ignore error, fallback to original text
  }
  return text;
}

export async function generateTagsWithLLM(name: string, description: string): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return []; // Fallback gracefully if no env config
  
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'system',
          content: 'You are an AI assistant that extracts up to 5 concise technical tags (e.g. react, ui, frontend, agent) for a given software skill. Output ONLY a comma-separated list of tags in lowercase. No extra text, no quotes.'
        }, {
          role: 'user',
          content: `Skill name: ${name}\nDescription: ${description}`
        }],
        temperature: 0.3
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      return content.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean);
    }
  } catch (e) {
    // ignore
  }
  return [];
}
