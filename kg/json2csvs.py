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
all_items = set(list(links.source)+list(links.target))
node_pool = list(nodes.id)
node_dict = defaultdict(int)
for nd in node_pool:
    node_dict[nd] += 1
for it in all_items:
    if node_dict[it] <= 0:
        print("Heck, "+it+" is NOT included in nodes!!!")

# check if all nodes' group values are filled, if not ERROR
nodes[nodes.group.isna()]
nodes[nodes.group.isnull()]

# check if all links' value fields are filled if not, auto-fill
links[links.value.isna()]
links[links.value.isnull()]

# crosswalk maps source-target-groups to link value
# key: str(node_a.group)+"-"+str(node_b.group)
crosswalk = defaultdict(int)
for i in range(5):
    crosswalk[str(i)+"-"+str(i+1)] = i
crosswalk['5-5'] = 5

#finding group value given a link source
int(nodes.group[nodes.id==links.source[0]])

# autogenerate link values based on nodes group values
#assigning link value by node groups using crosswalk
values = []
for src, targ in zip(links.source[links.value.isnull()], links.target[links.value.isnull()]):
    values.append(crosswalk[str(int(nodes.group[nodes.id==src])+"-"+str(int(nodes.group[nodes.id==targ])])

links.value[links.value.isnull()] = values


### save to json file
jsf = defaultdict(list)
jsf['nodes'] = [{"id":ind, "group": grp} for ind, grp in zip(nodes.id, nodes.group)]
jsf['links'] = [{"source": src, "target": tg, "value": vl} for src, tg, vl in zip(links.source, links.target, links.value)]

if os.path.exists("/Users/sheng/somm-ai.github.io/kg/"+filename+".json"):
    print("no overeriting!!")
else:
    with open("/Users/sheng/somm-ai.github.io/kg/"+filename+".json","w") as tjs:
        ujson.dump(jsf, tjs)
