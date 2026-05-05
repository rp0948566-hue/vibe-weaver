import type { ChatMessage } from "@/services/aiRouter";

export const IMAGE_ANALYSIS_PROMPT = `You are a pixel-perfect design engineer with expert vision.
The user has provided a design image. Analyze it with extreme precision.

EXTRACT AND REPORT:
1. Every color used (exact hex codes)
2. Typography (font sizes, weights, line heights, letter spacing)
3. Spacing (padding, margin, gap values — estimate in px/rem)
4. Border radius values
5. Shadow styles
6. Layout structure (grid, flexbox, columns)
7. Every component visible (navbar, cards, buttons, inputs, etc)
8. Animations you can infer from the design
9. Overall aesthetic and design language

THEN immediately build the complete pixel-perfect React code
that matches this design exactly. Match every:
- Color precisely
- Font size and weight
- Spacing and layout
- Component style
- Visual hierarchy

The code must look IDENTICAL to the provided image when rendered.`;

export function prepareImageMessage(
  imageBase64: string,
  mimeType: string,
  userPrompt: string,
): ChatMessage {
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;
  return {
    role: "user",
    content: [
      { type: "text", text: IMAGE_ANALYSIS_PROMPT + "\n\n" + (userPrompt || "Build this design exactly.") },
      { type: "image_url", image_url: { url: dataUrl } },
    ],
  };
}

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(",");
      const mimeType = header.match(/:(.*?);/)?.[1] ?? "image/png";
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
