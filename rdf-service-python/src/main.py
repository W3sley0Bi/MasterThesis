from fastapi import APIRouter, FastAPI
from .router.routing import router
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

app.mount("/visualizer", StaticFiles(directory="src/ui/components/visualizer"), name="visualizer")
app.mount("/uploader", StaticFiles(directory="src/ui/components/uploader"), name="uploader")
app.mount("/visualizer", StaticFiles(directory="src/ui/components/visualizer"), name="style")

# to run the server locally 
# fastapi dev src/main.py --host 0.0.0.0 --port 8000