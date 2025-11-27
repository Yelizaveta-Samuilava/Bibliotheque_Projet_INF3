from fastapi import APIRouter, HTTPException
from database import emprunts, livres, utilisateurs, categories, auteurs
from typing import List

router = APIRouter(prefix="/stats", tags=["Stats"])

# 1. Top des livres les plus empruntés
@router.get("/top-livres")
def top_livres(limit: int = 5):
    try:
        pipeline = [
            {"$group": {
                "_id": "$livre_id",
                "nb_emprunts": {"$sum": 1}
            }},
            {"$sort": {"nb_emprunts": -1}},
            {"$limit": limit},
            {"$lookup": {
                "from": "livres",
                "localField": "_id",
                "foreignField": "_id",
                "as": "livre"
            }},
            {"$unwind": "$livre"},
            {"$project": {
                "livre._id": 1,
                "livre.titre": 1,
                "livre.auteur": 1,
                "nb_emprunts": 1
            }}
        ]
        return list(emprunts.aggregate(pipeline))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Nombre d’emprunts par catégorie
@router.get("/emprunts-par-categorie")
def emprunts_par_categorie():
    try:
        pipeline = [
            # Lier les emprunts avec les livres
            {"$lookup": {
                "from": "livres",
                "localField": "livre_id",
                "foreignField": "_id",
                "as": "livre"
            }},
            {"$unwind": "$livre"},

            # Grouper par catégorie
            {"$group": {
                "_id": "$livre.categorie_id",
                "nb_emprunts": {"$sum": 1}
            }},

            # Lier avec la collection categories pour obtenir le nom
            {"$lookup": {
                "from": "categories",
                "localField": "_id",
                "foreignField": "_id",
                "as": "categorie"
            }},
            {"$unwind": "$categorie"},

            # Projeter le résultat final
            {"$project": {
                "_id": 0,
                "categorie_id": "$_id",
                "categorie_nom": "$categorie.nom",
                "nb_emprunts": 1
            }}
        ]
        return list(emprunts.aggregate(pipeline))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Durée moyenne d’emprunt par utilisateur
@router.get("/duree-moyenne-utilisateur")
def duree_moyenne_utilisateur():
    try:
        pipeline = [
            {"$match": {"date_retour": {"$ne": None}}},
            {"$project": {
                "utilisateur_id": 1,
                "duree_jours": {
                    "$dateDiff": {
                        "startDate": {"$toDate": "$date_emprunt"},
                        "endDate": {"$toDate": "$date_retour"},
                        "unit": "day"
                    }
                }
            }},
            {"$group": {
                "_id": "$utilisateur_id",
                "moyenne_duree_jours": {"$avg": "$duree_jours"},
                "nb_emprunts": {"$sum": 1}
            }}
        ]
        return list(emprunts.aggregate(pipeline))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Durée moyenne d’emprunt par livre
@router.get("/duree-moyenne-livre")
def duree_moyenne_livre():
    try:
        pipeline = [
            {"$match": {"date_retour": {"$ne": None}}},
            {"$project": {
                "livre_id": 1,
                "duree_jours": {
                    "$dateDiff": {
                        "startDate": {"$toDate": "$date_emprunt"},
                        "endDate": {"$toDate": "$date_retour"},
                        "unit": "day"
                    }
                }
            }},
            {"$group": {
                "_id": "$livre_id",
                "moyenne_duree_jours": {"$avg": "$duree_jours"},
                "nb_emprunts": {"$sum": 1}
            }},
            {"$sort": {"nb_emprunts": -1}}
        ]
        return list(emprunts.aggregate(pipeline))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. Top des écrivains les plus empruntés
@router.get("/top-auteurs")
def top_auteurs(limit: int = 5):
    try:
        pipeline = [
            # Lier chaque emprunt au livre correspondant
            {"$lookup": {
                "from": "livres",
                "localField": "livre_id",
                "foreignField": "_id",
                "as": "livre"
            }},
            {"$unwind": "$livre"},

            # Lier chaque livre à son auteur
            {"$lookup": {
                "from": "auteurs",
                "localField": "livre.auteur_id",
                "foreignField": "_id",
                "as": "auteur"
            }},
            {"$unwind": "$auteur"},

            # Grouper par auteur et compter le nombre d'emprunts
            {"$group": {
                "_id": "$auteur.nom",
                "nb_emprunts": {"$sum": 1}
            }},

            # Trier par nombre d'emprunts décroissant
            {"$sort": {"nb_emprunts": -1}},

            # Limiter le nombre de résultats
            {"$limit": limit}
        ]
        return list(emprunts.aggregate(pipeline))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))