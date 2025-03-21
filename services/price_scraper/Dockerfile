FROM python:3.11-slim

# Install Chrome and dependencies
# RUN apt-get update && apt-get install -y \
#     wget \
#     gnupg \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
#     && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
#     && apt-get update && apt-get install -y \
#     google-chrome-stable \
#     && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Command to run the FastAPI application
# CMD ["uvicorn", "services.price_scraper.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]