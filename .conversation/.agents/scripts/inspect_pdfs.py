from pathlib import Path
import fitz

SOURCE_DIR = Path("attached_assets")
OUTPUT_DIR = Path(".agents/outputs/pdf_renders")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

pdfs = sorted(SOURCE_DIR.glob("OOC_Week_*.pdf"))
for pdf_path in pdfs:
    doc = fitz.open(pdf_path)
    safe_name = pdf_path.stem
    text_parts = []
    for index, page in enumerate(doc):
        text_parts.append(f"\n--- PAGE {index + 1} ---\n{page.get_text()}")
        pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
        pix.save(OUTPUT_DIR / f"{safe_name}_page_{index + 1}.png")
    (OUTPUT_DIR / f"{safe_name}.txt").write_text(
        f"{pdf_path.name}\nPages: {doc.page_count}\n" + "".join(text_parts),
        encoding="utf-8",
    )
    print(f"{pdf_path.name}: {doc.page_count} pages")