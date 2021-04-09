#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Feb 14 19:49:26 2021

@author: sheng
"""

import pandas as pd
import re


pattern = r'\[.*?\]'
# remove [content]
recipes = [re.sub(pattern, '',x) for x in list_of_recipes]

iba = pd.DataFrame({"cocktail": list_of_cocktails, "recipe":recipes})

iba.to_csv("IBAcocktails0.tsv",sep="\t",index=False)


recipes_ingredient = [re.sub("Made with", '',x) for x in recipes]

recipes_ingredient = [re.sub("and", '',x) for x in recipes_ingredient]

recipes_ingredient1 = [x.split(".")[0] for x in recipes_ingredient]

recipes_ingredient1 = [x.split(",") for x in recipes_ingredient1]

recipes_ingredient1 = recipes_ingres=[[x.strip() for x in y] for y in recipes_ingredient1]

with open("ingredients.txt","w") as f:
    for line in recipes_ingres:
        f.write(",".join(line)+"\n")
        
## precessed ingredients.txt into ~_processed.txt
        
ingredients = []
with open("ingredients_processed.txt","r") as f:
    for line in f:
        ingredients.append(line.strip().split(","))
 
IBAcocktails = pd.read_csv("IBAcocktails0.tsv",sep="\t")
list_of_cocktails = IBAcocktails.cocktail
recipes = IBAcocktails.recipe

from collections import defaultdict
tail2ing = []
for i, tail in enumerate(list_of_cocktails):
    for j,ingre in enumerate(ingredients[i]):
        temp = {"source":ingre.lower().strip(), "target": tail, "type": "ingredient"}
        tail2ing.append(temp)
        
all_ingredients = [x.lower().strip() for x in list(set([item for sublist in ingredients for item in sublist]))]
ing2sub = []
texts = ["rum","lime","lemon",
         "chartreuse","bitters","whiskey",
         "vermouth","gin","brandy","syrup"]
for i, ingred in enumerate(all_ingredients):
    for text in texts:
        if text in ingred and text != ingred:
            temp = {"source": text, "target": ingred, "type":"category"}
            ing2sub.append(temp)
        
ing2sub.append({"source": "brandy", "target": "cognac", "type":"category"})
ing2sub.append({"source": "brandy", "target": "calvados", "type":"category"})
ing2sub.append({"source": "whiskey", "target": "bourbon", "type":"category"})
ing2sub.append({"source": "whiskey", "target": "scotch", "type":"category"})

nodes = []
for ct,rpp in zip(list_of_cocktails, recipes):
    nodes.append({"name": ct.strip(), "type": "cocktail", "text": rpp})
for it in all_ingredients:
    nodes.append({"name": it, "type": "ingredient"})
    
nodes.append({"name": "lemon", "type": "ingredient"})
nodes.append({"name": "syrup", "type": "ingredient"})
nodes.append({"name": "chartreuse", "type": "ingredient"})

### reformulate nodes into a dict
nodes1 = {}
for node in nodes:
    nodes1[node['name']] = node
    
    
########## semantic networks ##########
ingredients0 = ingredients

def replace_w_general(text):
    if "vermouth" in text.lower():
        text = "vermouth"
    elif "whiskey" in text.lower() or "bourbon" in text.lower() or "scotch" in text.lower():
        text = "whiskey"
    elif "lemon" in text.lower():
        text = "lemon"
    elif "lime" in text.lower():
        text = "lime"
    elif "bitters" in text.lower():
        text = "bitters"
    elif "chartreuse" in text.lower():
        text = "chartreuse"
    elif "rum" in text.lower():
        text = "rum"
    elif "brandy" in text.lower() or "cognac" in text.lower() or "calvados" in text.lower():
        text = "brandy"
    elif "gin" in text.lower():
        text = "gin"
    elif "syrup" in text.lower():
        text = "syrup"
    return text

# collapse lemon stuff to just lemon
ingredients = [ [replace_w_general(ingred) for ingred in ingredient] for ingredient in ingredients]

# tolower
ingredients = [[text.lower() for text in ingre] for ingre in ingredients]

# dedup
ingredients = [list(set(ingre)) for ingre in ingredients]

## single counts
from collections import defaultdict
ingcount1 = defaultdict(int)
for ingredient in ingredients:
    for ing in ingredient:
        ingcount1[ing] += 1

## combo counts
from itertools import combinations
ingcount2 = defaultdict(int)
for ingredient in ingredients:
    for pair in combinations(ingredient,2):
        ingcount2['|'.join(list(set(pair)))] += 1
                           
edges = defaultdict(float)
ingcountu = defaultdict(int)
all_ing = set([item for sublist in ingredients for item in sublist])
for pair in combinations(list(all_ing),2):
    in1, in2 = pair
    pair = '|'.join([in1,in2])
#for pair in ingcount2:
    #in1, in2 = pair.split("|")
    for ingredient in ingredients:
        if in1 in ingredient or in2 in ingredient:
            ingcountu[pair] += 1
    edges[pair] = ingcount2[pair]*1.0 / (ingcountu[pair])

# sort by edge value
edgesx = {k: v for k, v in sorted(edges.items(), key=lambda item: item[1], reverse=True)}






.≥≥≥≥≤≤≤≤≤≤≤≤®
