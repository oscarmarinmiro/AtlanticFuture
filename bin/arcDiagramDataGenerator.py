# -*- coding:utf-8 -*-
import sys
import csv
try:
    import simplejson as json
except ImportError:
    import json

COUNTRIES_FILE = '../data/atlantic_top_countries.tsv'
MOVEMENTS_FILE = '../data/atlantic_top_movements.tsv'
#MOVEMENTS_FILE = '../data/atlantic_movements.tsv'
REMITTANCE_FILE = '../data/remittanceData.json'
RESULT_FILE = '../data/arc_movements.json'


remittance_data = json.load(open(REMITTANCE_FILE,'r'))

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
        if row['target'] == 'US' and row['source']=='MX':
            print row['target']
            print row['source']
            print row['value']
        if not row['year'] in movements:
            movements[row['year']] = dict()
        k = '{}-{}'.format(row['source'], row['target'])
        if not k in movements[row['year']]:
            print row['source']
            print row['target']
            print remittance_data["2012"].keys()
            remittance_factor = remittance_data["2012"][row['source']][row['target']]
            movements[row['year']][k] = {'source': row['source'],
                                         'target': row['target'],
                                         'value': row['value'],
                                         'remittance': remittance_factor,
                                         'type': 'OUT',
                                         'year': row['year']}

        else:
            movements[row['year']]['value'] += row['value']

        #k = '{}-{}'.format(row['target'], row['source'])
        #if not k in movements[row['year']]:
        #    movements[row['year']][k] = {'source': row['target'],
        #                                 'target': row['source'],
        #                                 'value': row['value'],
        #                                 'year': row['year'],
        #                                 'type': 'IN'}


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
        if movement['source'] == 'MX' and movement['target'] == 'US':
            print "ESTE!!!!"
            print movement['value']
        if not year in links:
            links[year] = list()
        links[year].append({'source': nodesAux[movement['source']], 'target': nodesAux[movement['target']],
                      'value': movement['value'], 'type': movement['type'],
                      'remittance': movement['remittance']})
result['links'] = links


with open(RESULT_FILE, 'wt') as f:
    json.dump(result, f, sort_keys=True, indent=4)
