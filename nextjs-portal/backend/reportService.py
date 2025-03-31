from fastapi import APIRouter, HTTPException, Response
from typing import List, Optional
from pydantic import BaseModel
import polars as pl
from datetime import datetime
import logging
import io
import tempfile
import os
import base64 # For embedding image

# HTML to PDF Conversion
from xhtml2pdf import pisa

logger = logging.getLogger(__name__)

class ReportTemplate(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    query: str
    columns: List[str]
    created_at: datetime = datetime.now()

router = APIRouter(tags=["reports"])

# In-memory storage for demo (replace with DB in production)
report_templates = [
    {
        "id": "1",
        "name": "Sample Report",
        "description": "Demonstration report template",
        "query": "SELECT * FROM sample_data",
        "columns": ["id", "name", "value"],
        "created_at": "2025-03-28T12:00:00"
    }
]

@router.post("/templates")
async def create_template(template: ReportTemplate):
    report_templates.append(template.dict())
    return {"message": "Template created", "id": template.id}

@router.get("/templates")
async def get_templates():
    logger.info("GET /templates endpoint called")
    try:
        logger.info(f"Returning templates: {report_templates}")
        return report_templates
    except Exception as e:
        logger.error(f"Error in get_templates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials in environment variables")

supabase = create_client(supabase_url, supabase_key)

@router.post("/generate/{template_id}")
async def generate_report(template_id: str, file_id: str = None):
    template = next((t for t in report_templates if t["id"] == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    try:
        query = supabase.table("analysis_results").select("*")
        if file_id:
            query = query.eq("id", file_id)
        result = query.execute()

        status_counts = {}
        for row in result.data:
            status = row.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1

        enhanced_rows = []
        for row in result.data:
            created_at_raw = row.get("created_at")
            created_at_str = ""
            if created_at_raw:
                try:
                    dt_obj = datetime.fromisoformat(created_at_raw.replace('Z', '+00:00'))
                    created_at_str = dt_obj.strftime('%Y-%m-%d %H:%M:%S')
                except ValueError:
                    created_at_str = str(created_at_raw)
            else:
                 created_at_str = "N/A"

            enhanced_row = {
                "id": str(row.get("id", "N/A")),
                "created_at": created_at_str,
                "file_name": str(row.get("file_name", "Unknown")),
                "status": str(row.get("status", "Pending")),
                "record_count": str(row.get("record_count", 0))
            }
            enhanced_rows.append(enhanced_row)

        data = {
            "columns": ["id", "created_at", "file_name", "status", "record_count"],
            "rows": enhanced_rows, # Still needed for CSV/Excel
            "analysis": {
                "status_counts": status_counts,
                "generated_at": datetime.now().isoformat(),
                "total_records": len(result.data)
            }
        }
        return data
    except Exception as e:
        logger.error(f"Report generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Helper function for HTML to PDF conversion ---
def html_to_pdf(html_string: str) -> bytes:
    """Converts an HTML string to PDF bytes using xhtml2pdf."""
    result = io.BytesIO()
    pdf = pisa.CreatePDF(io.StringIO(html_string), dest=result, default_css="@page { size: A4 portrait; }") # Changed to Portrait
    if pdf.err:
        logger.error(f"Error converting HTML to PDF: {pdf.err}")
        raise Exception(f"PDF generation error: {pdf.err}")
    return result.getvalue()

@router.get("/export/{format}")
async def export_report(format: str, template_id: str, file_id: str = None):
    if format not in ["csv", "excel", "pdf"]:
        raise HTTPException(status_code=400, detail="Invalid format")

    try:
        # Generate data regardless of format
        data = await generate_report(template_id, file_id)

        if format == "csv":
            df = pl.DataFrame(data["rows"])
            buffer = io.StringIO()
            df.write_csv(buffer)
            return Response(content=buffer.getvalue(), media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=report_{template_id}.csv"})

        elif format == "excel":
            df = pl.DataFrame(data["rows"])
            buffer = io.BytesIO()
            df.write_excel(buffer)
            buffer.seek(0)
            return Response(content=buffer.getvalue(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": f"attachment; filename=report_{template_id}.xlsx"})

        elif format == "pdf":
            # --- PDF Generation (Summary + Optional Chart ONLY) ---
            from matplotlib import pyplot as plt

            # --- Attempt to Generate Chart Image ---
            chart_path = None
            chart_base64 = None
            try:
                # Check if status_counts is not empty
                if data['analysis']['status_counts']:
                    plt.figure(figsize=(7, 3.5)) # Adjusted size for portrait
                    plt.bar(data['analysis']['status_counts'].keys(),
                           data['analysis']['status_counts'].values())
                    plt.title("Status Distribution")
                    plt.ylabel("Count")
                    plt.xticks(rotation=30, ha='right') # Less rotation
                    plt.tight_layout()

                    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
                        chart_path = tmp.name
                        plt.savefig(chart_path, format='png', dpi=120) # Standard DPI
                    plt.close()

                    with open(chart_path, "rb") as image_file:
                        chart_base64 = base64.b64encode(image_file.read()).decode('utf-8')
                else:
                    logger.warning("No status data available for chart generation.")

            except Exception as chart_err:
                logger.error(f"Failed to generate chart: {chart_err}")
            finally:
                if chart_path and os.path.exists(chart_path):
                    os.unlink(chart_path)

            # --- Construct HTML (No Table) ---
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Analysis Report</title>
                <style>
                    /* @page rule removed for debugging */
                    body {{ font-family: sans-serif; font-size: 11pt; margin: 1in; }} /* Added margin to body */
                    h1 {{ text-align: center; margin-bottom: 20px;}}
                    .summary p {{ margin: 3px 0; font-size: 10pt; }}
                    .chart {{ text-align: center; margin-top: 30px; }}
                </style>
            </head>
            <body>
                <h1>Analysis Report</h1>
                <div class="summary">
                    <p>Generated at: {data['analysis']['generated_at']}</p>
                    <p>Total records analyzed: {data['analysis']['total_records']}</p>
                </div>
            """

            if chart_base64:
                html += f"""
                <div class="chart">
                    <img src="data:image/png;base64,{chart_base64}" alt="Status Distribution Chart" style="max-width: 100%; height: auto;"/>
                </div>
                """
            elif not data['analysis']['status_counts']:
                 html += "<p style='margin-top: 30px;'><i>No status data available for chart.</i></p>"
            else:
                 html += "<p style='margin-top: 30px;'><i>Chart generation failed.</i></p>"

            # --- Table Removed ---
            # html += "<table> ... </table>"

            html += """
            </body>
            </html>
            """

            # --- Convert HTML to PDF ---
            pdf_content = html_to_pdf(html)

            return Response(content=pdf_content, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=report_{template_id}.pdf"})

    except Exception as e:
        logger.error(f"Export failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"An error occurred during export: {str(e)}")
