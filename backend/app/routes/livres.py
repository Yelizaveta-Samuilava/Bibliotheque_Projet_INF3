from fastapi import APIRouter, Query
from typing import Optional
from database import livres, auteurs, categories
from models.livre import Livre

router = APIRouter(prefix="/livres")

# Fonction pour formater un livre depuis MongoDB
def serialize_livre(l):
    auteur = auteurs.find_one({"_id": l.get("auteur_id")})
    categorie = categories.find_one({"_id": l.get("categorie_id")})
    return {
        "_id": l["_id"],
        "titre": l.get("titre"),
        "auteur": auteur.get("nom") if auteur else "Inconnu",
        "categorie_id": l.get("categorie_id"),
        "categorie_nom": categorie.get("nom") if categorie else "Inconnue",
        "annee": l.get("annee"),
        "stock": l.get("stock"),
        "disponible": l.get("disponible")
    }

@router.get("/search")
def recherche_avancee(
    titre: Optional[str] = Query(None),
    auteur: Optional[str] = Query(None),
    categorie_id: Optional[int] = Query(None),
    disponible: Optional[bool] = Query(None),
    mots_cles: Optional[str] = Query(None)
):
    filtre = {}
    or_conditions = []

    # Titre
    if titre:
        or_conditions.append({"titre": {"$regex": titre, "$options": "i"}})

    # Auteur
    if auteur:
        auteurs_match = list(auteurs.find({"nom": {"$regex": auteur, "$options": "i"}}))
        if auteurs_match:
            ids = [a["_id"] for a in auteurs_match]
            or_conditions.append({"auteur_id": {"$in": ids}})

    # Mots clés
    if mots_cles:
        or_conditions.append({"titre": {"$regex": mots_cles, "$options": "i"}})
        auteurs_match = list(auteurs.find({"nom": {"$regex": mots_cles, "$options": "i"}}))
        if auteurs_match:
            ids = [a["_id"] for a in auteurs_match]
            or_conditions.append({"auteur_id": {"$in": ids}})

    # Si OR
    if or_conditions:
        filtre["$or"] = or_conditions

    # Catégorie
    if categorie_id is not None:
        filtre["categorie_id"] = categorie_id

    # Disponibilité
    if disponible is not None:
        filtre["disponible"] = disponible

    # Aucun filtre → renvoie tout
    resultats = list(livres.find(filtre)) if filtre else list(livres.find())

    return [serialize_livre(l) for l in resultats]

# GET /livres : liste de tous les livres
@router.get("/")
def get_livres():
    return [serialize_livre(l) for l in livres.find()]

# GET /livres/{id} : détail d’un livre par son ID
@router.get("/{id}")
def get_livre_by_id(id: int):
    livre = livres.find_one({"_id": id})
    if not livre:
        return {"detail": "Livre non trouvé"}
    return serialize_livre(livre)

# POST /livres : ajouter un livre
@router.post("/")
def add_livre(data: Livre):
    livre_dict = data.dict()

    # Si l'utilisateur ne fournit pas d'_id
    if not livre_dict.get("_id"):
        dernier_livre = list(livres.find({"_id": {"$type": "int"}}).sort("_id", -1).limit(1))
        livre_dict["_id"] = (dernier_livre[0]["_id"] + 1) if dernier_livre else 1

    livres.insert_one(livre_dict)
    return {"message": "Livre ajouté", "livre": serialize_livre(livre_dict)}
