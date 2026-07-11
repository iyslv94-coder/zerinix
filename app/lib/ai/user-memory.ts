import type { SupabaseClient } from "@supabase/supabase-js";

export type UserMemoryType =
  | "name"
  | "company"
  | "preference"
  | "writing_style"
  | "language"
  | "long_term_goal"
  | "general";

export type UserMemory = {
  id: string;
  type: UserMemoryType;
  content: string;
  updatedAt: string;
};

export type UserMemoryOperation =
  | {
      action: "remember";
      type: UserMemoryType;
      content: string;
    }
  | {
      action: "forget";
      type?: UserMemoryType;
      content: string;
    };

type UserMemoryRow = {
  id: string;
  memory_type: UserMemoryType;
  content: string;
  updated_at: string;
};

const MAX_MEMORY_CONTENT_LENGTH = 240;
const MAX_LOADED_MEMORIES = 30;

const memoryTypeLabels: Record<UserMemoryType, string> = {
  name: "Name",
  company: "Company",
  preference: "Preference",
  writing_style: "Writing style",
  language: "Language",
  long_term_goal: "Long-term goal",
  general: "General",
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function cleanMemoryContent(value: string) {
  return normalizeWhitespace(value)
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, "")
    .replace(/[.;,\s]+$/g, "")
    .slice(0, MAX_MEMORY_CONTENT_LENGTH)
    .trim();
}

function inferMemoryType(content: string): UserMemoryType {
  const normalized = content.toLowerCase();

  if (/\b(name|call me|i am|i'm)\b/.test(normalized)) {
    return "name";
  }

  if (/\b(company|startup|business|organization|organisation)\b/.test(normalized)) {
    return "company";
  }

  if (/\b(language|reply in|respond in|write in|english|turkish|türkçe)\b/.test(normalized)) {
    return "language";
  }

  if (/\b(tone|style|writing style|concise|detailed|formal|casual)\b/.test(normalized)) {
    return "writing_style";
  }

  if (/\b(goal|long-term|long term|objective|mission|vision)\b/.test(normalized)) {
    return "long_term_goal";
  }

  if (/\b(prefer|preference|always|never|like|dislike)\b/.test(normalized)) {
    return "preference";
  }

  return "general";
}

function createRememberOperation(type: UserMemoryType, content: string): UserMemoryOperation | null {
  const cleanedContent = cleanMemoryContent(content);

  if (!cleanedContent || cleanedContent.length < 2) {
    return null;
  }

  return {
    action: "remember",
    type,
    content: cleanedContent,
  };
}

function createForgetOperation(content: string): UserMemoryOperation | null {
  const cleanedContent = cleanMemoryContent(content);

  if (!cleanedContent || cleanedContent.length < 2) {
    return null;
  }

  const type =
    /\bname\b/i.test(cleanedContent)
      ? "name"
      : /\bcompany|startup|business\b/i.test(cleanedContent)
        ? "company"
        : /\blanguage\b/i.test(cleanedContent)
          ? "language"
          : undefined;

  return {
    action: "forget",
    type,
    content: cleanedContent,
  };
}

export function extractExplicitMemoryOperations(prompt: string): UserMemoryOperation[] {
  const text = normalizeWhitespace(prompt);
  const operations: UserMemoryOperation[] = [];

  if (!text) {
    return operations;
  }

  for (const match of text.matchAll(/\bmy name is\s+([^.!?\n]{2,80})/gi)) {
    const operation = createRememberOperation("name", match[1]);

    if (operation) {
      operations.push(operation);
    }
  }

  for (const match of text.matchAll(/\bmy company is\s+([^.!?\n]{2,120})/gi)) {
    const operation = createRememberOperation("company", match[1]);

    if (operation) {
      operations.push(operation);
    }
  }

  for (const match of text.matchAll(/\bremember this[:\s]+([^]+?)(?=$|\bforget this\b|\bmy name is\b|\bmy company is\b)/gi)) {
    const content = cleanMemoryContent(match[1]);
    const operation = createRememberOperation(inferMemoryType(content), content);

    if (operation) {
      operations.push(operation);
    }
  }

  for (const match of text.matchAll(/\balways\s+([^.!?\n]{3,180})/gi)) {
    const operation = createRememberOperation("preference", `Always ${match[1]}`);

    if (operation) {
      operations.push(operation);
    }
  }

  for (const match of text.matchAll(/\bforget this[:\s]+([^.!?\n]{2,160})/gi)) {
    const operation = createForgetOperation(match[1]);

    if (operation) {
      operations.push(operation);
    }
  }

  return operations;
}

export async function loadUserMemories(
  supabase: SupabaseClient,
  userId: string
): Promise<UserMemory[]> {
  const { data, error } = await supabase
    .from("user_memories")
    .select("id,memory_type,content,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(MAX_LOADED_MEMORIES);

  if (error) {
    console.error("[user_memories select failed]", {
      message: error.message,
      code: error.code,
    });
    return [];
  }

  return ((data || []) as UserMemoryRow[])
    .map((row) => ({
      id: row.id,
      type: row.memory_type,
      content: row.content,
      updatedAt: row.updated_at,
    }))
    .filter((memory) => Boolean(memory.content.trim()));
}

export function buildUserMemoryContext(memories: UserMemory[]) {
  if (!memories.length) {
    return "";
  }

  return memories
    .map((memory) => `- ${memoryTypeLabels[memory.type]}: ${memory.content}`)
    .join("\n");
}

export async function applyUserMemoryOperations(
  supabase: SupabaseClient,
  userId: string,
  operations: UserMemoryOperation[]
) {
  if (!operations.length) {
    return;
  }

  for (const operation of operations) {
    if (operation.action === "remember") {
      const normalizedContent = operation.content.toLowerCase();
      const { data: existingMemories, error: existingError } = await supabase
        .from("user_memories")
        .select("id,content")
        .eq("user_id", userId)
        .eq("memory_type", operation.type);

      if (existingError) {
        console.error("[user_memories duplicate check failed]", {
          message: existingError.message,
          code: existingError.code,
        });
        continue;
      }

      const duplicate = (existingMemories || []).some((memory) => {
        const content =
          typeof memory.content === "string" ? memory.content.toLowerCase() : "";

        return content === normalizedContent;
      });

      if (duplicate) {
        continue;
      }

      const { error } = await supabase.from("user_memories").insert({
        user_id: userId,
        memory_type: operation.type,
        content: operation.content,
        source: "explicit",
      });

      if (error) {
        console.error("[user_memories insert failed]", {
          message: error.message,
          code: error.code,
        });
      }

      continue;
    }

    const { data: existingMemories, error: selectError } = await supabase
      .from("user_memories")
      .select("id,memory_type,content")
      .eq("user_id", userId);

    if (selectError) {
      console.error("[user_memories forget select failed]", {
        message: selectError.message,
        code: selectError.code,
      });
      continue;
    }

    const target = operation.content.toLowerCase();
    const idsToDelete = (existingMemories || [])
      .filter((memory) => {
        const memoryType =
          typeof memory.memory_type === "string" ? memory.memory_type : "";
        const content =
          typeof memory.content === "string" ? memory.content.toLowerCase() : "";

        if (operation.type && memoryType === operation.type) {
          return true;
        }

        return content.includes(target) || target.includes(content);
      })
      .map((memory) => memory.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (!idsToDelete.length) {
      continue;
    }

    const { error } = await supabase
      .from("user_memories")
      .delete()
      .eq("user_id", userId)
      .in("id", idsToDelete);

    if (error) {
      console.error("[user_memories delete failed]", {
        message: error.message,
        code: error.code,
      });
    }
  }
}
