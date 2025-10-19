#!/bin/bash

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - DRAPE virtual try-on SaaS"

# Créer la branche main
git branch -M main

# Ajouter le remote
git remote add origin https://github.com/jeanchristophe-Git/drape.git

# Push
git push -u origin main
