from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- importer le middleware
from routes.utilisateurs import router as utilisateurs_router
from routes.auteurs import router as auteurs_router
from routes.livres import router as livres_router 
from routes.categories import router as categories_router
from routes.emprunts import router as emprunts_router
from routes.aggregations import router as aggregations_router

app = FastAPI()

# ======== CORS ========
origins = [
    "http://localhost:3000",  # frontend React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # autorise GET, POST, PUT, DELETE...
    allow_headers=["*"],  # autorise tous les headers
)
# =====================

app.include_router(utilisateurs_router)
app.include_router(auteurs_router)
app.include_router(livres_router)  
app.include_router(categories_router)
app.include_router(emprunts_router)
app.include_router(aggregations_router)

@app.get("/")
def home():
    return {"message": "API Bibliothèque opérationnelle"}
