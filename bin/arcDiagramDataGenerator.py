# -*- coding:utf-8 -*-

import csv
try:
    import simplejson as json
except ImportError:
    import json

COUNTRIES_FILE = '../data/atlantic_top_countries.tsv'
MOVEMENTS_FILE = '../data/atlantic_top_movements.tsv'
#MOVEMENTS_FILE = '../data/atlantic_movements.tsv'
RESULT_FILE = '../data/arc_movements.json'

countries = dict()
with open(COUNTRIES_FILE, 'rt') as f:
    countries_reader = csv.DictReader(f, delimiter='\t')
    for row in countries_reader:
        countries[row['ISO2']] = row
movements = dict()
with open(MOVEMENTS_FILE, 'rt') as f:
    movements_reader = csv.DictReader(f, delimiter='\t')
    for row in movements_reader:
        print row['year']
        if not row['year'] in movements:
            movements[row['year']] = dict()
        k = '{}-{}'.format(row['source'], row['target'])
        if not k in movements[row['year']]:
            movements[row['year']][k] = {'source': row['source'],
                                         'target': row['target'],
                                         'value': row['value'],
                                         'type': 'OUT',
                                         'year': row['year']}
        k = '{}-{}'.format(row['target'], row['source'])
        if not k in movements[row['year']]:
            movements[row['year']][k] = {'source': row['target'],
                                         'target': row['source'],
                                         'value': row['value'],
                                         'year': row['year'],
                                         'type': 'IN'}
result = dict()
nodes = list()
nodesAux = dict()
node_id = 0
for country_key, country_data in countries.items():
    nodes.append({'id': node_id, 'name': country_data['name'], 'iso2': country_data['ISO2'],
                  'pop2005': country_data['pop2005'], 'currencyName': country_data['currencyName'],
                  'languages': country_data['languages'], 'currencyNumeric': country_data['currencyNumeric'],
                  'hdi': country_data['HDI']})
    nodesAux[country_key] = node_id
    node_id += 1
result['nodes'] = nodes
#links = list()
links = dict()
for year in movements.keys():
#for movement in movements[movements.keys()[0]].values():
    for movement in movements[year].values():
        if not year in links:
            links[year] = list()
        links[year].append({'source': nodesAux[movement['source']], 'target': nodesAux[movement['target']],
                      'value': movement['value'], 'type': movement['type']})
result['links'] = links
with open(RESULT_FILE, 'wt') as f:
    json.dump(result, f, sort_keys=True, indent=4)
