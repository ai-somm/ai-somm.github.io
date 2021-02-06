#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Feb  5 20:19:11 2021

@author: sheng
"""

### input burgundy.json
### output burgundy_links.csv, burgundy_nodes.csv

import os, json, ujson, pandas

##### from one json file (region.json) to two csv files (region_links.csv, region_nodes.csv)

filename = "burgundy0"

with open("/Users/sheng/somm-ai.github.io/kg/"+filename+".json","r") as js:
    jsfile = ujson.load(js)
    
nodes = pandas.DataFrame({"id": [x['id'] for x in jsfile['nodes']], "group": [x['group'] for x in jsfile['nodes']]})

links = pandas.DataFrame({"target": [x['target'] for x in jsfile['links']], 
                          "value": [x['value'] for x in jsfile['links']], 
                          "source": [x['source'] for x in jsfile['links']]})

nodes.to_csv("/users/sheng/somm-ai.github.io/kg/"+filename+"_nodes.csv", index=False)

links.to_csv("/users/sheng/somm-ai.github.io/kg/"+filename+"_links.csv", index=False)


##### from two csv files (region_links.csv, region_nodes.csv) to one json file (region.json) 
from collections import defaultdict

filename = "burgundy0"

nodes = pandas.read_csv("/Users/sheng/somm-ai.github.io/kg/"+filename+"_nodes.csv")

links = pandas.read_csv("/Users/sheng/somm-ai.github.io/kg/"+filename+"_links.csv")

# check of all link ends are included in nodes, if not ERROR


# check if all nodes' group values are filled, if not ERROR

# check if all links' value fields are filled if not, auto-fill

# autogenerate link values based on nodes group values

jsf = defaultdict(list)
jsf['nodes'] = [{"id":ind, "group": grp} for ind, grp in zip(nodes.id, nodes.group)]
jsf['links'] = [{"source": src, "target": tg, "value": vl} for src, tg, vl in zip(links.source, links.target, links.value)]

if os.path.exists("/Users/sheng/somm-ai.github.io/kg/"+filename+".json"):
    print("no overeriting!!")
else:
    with open("/Users/sheng/somm-ai.github.io/kg/"+filename+".json","w") as tjs:
        ujson.dump(jsf, tjs)
