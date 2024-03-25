FROM continuumio/miniconda3

WORKDIR /usr/src/app

COPY . .

RUN conda env create -f environment.yml -n inflight

SHELL ["conda", "run", "-n", "inflight", "/bin/bash", "-c"]

ENTRYPOINT ["conda", "run", "--no-capture-output", "-n", "inflight", "python", "app.py"]
