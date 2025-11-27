from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import date, datetime, timedelta
from typing import Optional, List
from bson import ObjectId
from datetime import datetime, timedelta
from database import livres, utilisateurs, emprunts
from models.emprunt import Emprunt

router = APIRouter(
    prefix="/emprunts",
    tags=["Emprunts"]
)

MAX_DUREE_JOURS = 15

#SCHEMAS POUR LES REQUÊTES
class EmprunterRequest(BaseModel):
    utilisateur_id: int
    livre_id: int


class RendreRequest(BaseModel):
    emprunt_id: int



def get_next_id(collection):
    last = collection.find_one(sort=[("_id", -1)])
    return (last["_id"] + 1) if last else 1


def to_iso(d):
    if d is None:
        return None
    if isinstance(d, (datetime, date)):
        return d.isoformat()
    return d


def serialize_emprunt(e):
    return {
        "_id": e["_id"], 
        "utilisateur_id": e["utilisateur_id"],
        "livre_id": e["livre_id"],
        "date_emprunt": to_iso(e.get("date_emprunt")),
        "date_retour": to_iso(e.get("date_retour")),
        "statut": e.get("statut"),
    }


#     ROUTES

#   POST /emprunts/emprunter
@router.post("/emprunter", response_model=Emprunt)
def emprunter_livre(req: EmprunterRequest):

    # Vérifier utilisateur
    user = utilisateurs.find_one({"_id": req.utilisateur_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    # Vérifier livre
    livre = livres.find_one({"_id": req.livre_id})
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")
    if livre.get("stock", 0) <= 0:
        raise HTTPException(status_code=400, detail="Livre non disponible")

    # Créer emprunt
    new_id = get_next_id(emprunts)
    emprunt_doc = {
        "_id": new_id,
        "utilisateur_id": req.utilisateur_id,
        "livre_id": req.livre_id,
        "date_emprunt": datetime.now(),
        "date_retour": None,
        "statut": "en cours",
    }
    emprunts.insert_one(emprunt_doc)

    # Diminuer stock
    livres.update_one({"_id": req.livre_id}, {"$inc": {"stock": -1}})

    # Mettre à jour disponibilité
    livre_after = livres.find_one({"_id": req.livre_id})
    livres.update_one(
        {"_id": req.livre_id},
        {"$set": {"disponible": livre_after["stock"] > 0}}
    )

    return Emprunt(**serialize_emprunt(emprunt_doc))



#   POST /emprunts/rendre
@router.post("/rendre", response_model=Emprunt)
def rendre_livre(req: RendreRequest):

    e = emprunts.find_one({"_id": req.emprunt_id})
    if not e:
        raise HTTPException(status_code=404, detail="Emprunt introuvable")

    if e["statut"] != "en cours":
        raise HTTPException(status_code=400, detail="Cet emprunt n'est pas en cours")

    maintenant = datetime.now()
    duree = (maintenant - e["date_emprunt"]).days
    statut_final = "retard" if duree > MAX_DUREE_JOURS else "rendu"

    #mise à jour emprunt
    emprunts.update_one(
        {"_id": req.emprunt_id},
        {"$set": {"date_retour": maintenant, "statut": statut_final}}
    )

    #réaugmenter stock
    livres.update_one({"_id": e["livre_id"]}, {"$inc": {"stock": 1}})
    livres.update_one({"_id": e["livre_id"]}, {"$set": {"disponible": True}})

    updated = emprunts.find_one({"_id": req.emprunt_id})
    return Emprunt(**serialize_emprunt(updated))


#   GET /emprunts

@router.get("/", response_model=List[Emprunt])
def lister_emprunts():
    liste = list(emprunts.find())
    return [Emprunt(**serialize_emprunt(e)) for e in liste]


#  GET /emprunts/retards

@router.get("/retards", response_model=List[Emprunt])
def emprunts_en_retard():
    limite = datetime.now() - timedelta(days=MAX_DUREE_JOURS)

    # Pipeline pour convertir date_emprunt si c'est stocké en string
    pipeline = [
        {"$match": {"statut": "en cours"}},
        {"$addFields": {"date_emprunt_dt": {"$toDate": "$date_emprunt"}}},
        {"$match": {"date_emprunt_dt": {"$lt": limite}}}
    ]

    retard = list(emprunts.aggregate(pipeline))

    if retard:
        emprunts.update_many(
            {"_id": {"$in": [e["_id"] for e in retard]}},
            {"$set": {"statut": "retard"}}
        )

    updated = list(emprunts.find({"statut": "retard"}))
    return [Emprunt(**serialize_emprunt(e)) for e in updated]
