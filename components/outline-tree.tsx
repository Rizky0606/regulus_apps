"use client"

type Node = { id: string; label: string; children?: Node[] }

export function OutlineTree({ nodes }: { nodes: Node[] }) {
  return (
    <nav aria-label="Struktur Dokumen" className="text-sm">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <span className="h-4 w-4 rounded bg-primary" aria-hidden /> Struktur Dokumen
      </h2>
      <ul className="space-y-1">
        {nodes.map((n) => (
          <li key={n.id}>
            <div className="font-medium">{n.label}</div>
            {n.children?.length ? (
              <ul className="ml-3 border-l pl-3 text-muted-foreground">
                {n.children.map((c) => (
                  <li key={c.id} className="py-0.5">
                    {c.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  )
}
