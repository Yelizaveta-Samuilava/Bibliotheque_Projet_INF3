from fastapi import APIRouter
from database import livres
from models.livre import Livre

router = APIRouter(prefix="/livres")

@router.get("/")
def get_livres():
    return list(livres.find())

@router.post("/")
def add_livre(data: Livre):
    livre_dict = data.dict()

    # Si l'utilisateur ne fournit pas d'_id
    if not livre_dict.get("_id"):
        # Cherche le dernier _id qui est un entier
        dernier_livre = livres.find({"_id": {"$type": "int"}}).sort("_id", -1).limit(1)
        dernier_livre = list(dernier_livre)
        livre_dict["_id"] = (dernier_livre[0]["_id"] + 1) if dernier_livre else 1

    livres.insert_one(livre_dict)
    return {"message": "Livre ajouté", "livre": livre_dict}

# Recherche avancée des livres
from typing import Optional
from fastapi import Query

#fonction pour formater un livre depuis mongodb
def serialize_livre(l):
    return {
        "_id": l["_id"],
        "titre": l.get("titre"),
        "auteur": l.get("auteur"),
        "categorie_id": l.get("categorie_id"),
        "annee": l.get("annee"),
        "stock": l.get("stock"),
        "disponible": l.get("disponible")
    }


@router.get("/search")
def recherche_avancee(
    #Paramètres optionnels de filtrage (tous dans l'URL en query params)
    titre: Optional[str] = Query(None),
    auteur: Optional[str] = Query(None),
    categorie_id: Optional[int] = Query(None),
    disponible: Optional[bool] = Query(None),
    mots_cles: Optional[str] = Query(None)
):  
     # Dictionnaire principal de filtrage mongodb
    filtre = {}

    or_conditions = []
    if titre:
        #rechercher sur titre
        or_conditions.append({"titre": {"$regex": titre, "$options": "i"}})
    if auteur:
        or_conditions.append({"auteur": {"$regex": auteur, "$options": "i"}})
    
    #Recherche globale mots-clés 
    if mots_cles:
        or_conditions.append({"titre": {"$regex": mots_cles, "$options": "i"}})
        or_conditions.append({"auteur": {"$regex": mots_cles, "$options": "i"}})
    
    #si pluisuers conditions or on les ajoute au filtre 
    if or_conditions:
        filtre["$or"] = or_conditions

    if categorie_id is not None:
        filtre["categorie_id"] = categorie_id

    if disponible is not None:
        filtre["disponible"] = disponible
    
    #recherche mongodb avc le filtre obtenu
    resultats = list(livres.find(filtre))
    #retourne le nb de résultats avec les livres formatés
    return {
        "count": len(resultats),
        "livres": [serialize_livre(l) for l in resultats]
    }
