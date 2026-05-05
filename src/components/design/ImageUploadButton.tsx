import { useRef } from "react";
import { Paperclip, X } from "lucide-react";
import { useRaincastStore } from "@/store/raincastStore";
import { fileToBase64 } from "@/services/design/imageAnalyzer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ImageUploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadedImageName = useRaincastStore((s) => s.uploadedImageName);
  const setUploadedImage = useRaincastStore((s) => s.setUploadedImage);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files supported");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    const { base64, mimeType } = await fileToBase64(file);
    setUploadedImage(base64, file.name, mimeType);
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedImage(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (uploadedImageName) {
    return (
      <button
        onClick={clear}
        className="flex items-center gap-1.5 h-7 px-2 rounded-md bg-primary/15 border border-primary/30 text-primary text-[11px] hover:bg-primary/25 transition-colors"
        title="Remove image"
      >
        <Paperclip className="w-3 h-3" />
        <span className="max-w-[120px] truncate">{uploadedImageName}</span>
        <X className="w-3 h-3" />
      </button>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title="Upload image or screenshot"
        className={cn(
          "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors",
        )}
      >
        <Paperclip className="w-3.5 h-3.5" />
      </button>
    </>
  );
}

export function ImageDropzone({ children }: { children: React.ReactNode }) {
  const setUploadedImage = useRaincastStore((s) => s.setUploadedImage);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const { base64, mimeType } = await fileToBase64(file);
    setUploadedImage(base64, file.name, mimeType);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => void handleDrop(e)}
      className="contents"
    >
      {children}
    </div>
  );
}
