"use client";

import { Loader2, CheckCircle2, FileEdit, FilePlus, FileSearch, Trash2, FolderInput } from "lucide-react";

interface StrReplaceArgs {
  command: "view" | "create" | "str_replace" | "insert" | "undo_edit";
  path: string;
}

interface FileManagerArgs {
  command: "rename" | "delete";
  path: string;
  new_path?: string;
}

interface ToolInvocation {
  toolName: string;
  state: "call" | "partial-call" | "result";
  args: Record<string, unknown>;
  result?: unknown;
}

interface ToolCallDisplayProps {
  tool: ToolInvocation;
}

function getFileName(path: string | undefined) {
  if (!path) return "";
  return path.split("/").pop() ?? path;
}

function getStrReplaceLabel(args: StrReplaceArgs): { icon: React.ReactNode; label: string } {
  const file = getFileName(args.path);
  switch (args.command) {
    case "create":
      return { icon: <FilePlus className="w-3.5 h-3.5" />, label: `Creating ${file}` };
    case "str_replace":
      return { icon: <FileEdit className="w-3.5 h-3.5" />, label: `Editing ${file}` };
    case "insert":
      return { icon: <FileEdit className="w-3.5 h-3.5" />, label: `Inserting into ${file}` };
    case "view":
      return { icon: <FileSearch className="w-3.5 h-3.5" />, label: `Reading ${file}` };
    default:
      return { icon: <FileEdit className="w-3.5 h-3.5" />, label: `Editing ${file}` };
  }
}

function getFileManagerLabel(args: FileManagerArgs): { icon: React.ReactNode; label: string } {
  const file = getFileName(args.path);
  if (args.command === "rename" && args.new_path) {
    const newFile = getFileName(args.new_path);
    return { icon: <FolderInput className="w-3.5 h-3.5" />, label: `Renaming ${file} → ${newFile}` };
  }
  return { icon: <Trash2 className="w-3.5 h-3.5" />, label: `Deleting ${file}` };
}

function getToolLabel(tool: ToolInvocation): { icon: React.ReactNode; label: string } {
  if (tool.toolName === "str_replace_editor") {
    return getStrReplaceLabel(tool.args as StrReplaceArgs);
  }
  if (tool.toolName === "file_manager") {
    return getFileManagerLabel(tool.args as FileManagerArgs);
  }
  return { icon: <FileEdit className="w-3.5 h-3.5" />, label: tool.toolName };
}

export function ToolCallDisplay({ tool }: ToolCallDisplayProps) {
  const done = tool.state === "result";
  const { icon, label } = getToolLabel(tool);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      <span className={done ? "text-emerald-500" : "text-blue-500"}>
        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      </span>
      <span className="text-neutral-500">{icon}</span>
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
