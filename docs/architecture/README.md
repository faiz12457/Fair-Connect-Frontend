# Fair-Connect Frontend Architecture

This documentation is based on repository source inspected for this commit. It describes the current **demo frontend**, not a production backend. The application uses React 19, Vite, React Router, Tailwind CSS 4, Motion, Recharts and a custom external store.

## Diagram index

- [Overall architecture](./frontend-overview.md)
- [Routes and pages](./routes-and-pages.md)
- [Component architecture](./component-tree.md)
- [State and persistence](./state-management.md)
- [Authentication and role guards](./authentication-flow.md)
- [Matching and data flow](./data-flow.md)
- [Key files and dependencies](./file-dependency-map.md)

## Important implementation note

The inspected `src/store/store.js` initializes demo data from `src/data/seed.js` and persists it in browser storage. It is **not** a Redux Toolkit store and the inspected package.json does not list Redux Toolkit or Axios. The diagrams therefore document the code that exists, rather than assuming a planned backend is already implemented.

## How to view diagrams

Open any Markdown file in VS Code and use **Markdown: Open Preview**. Mermaid diagrams render in a compatible Markdown preview. You can also paste the Mermaid blocks into https://mermaid.live/.

## Scope and verification

The route map is taken from `src/app/router.jsx`; state/persistence from `src/store/store.js`; matching from `src/lib/match.js`; shared dashboard structure from `src/components/shared/DashboardShell.jsx`; role protection from `src/components/shared/Guards.jsx`. Review source files if these change.
