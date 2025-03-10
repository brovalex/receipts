from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ScrapeRequest(BaseModel):
    reference_item_id: int

class ScrapedProductResponse(BaseModel):
    name: str
    quantity: float
    unit_of_measure: str
    price: float
    price_per_weight: float
    reference_url: str
    created_at: datetime
    reference_item_id: int
    screenshot: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None 