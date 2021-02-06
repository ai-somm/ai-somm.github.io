#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Fri Feb  5 20:19:11 2021

@author: sheng
"""

### input burgundy.json
### output burgundy_links.csv, burgundy_nodes.csv

import os, json, ujson, pandas

with open("/Users/sheng/somm-ai.github.io/kg/burgundy0.json","r") as js:
    jsfile = ujson.load(js)
    
nodes = pandas.DataFrame({"id": [x['id'] for x in jsfile['nodes']], "group": [x['group'] for x in jsfile['nodes']]})

links = pandas.DataFrame({"target": [x['target'] for x in jsfile['links']], "value": [x['value'] for x in jsfile['links']], "source": [x['source'] for x in jsfile['links']]})
