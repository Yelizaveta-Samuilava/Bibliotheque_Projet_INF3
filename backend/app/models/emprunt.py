from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class Emprunt(BaseModel):
    id: int = Field(alias="_id")
    utilisateur_id: int
    livre_id: int
    date_emprunt: datetime
    date_retour: Optional[datetime] = None
    statut: str

 