import { useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode2,
  FileType,
  FileJson,
  FileText,
  Image as ImageIcon,
  X,
  Search,
  Copy,
  Download,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FileNode =
  | { kind: "file"; name: string; path: string }
  | { kind: "dir"; name: string; path: string; children: FileNode[] };

function buildTree(paths: string[]): FileNode[] {
  type Entry = { name: string; path: string; children?: Map<string, Entry> };
  const root: Entry = { name: "", path: "", children: new Map() };

  for (const p of paths) {
    const parts = p.split("/").filter(Boolean);
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const isLast = i === parts.length - 1;
      const name = parts[i];
      const fullPath = parts.slice(0, i + 1).join("/");
      if (!cur.children) cur.children = new Map();
      let next = cur.children.get(name);
      if (!next) {
        next = { name, path: fullPath, children: isLast ? undefined : new Map() };
        cur.children.set(name, next);
      } else if (!isLast && !next.children) {
        next.children = new Map();
      }
      cur = next;
    }
  }

  function toNodes(e: Entry): FileNode[] {
    if (!e.children) return [];
    const dirs: FileNode[] = [];
    const files: FileNode[] = [];
    for (const c of e.children.values()) {
      if (c.children) {
        dirs.push({
          kind: "dir",
          name: c.name,
          path: c.path,
          children: toNodes(c),
        });
      } else {
        files.push({ kind: "file", name: c.name, path: c.path });
      }
    }
    dirs.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    return [...dirs, ...files];
  }
  return toNodes(root);
}

function FileIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".tsx") || lower.endsWith(".jsx"))
    return <FileCode2 className="w-3.5 h-3.5 text-[#82aaff]" />;
  if (lower.endsWith(".ts") || lower.endsWith(".js"))
    return <FileType className="w-3.5 h-3.5 text-[#ffcb6b]" />;
  if (lower.endsWith(".css"))
    return <FileType className="w-3.5 h-3.5 text-[#f78fc6]" />;
  if (lower.endsWith(".json"))
    return <FileJson className="w-3.5 h-3.5 text-[#f78c6c]" />;
  if (lower.endsWith(".md"))
    return <FileText className="w-3.5 h-3.5 text-[#a0a0b8]" />;
  if (lower.endsWith(".svg") || lower.endsWith(".png") || lower.endsWith(".jpg"))
    return <ImageIcon className="w-3.5 h-3.5 text-[#c792ea]" />;
  if (lower.endsWith(".html"))
    return <FileType className="w-3.5 h-3.5 text-[#f78c6c]" />;
  return <FileText className="w-3.5 h-3.5 text-[#8080a0]" />;
}

function NodeRow({
  node,
  depth,
  expanded,
  onToggle,
  activePath,
  onOpen,
  filter,
}: {
  node: FileNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (p: string) => void;
  activePath: string | null;
  onOpen: (p: string) => void;
  filter: string;
}) {
  if (node.kind === "dir") {
    const isOpen = expanded.has(node.path);
    // If filtering, auto-expand any folder containing a match
    const hasMatch = filter
      ? containsMatch(node, filter.toLowerCase())
      : true;
    if (filter && !hasMatch) return null;
    const open = filter ? true : isOpen;
    return (
      <div>
        <button
          onClick={() => onToggle(node.path)}
          className="w-full flex items-center gap-1 px-2 py-1 text-[12px] hover:bg-white/[0.03] text-[#a0a0b8] font-medium select-none"
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          {open ? (
            <ChevronDown className="w-3 h-3 shrink-0 text-[#6b6b85]" />
          ) : (
            <ChevronRight className="w-3 h-3 shrink-0 text-[#6b6b85]" />
          )}
          {open ? (
            <FolderOpen className="w-3.5 h-3.5 shrink-0 text-[#ffcb6b]/80" />
          ) : (
            <Folder className="w-3.5 h-3.5 shrink-0 text-[#ffcb6b]/80" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {open && (
          <div>
            {node.children.map((c) => (
              <NodeRow
                key={c.path}
                node={c}
                depth={depth + 1}
                expanded={expanded}
                onToggle={onToggle}
                activePath={activePath}
                onOpen={onOpen}
                filter={filter}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
  if (filter && !node.name.toLowerCase().includes(filter.toLowerCase()))
    return null;
  const active = activePath === node.path;
  return (
    <button
      onClick={() => onOpen(node.path)}
      className={cn(
        "w-full flex items-center gap-1.5 px-2 py-1 text-[12px] select-none transition-colors",
        active
          ? "bg-[#2a2a3a] text-white"
          : "text-[#8080a0] hover:bg-white/[0.03] hover:text-[#c0c0d0]",
      )}
      style={{ paddingLeft: 8 + depth * 16 + 14 }}
    >
      <FileIcon name={node.name} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

function containsMatch(node: FileNode, filter: string): boolean {
  if (node.kind === "file") return node.name.toLowerCase().includes(filter);
  return node.children.some((c) => containsMatch(c, filter));
}

export function FileExplorer({
  paths,
  activePath,
  onOpen,
  onSearch,
  search,
}: {
  paths: string[];
  activePath: string | null;
  onOpen: (p: string) => void;
  onSearch: (s: string) => void;
  search: string;
}) {
  const tree = useMemo(() => buildTree(paths), [paths]);
  // Default expand the top-level "src"
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const n of tree) if (n.kind === "dir") s.add(n.path);
    // also expand src/components if present
    s.add("src");
    s.add("src/components");
    return s;
  });
  const toggle = (p: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });

  return (
    <aside className="w-[240px] shrink-0 h-full flex flex-col bg-[#1a1a24] border-r border-[#1e1e2e]">
      <div className="p-2 border-b border-[#1e1e2e]">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#5a5a75]" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search code"
            className="w-full bg-[#0f0f17] border border-[#1e1e2e] rounded text-[11px] text-[#c0c0d0] placeholder:text-[#5a5a75] pl-6 pr-2 py-1.5 outline-none focus:border-[#3a3a52]"
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto raincast-scroll py-1">
        {tree.length === 0 ? (
          <div className="px-3 py-6 text-center text-[11px] text-[#5a5a75]">
            No files yet.
          </div>
        ) : (
          tree.map((n) => (
            <NodeRow
              key={n.path}
              node={n}
              depth={0}
              expanded={expanded}
              onToggle={toggle}
              activePath={activePath}
              onOpen={onOpen}
              filter={search}
            />
          ))
        )}
      </div>
    </aside>
  );
}

export function FileTabs({
  tabs,
  active,
  onSelect,
  onClose,
}: {
  tabs: string[];
  active: string | null;
  onSelect: (p: string) => void;
  onClose: (p: string) => void;
}) {
  if (tabs.length === 0) return null;
  return (
    <div className="h-9 shrink-0 flex items-stretch border-b border-[#1e1e2e] bg-[#0f0f17] overflow-x-auto raincast-scroll">
      {tabs.map((t) => {
        const name = t.split("/").pop() ?? t;
        const isActive = t === active;
        return (
          <div
            key={t}
            className={cn(
              "group flex items-center gap-2 px-3 text-[12px] border-r border-[#1e1e2e] cursor-pointer shrink-0 transition-colors",
              isActive
                ? "bg-[#111118] text-white border-b-2 border-b-[#00e5ff] -mb-px"
                : "text-[#6b6b85] hover:text-[#a0a0b8] hover:bg-white/[0.02]",
            )}
            onClick={() => onSelect(t)}
          >
            <FileIcon name={name} />
            <span className="truncate max-w-[160px]">{name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(t);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[#5a5a75] hover:text-white"
              aria-label={`Close ${name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function FilePathHeader({
  path,
  onCopy,
  onDownload,
  onRegenerate,
  canAct,
  isBuilding,
}: {
  path: string | null;
  onCopy: () => void;
  onDownload: () => void;
  onRegenerate: () => void;
  canAct: boolean;
  isBuilding: boolean;
}) {
  return (
    <div className="h-9 shrink-0 px-3 flex items-center bg-[#111118] border-b border-[#1e1e2e]">
      <div className="text-[11px] font-mono text-[#8080a0] truncate flex-1">
        {path ?? "—"}
      </div>
      <div className="flex items-center gap-0.5">
        <IconBtn
          onClick={onRegenerate}
          disabled={!canAct || isBuilding}
          title="Regenerate"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn onClick={onCopy} disabled={!canAct} title="Copy file">
          <Copy className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn onClick={onDownload} disabled={!canAct} title="Download .zip">
          <Download className="w-3.5 h-3.5" />
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-7 w-7 flex items-center justify-center rounded text-[#6b6b85] hover:text-white hover:bg-white/[0.04] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#6b6b85] transition-colors"
    >
      {children}
    </button>
  );
}
