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
         "vermouth","gin","brandy"]
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
for ct in list_of_cocktails:
    nodes.append({"name": ct.strip(), "type": "cocktail"})
for it in all_ingredients:
    nodes.append({"name": it, "type": "ingredient"})
    
nodes.append({"name": "lemon", "type": "ingredient"})
    
nodes.append({"name": "chartreuse", "type": "ingredient"})