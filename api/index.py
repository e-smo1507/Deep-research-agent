import os
import sys

# Ensure root and backend are in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, ".."))
backend_dir = os.path.join(root_dir, "backend")

for p in [backend_dir, root_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app
except Exception as e:
    try:
        from backend.app.main import app
    except Exception as e2:
        from fastapi import FastAPI
        app = FastAPI()
        @app.get("/api/health")
        def error_health():
            return {"error": str(e2), "path": sys.path}
