FROM continuumio/miniconda3

WORKDIR /usr/src/app

COPY . .

RUN conda env create -f environment.yml -n inflight

RUN conda config --set auto_activate_base false
