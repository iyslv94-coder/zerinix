"use client";

import { useState, type DragEvent } from "react";

export type PlannerAttachment = {
  id: string;
  name: string;
  size: number;
  textContent?: string;
};

async function readAttachmentText(file: File) {
  const textLike =
    file.type.startsWith("text/") ||
    /\.(txt|md|csv|json|ts|tsx|js|jsx|css|html|sql)$/i.test(file.name);

  if (!textLike || file.size > 220_000) {
    return "";
  }

  try {
    return (await file.text()).slice(0, 20_000);
  } catch (error) {
    console.error("[attachment text read failed]", error);
    return "";
  }
}

export function useAttachments({ createId }: { createId: () => string }) {
  const [attachments, setAttachments] = useState<PlannerAttachment[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    const uploadedFiles = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: createId(),
        name: file.name,
        size: file.size,
        textContent: await readAttachmentText(file),
      }))
    );

    setAttachments((current) => [...current, ...uploadedFiles]);
  }

  function handleDropFiles(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDraggingFiles(false);
    void handleFiles(event.dataTransfer.files);
  }

  return {
    attachments,
    setAttachments,
    isDraggingFiles,
    setIsDraggingFiles,
    handleFiles,
    handleDropFiles,
  };
}
