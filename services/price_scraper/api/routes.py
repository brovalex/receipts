from fastapi import APIRouter, HTTPException
from typing import List

from ..core.scraper import PriceScraper
from ..core.config import Settings
from .schemas import ScrapeRequest, ScrapedProductResponse, ErrorResponse

router = APIRouter()
settings = Settings()

# @router.post("/scrape", response_model=List[ScrapedProductResponse])
# async def scrape_products(request: ScrapeRequest):
#     """
#     Scrape product prices for given reference item IDs
#     """
#     try:
#         scraper = PriceScraper(
#             mapping_file=request.mapping_file or settings.DEFAULT_MAPPING_FILE
#         )
#         results = scraper.scrape_missing_proofs(request.reference_item_ids)
#         return [ScrapedProductResponse(**result.to_dict) for result in results]
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )

@router.post("/scrape", response_model=None)
async def scrape_products(request: ScrapeRequest):
    """
    Scrape product prices for given reference item ID.
    Returns 200 OK on success, 500 on error.
    """
    try:
        scraper = PriceScraper(
            mapping_file=request.mapping_file or settings.DEFAULT_MAPPING_FILE
        )
        scraper.get_product_proof(request.reference_item_id)
        return None
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"} 