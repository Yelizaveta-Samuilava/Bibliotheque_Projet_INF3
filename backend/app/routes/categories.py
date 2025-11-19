from fastapi import APIRouter
from database import categories
from models.categorie import Categorie


router = APIRouter(prefix="/categories")

@router.get("/")
def get_categories():
    return list(categories.find())

@router.post("/")
def add_categorie(data: Categorie):
    dernier_categorie = categories.find_one(sort=[("_id", -1)])
    next_id = (dernier_categorie["_id"] + 1) if dernier_categorie else 1

    cat_dict = data.dict()
    cat_dict["_id"] = next_id
    categories.insert_one(cat_dict)
    return {"message": f"Catégorie '{cat_dict['nom']}' ajoutée avec _id {next_id}"}

