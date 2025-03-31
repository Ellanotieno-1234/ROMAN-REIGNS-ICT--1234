from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from reportService import router as report_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Received request: {request.method} {request.url}")
    logger.info(f"Headers: {request.headers}")
    logger.info(f"Query params: {request.query_params}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        raise

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include report routes with detailed logging
logger.info("Registering report routes with prefix /api/reports")
app.include_router(
    report_router,
    prefix="/api/reports",
    tags=["reports"]
)

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Root endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to the Reports API"}

@app.api_route("/api/reports", methods=["GET"], include_in_schema=False)
@app.api_route("/api/reports.", methods=["GET"], include_in_schema=False)
async def reports_root():
    return {
        "endpoints": {
            "templates": "/api/reports/templates",
            "generate": "/api/reports/generate/{template_id}",
            "export": "/api/reports/export/{format}"
        }
    }

# Log all registered routes
logger.info("All registered routes:")
for route in app.routes:
    logger.info(f"Path: {route.path}, Methods: {route.methods}")

# Explicitly configure host and port
import uvicorn
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
