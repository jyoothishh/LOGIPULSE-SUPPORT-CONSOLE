/**
 * UiTreeViewer.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders the live Application UI Element Tree received from the Angular app.
 *
 * Features:
 *   • Hierarchical tree view built from flat UiElement[] parent/child refs
 *   • Collapsible nodes
 *   • Element type icons
 *   • Route grouping
 *   • Click to copy element ID (for guidance builder)
 *   • Tree text export
 *   • Search/filter
 */
import React, { useState, useMemo } from 'react';
import { UiElement, UiTreeNode } from '../../types';
import s from './UiTreeViewer.module.css';

// ── Build tree ────────────────────────────────────────────────────────────────
function buildTree(elements: UiElement[]): UiTreeNode[] {
  const map = new Map<string, UiTreeNode>();
  const roots: UiTreeNode[] = [];

  // First pass: create nodes
  elements.forEach(el => {
    map.set(el.id, { ...el, children: [] });
  });

  // Second pass: attach children
  elements.forEach(el => {
    const node = map.get(el.id)!;
    if (el.parent && map.has(el.parent)) {
      map.get(el.parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// ── Element type icons ────────────────────────────────────────────────────────
function typeIcon(type?: string, id?: string): string {
  const t = (type ?? '').toLowerCase();
  const i = (id  ?? '').toLowerCase();
  if (t === 'button' || i.includes('btn')) return '🔘';
  if (t === 'input'  || i.includes('input')) return '✏️';
  if (t === 'select' || i.includes('select')) return '📋';
  if (t === 'a'      || i.includes('link') || i.includes('nav')) return '🔗';
  if (i.includes('grid') || i.includes('table')) return '📊';
  if (i.includes('menu') || i.includes('row')) return '📂';
  if (i.includes('page') || i.includes('panel')) return '🗂';
  if (i.includes('filter')) return '🔍';
  if (i.includes('upload') || i.includes('import')) return '⬆️';
  return '⬜';
}

// ── Export tree as text ───────────────────────────────────────────────────────
function treeToText(nodes: UiTreeNode[], prefix = '', isLast = true, depth = 0): string {
  return nodes.map((node, idx) => {
    const last   = idx === nodes.length - 1;
    const line   = `${prefix}${last ? '└── ' : '├── '}${node.label} [${node.id}]`;
    const next   = prefix + (last ? '    ' : '│   ');
    const children = node.children.length ? '\n' + treeToText(node.children, next, last, depth+1) : '';
    return line + children;
  }).join('\n');
}

// ── Tree Node ─────────────────────────────────────────────────────────────────
const TreeNode: React.FC<{
  node: UiTreeNode;
  depth: number;
  search: string;
  onSelect: (id: string) => void;
  selected: string | null;
}> = ({ node, depth, search, onSelect, selected }) => {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const matchesSelf = search ? (
    node.id.toLowerCase().includes(search.toLowerCase()) ||
    node.label.toLowerCase().includes(search.toLowerCase())
  ) : true;
  const childrenMatch = search ? node.children.some(c =>
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.label.toLowerCase().includes(search.toLowerCase())
  ) : true;
  if (search && !matchesSelf && !childrenMatch) return null;
  const isSelected = selected === node.id;

  return (
    <div className={s.nodeWrap}>
      <div
        className={`${s.node} ${isSelected ? s.nodeSelected : ''} ${!matchesSelf && search ? s.nodeDimmed : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <span className={s.toggle} onClick={e => { e.stopPropagation(); setOpen(p=>!p); }}>
            {open ? '▾' : '▸'}
          </span>
        ) : (
          <span className={s.toggleSpacer} />
        )}
        <span className={s.typeIcon}>{typeIcon(node.elementType, node.id)}</span>
        <span className={s.label}>{node.label}</span>
        <span className={s.id}>{node.id}</span>
        {node.route && <span className={s.route}>{node.route}</span>}
      </div>
      {hasChildren && open && (
        <div className={s.children}>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1}
              search={search} onSelect={onSelect} selected={selected} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const UiTreeViewer: React.FC<{
  elements: UiElement[];
  onSelectElement?: (id: string) => void;
}> = ({ elements, onSelectElement }) => {
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [copied,   setCopied]   = useState(false);

  const tree = useMemo(() => buildTree(elements), [elements]);

  // Group roots by route
  const routeGroups = useMemo(() => {
    const groups: Record<string, UiTreeNode[]> = {};
    tree.forEach(node => {
      const route = node.route ?? '/';
      if (!groups[route]) groups[route] = [];
      groups[route].push(node);
    });
    return groups;
  }, [tree]);

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelectElement?.(id);
  };

  const exportText = () => {
    const text = 'Application\n' + treeToText(tree, ' ');
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };

  if (elements.length === 0) {
    return (
      <div className={s.empty}>
        <div className={s.emptyIco}>🌳</div>
        <div>No UI elements yet.</div>
        <div className={s.emptyHint}>The Angular app sends its element tree via WebSocket.</div>
      </div>
    );
  }

  const showGroups = Object.keys(routeGroups).length > 1;

  return (
    <div className={s.viewer}>
      <div className={s.toolbar}>
        <input
          className={s.search}
          placeholder="Search elements…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={s.stats}>{elements.length} elements</div>
        <button className={s.exportBtn} onClick={exportText}>
          {copied ? '✅ Copied' : '📋 Export'}
        </button>
      </div>

      <div className={s.tree}>
        <div className={s.treeRoot}>🌐 Application</div>
        {showGroups
          ? Object.entries(routeGroups).map(([route, nodes]) => (
              <div key={route} className={s.routeGroup}>
                <div className={s.routeHeader}>📄 {route}</div>
                {nodes.map(node => (
                  <TreeNode key={node.id} node={node} depth={1}
                    search={search} onSelect={handleSelect} selected={selected} />
                ))}
              </div>
            ))
          : tree.map(node => (
              <TreeNode key={node.id} node={node} depth={1}
                search={search} onSelect={handleSelect} selected={selected} />
            ))
        }
      </div>

      {selected && (
        <div className={s.selectedInfo}>
          <span className={s.selectedLabel}>Selected:</span>
          <code className={s.selectedId}>{selected}</code>
          <button className={s.copyBtn} onClick={() => {
            navigator.clipboard.writeText(selected);
            setCopied(true); setTimeout(()=>setCopied(false),1500);
          }}>
            {copied ? '✅' : '📋 Copy ID'}
          </button>
        </div>
      )}
    </div>
  );
};
