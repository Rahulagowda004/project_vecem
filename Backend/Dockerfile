# Use Python 3.11
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# ✅ Expose port 8000 (not 5000)
EXPOSE 8000

# ✅ Run uvicorn on port 8000 (not 5000)
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
