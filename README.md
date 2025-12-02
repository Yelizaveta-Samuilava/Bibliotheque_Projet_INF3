📚 Projet Bibliothèque – FastAPI & MongoDB

Application de gestion de bibliothèque permettant de gérer les utilisateurs, les livres, les emprunts, la disponibilité et les retards.
Développée dans le cadre du module BD NoSQL – M1 IBI.

🚀 Fonctionnalités principales

Gestion des utilisateurs (création, rôle utilisateur/admin)

Gestion des livres (ajout,recherche)

Gestion des emprunts avec limite de 15 jours

Gestion des retards

Détection automatique des retards

Vérification de disponibilité

Fonctionnalités statistiques avec aggrégations (top emprunts, auteurs, catégorie, durée moyenne d'emprunts)

Endpoints documentés avec Swagger / ReDoc

Interface utilisateur développée en React

🛠️ Technologies utilisées

Python 3.10+

FastAPI

MongoDB

Pydantic

Uvicorn


📂 Structure du backend
/app
│── main.py
│── database.py
│── models/
│── routers/
│── utils/
│
requirements.txt
README.md

⚙️ Installation & Lancement 
1️⃣ Cloner le dépôt
git clone https://github.com/<ton-username>/<ton-repo>.git
cd <ton-repo>

2️⃣ Créer et activer l’environnement virtuel
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
.venv\Scripts\activate           # Windows

3️⃣ Installer les dépendances
pip install -r requirements.txt

4️⃣ Configurer MongoDB

Modifier database.py si besoin :

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "bibliotheque"

5️⃣ Lancer l’API
uvicorn app.main:app --reload

6️⃣ Accéder à la documentation API

Swagger : http://localhost:8000/docs

Depuis le dossier bibliothèque\frontend :

1️⃣ Installer les dépendances
cd frontend
npm install

2️⃣ Lancer le serveur React

npm start      
Interface accessible sur :

➡️ http://localhost:3000/
 (CRA)

✨ Auteurs : 
 
Projet réalisé par Ilayda Abdoul, Sarah Lakrouz, Yelizaveta Samuilava, Amina Zouane.
