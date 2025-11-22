from fastapi import FastAPI
from routes.utilisateurs import router as utilisateurs_router
from routes.livres import router as livres_router 
from routes.categories import router as categories_router
from routes.emprunts import router as emprunts_router

app = FastAPI()

app.include_router(utilisateurs_router)
app.include_router(livres_router)  
app.include_router(categories_router)
app.include_router(emprunts_router)

@app.get("/")
def home():
    return {"message": "API Bibliothèque opérationnelle"}
