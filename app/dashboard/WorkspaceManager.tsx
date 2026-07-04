import Link from "next/link";
import {
  FileText,
  Folder,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import type { DashboardWorkspace } from "./report-utils";
import {
  createWorkspace,
  deleteWorkspace,
  renameWorkspace,
} from "./actions";

export default function WorkspaceManager({
  workspaces,
}: {
  workspaces: DashboardWorkspace[];
}) {
  return (
    <>
      <form
        action={createWorkspace}
        className="mt-8 rounded-3xl border border-white/10 bg-zinc-950/80 p-4 shadow-2xl shadow-black/30"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <FolderPlus className="h-5 w-5 text-teal-200" />
          </div>
          <input
            name="name"
            required
            placeholder="New workspace name"
            className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-teal-300/40"
          />
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <FolderPlus className="h-4 w-4" />
            Create Workspace
          </button>
        </div>
      </form>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspaces.map((workspace) => {
          const isDeleteDisabled = workspace.reportCount > 0;

          return (
            <article
              key={workspace.id}
              className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30 transition hover:border-teal-300/30 hover:bg-zinc-900/90"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Folder className="h-5 w-5 text-teal-200" />
                </div>
                <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-medium text-teal-100">
                  {workspace.reportCount} reports
                </span>
              </div>

              <h2 className="mt-5 line-clamp-2 text-xl font-semibold tracking-tight text-white">
                {workspace.name}
              </h2>

              <Link
                href={`/dashboard/workspaces/${workspace.id}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-teal-200 opacity-80 transition hover:opacity-100"
              >
                <FileText className="h-4 w-4" />
                Open workspace
              </Link>

              <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                <form action={renameWorkspace} className="flex gap-2">
                  <input
                    type="hidden"
                    name="workspace_id"
                    value={workspace.id}
                  />
                  <input
                    name="name"
                    defaultValue={workspace.name}
                    required
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-200 outline-none transition focus:border-teal-300/40"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-zinc-200 transition hover:bg-white/10"
                    aria-label="Rename workspace"
                  >
                    <Pencil className="h-4 w-4 text-teal-200" />
                  </button>
                </form>

                <form action={deleteWorkspace}>
                  <input
                    type="hidden"
                    name="workspace_id"
                    value={workspace.id}
                  />
                  <button
                    type="submit"
                    disabled={isDeleteDisabled}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:border-red-300/30 hover:bg-red-950/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4 text-red-200" />
                    {isDeleteDisabled ? "Delete disabled while reports exist" : "Delete workspace"}
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
