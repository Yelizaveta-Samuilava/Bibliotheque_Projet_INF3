from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta

from database import utilisateurs, livres, emprunts  # ajouter 'emprunts'
from models.utilisateur import EmpruntEmbedded

router = APIRouter(prefix="/emprunts", tags=["Emprunts"])

MAX_DUREE_JOURS = 15


class EmprunterRequest(BaseModel):
    utilisateur_id: int
    livre_id: int


class RendreRequest(BaseModel):
    utilisateur_id: int
    index_emprunt: int  # index dans la liste utilisateur.emprunts


def get_user(user_id: int):
    user = utilisateurs.find_one({"_id": user_id})
    if not user:
        raise HTTPException(404, "Utilisateur introuvable")
    return user


# -------------------------------
# ROUTE : emprunter
# -------------------------------
@router.post("/emprunter")
def emprunter_livre(req: EmprunterRequest):

    user = get_user(req.utilisateur_id)
    livre = livres.find_one({"_id": req.livre_id})

    if not livre:
        raise HTTPException(404, "Livre introuvable")
    if livre.get("stock", 0) <= 0:
        raise HTTPException(400, "Livre non disponible")

    #Document pour l'utilisateur
    emprunt_user = EmpruntEmbedded(
        livre_id=req.livre_id,
        date_emprunt=datetime.now(),
        date_retour=datetime.now() + timedelta(days=15),
        statut="en cours"
    )

    emprunt_doc = {
        "utilisateur_id": req.utilisateur_id,
        "livre_id": req.livre_id,
        "date_emprunt": emprunt_user.date_emprunt,
        "date_retour": emprunt_user.date_retour,
        "statut": "en cours"
    }

    emprunts.insert_one(emprunt_doc)

  
    utilisateurs.update_one(
        {"_id": req.utilisateur_id},
        {"$push": {"emprunts": emprunt_user.dict()}}
    )

    #Mettre à jour stock
    livres.update_one({"_id": req.livre_id}, {"$inc": {"stock": -1}})
    livres.update_one({"_id": req.livre_id}, {"$set": {"disponible": livre["stock"] > 1}})

    return {"message": "Emprunt enregistré", "emprunt": emprunt_user}


# -------------------------------
# ROUTE : rendre
# -------------------------------
@router.post("/rendre")
def rendre_livre(req: RendreRequest):

    user = get_user(req.utilisateur_id)

    if req.index_emprunt >= len(user.get("emprunts", [])):
        raise HTTPException(400, "Index d'emprunt invalide")

    emprunt = user["emprunts"][req.index_emprunt]

    if emprunt["statut"] != "en cours":
        raise HTTPException(400, "Cet emprunt n'est pas en cours")

    date_emprunt = datetime.fromisoformat(emprunt["date_emprunt"]) \
        if isinstance(emprunt["date_emprunt"], str) else emprunt["date_emprunt"]

    retard = (datetime.now() - date_emprunt).days > MAX_DUREE_JOURS

    utilisateurs.update_one(
        {"_id": req.utilisateur_id},
        {
            "$set": {
                f"emprunts.{req.index_emprunt}.statut": "retard" if retard else "rendu",
                f"emprunts.{req.index_emprunt}.date_retour": datetime.now()
            }
        }
    )

    emprunts.update_one(
        {"utilisateur_id": req.utilisateur_id, "livre_id": emprunt["livre_id"], "statut": "en cours"},
        {"$set": {
            "statut": "retard" if retard else "rendu",
            "date_retour": datetime.now()
        }}
    )

    #Mettre à jour stock
    livres.update_one({"_id": emprunt["livre_id"]}, {"$inc": {"stock": +1}})
    livres.update_one({"_id": emprunt["livre_id"]}, {"$set": {"disponible": True}})

    return {"message": "Livre rendu", "retard": retard}


# -------------------------------
# ROUTE : liste par utilisateur
# -------------------------------
@router.get("/user/{user_id}")
def emprunts_par_utilisateur(user_id: int):
    user = get_user(user_id)
    emprunts_liste = []

    for emp in user.get("emprunts", []):
        livre = livres.find_one({"_id": emp["livre_id"]})
        emprunts_liste.append({
            "livre_id": emp["livre_id"],
            "titre": livre["titre"] if livre else "Titre inconnu",
            "date_emprunt": emp["date_emprunt"],
            "date_retour": emp.get("date_retour"),
            "statut": emp["statut"]
        })

    return emprunts_liste


# -------------------------------
# ROUTE : retards
# -------------------------------
@router.get("/retards/{user_id}")
def retards_utilisateur(user_id: int):
    user = get_user(user_id)
    en_retard = []

    for e in user.get("emprunts", []):
        date_emprunt = datetime.fromisoformat(e["date_emprunt"]) \
            if isinstance(e["date_emprunt"], str) else e["date_emprunt"]
        if e["statut"] == "en cours" and (datetime.now() - date_emprunt).days > MAX_DUREE_JOURS:
            en_retard.append(e)

    return en_retard
