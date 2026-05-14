# Vibe-Musu Visual Language Guide (2026 - Pencil Dev Edition)

## 1. Aesthetic Identity
- **The Excalidraw Aesthetic:** Hand-drawn, rough, schematic style. It should look like an engineer hastily sketched it on a whiteboard during a heated architectural debate.
- **High-Signal, Low-Noise:** Focus on nodes, connections, constraints, and data flow. No decorative elements.

## 2. Implementation Workflow (Pencil Dev)
We no longer use code-based SVGs or DALL-E for technical diagrams. All visuals must be generated using `mcp_pencil_batch_design` for authentic, editable `.pen` files, exported to `.png`.

1.  **Open Pencil Dev:** Use `mcp_pencil_open_document` to create a new `.pen` file in the `designs/` directory.
2.  **Batch Design:** Use `mcp_pencil_batch_design` to draw the diagram. Use basic shapes (rectangles, ellipses), connection lines, and mono-spaced text.
3.  **Export:** Export the final design to `.png` using `mcp_pencil_export_nodes`.
4.  **Placement:** Save as `public/images/posts/[slug].png` and link in the markdown frontmatter.

## 3. Visual Tropes
- **Nodes:** Rough rectangles for servers/services.
- **Edges:** Dashed lines for RPC/network calls, solid lines for direct dependencies.
- **Labels:** Monospaced, all-caps text.
- **Annotations:** Use "handwritten" (marker style) text to point out flaws, bottlenecks, or Aha moments.
