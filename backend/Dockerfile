FROM python:3.12-slim-bookworm

# Install system dependencies: ffmpeg, Node.js, and Chromium runtime libraries
# required by Remotion's downloaded chrome-headless-shell browser.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    espeak-ng \
    curl \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxkbcommon0 \
    libxrandr2 \
    libxshmfence1 \
    xdg-utils \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Remotion renderer dependencies in the image so the worker can render
# videos even when the source directory is bind-mounted by docker-compose.
# Also pre-download the headless browser Remotion renders with, so no
# network access is needed at render time.
COPY video-renderer/package*.json ./video-renderer/
RUN cd video-renderer && npm install && npx remotion browser ensure

# Copy app code, including the Remotion renderer source
COPY . .

# Expose default API port (Railway injects PORT at runtime; see CMD below)
EXPOSE 8000

# Default: run the API server. Bind to Railway's injected PORT, falling back
# to 8000 for local `docker run` without -e PORT.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
