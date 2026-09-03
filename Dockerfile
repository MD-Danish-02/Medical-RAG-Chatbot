FROM python:3.10-slim

WORKDIR /app

COPY . /app

# Install CPU-only PyTorch first (Oracle Ampere has no NVIDIA GPU)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8080

CMD ["python", "app.py"]
