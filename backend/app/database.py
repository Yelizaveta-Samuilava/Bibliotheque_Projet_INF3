from pymongo import MongoClient, ASCENDING, TEXT
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://127.0.0.1:27017")
client = MongoClient(MONGO_URL)
db = client.bibliotheque  # Nom de la base

# Collections
livres = db.livres
utilisateurs = db.utilisateurs
emprunts = db.emprunts
categories = db.categories


# Création des index
livres.create_index([("categorie_id", ASCENDING)])
livres.create_index([("titre", TEXT), ("auteur", TEXT)])
livres.create_index([("disponible", ASCENDING), ("stock", ASCENDING)])
utilisateurs.create_index([("email", ASCENDING)], unique=True)
