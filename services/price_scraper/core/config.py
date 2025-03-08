from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Price Scraper API"
    
    # Scraping Settings
    BASE_URL: str = "https://www.foodbasics.ca"
    SCREENSHOT_DIR: Path = Path("./screenshots")
    MIN_DELAY: int = 5
    MAX_DELAY: int = 10
    
    # File paths
    DEFAULT_MAPPING_FILE: Path = Path("data/reference_products_mapping.csv")
    
    class Config:
        env_file = ".env"

settings = Settings() 