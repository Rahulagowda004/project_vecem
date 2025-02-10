FROM python:3.13.0-slim

WORKDIR /usr/src/app
COPY requirements.txt ./

RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

EXPOSE 3000

CMD [ "python", "./src/server.py" ]