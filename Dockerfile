FROM continuumio/miniconda3

WORKDIR /usr/src/app

COPY . .

RUN conda env create -f environment.yml -n aerosight

RUN conda config --set auto_activate_base false
