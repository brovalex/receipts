from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class ScrapedProduct:
    name: str
    quantity: float
    unit_of_measure: str
    price: float
    price_per_weight: float
    reference_url: str
    created_at: datetime
    reference_item_id: int
    screenshot_path: Optional[str] = None

    @property
    def to_dict(self):
        return {
            "name": self.name,
            "quantity": self.quantity,
            "unitOfMeasure": self.unit_of_measure,
            "price": self.price,
            "pricePerWeight": self.price_per_weight,
            "referenceUrl": self.reference_url,
            "createdAt": self.created_at.isoformat(),
            "reference_item_id": self.reference_item_id,
            "screenshot": self.screenshot_path
        } 