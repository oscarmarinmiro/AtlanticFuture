__author__ = 'oscarmarinmiro'

import networkx as nx
import csv
import pprint

YEAR = "2013"

WORLD_FILE = "../data/movements_world_network.tsv"

CODES_FILE = "../assets/country_codes_and_facts.csv"

COUNTRIES_FILE = "../data/atlantic_top_countries.tsv"

NON_ATLANTIC = "Non_Atlantic"

# Get country data

fileIn = open(COUNTRIES_FILE,"rbU")

reader = csv.reader(fileIn,delimiter="\t")

header = reader.next()

countries = {}

for row in reader:
    myData = {}
    for i in range(0,len(row)):
        myData[header[i]] = row[i]
    countries[myData['ISO2']] = myData

countries[NON_ATLANTIC] = {'HDI': 0.64,'M49':999999, 'currencyName': 'Unknown','currencyNumeric': -1, 'isIndependent': 'Unknown', 'iso2': NON_ATLANTIC, 'lat': '0.0','lon': '0.0','name': 'Non-atlantic','pop2005': 6454000000 - 1236535089}



for country in countries:
    countries[country]['lat'] = float(countries[country]['lat'])
    countries[country]['lon'] = float(countries[country]['lon'])
    countries[country]['HDI'] = float(countries[country]['HDI'])
    countries[country]['Label'] = countries[country]['name']

# Get codes

fileIn = open(CODES_FILE,"rbU")

reader = csv.reader(fileIn)

header = reader.next()

codes = {}

for row in reader:
    codes[row[1]] = row[0]

codes[NON_ATLANTIC] = NON_ATLANTIC


# Get languages indexed by ISO2

fileIn = open(WORLD_FILE,"rbU")


reader = csv.reader(fileIn,delimiter="\t")

header = reader.next()

movements = []

for row in reader:
    myData = {}
    for i in range(0,len(row)):
        myData[header[i]] = row[i]

    myData['sourceName'] = codes[myData['source']]
    myData['targetName'] = codes[myData['target']]

    movements.append(myData)



fileIn.close()

#pprint.pprint(movements)

G = nx.DiGraph()

for data in movements:
    pprint.pprint(data)
    if data['year'] == YEAR:
        G.add_node(data['source'], countries[data['source']])
        G.add_node(data['target'], countries[data['target']])

        G.add_edge(data['source'],data['target'],{'weight' : data['value']})

pprint.pprint(G)

nx.write_gexf(G, "migData."+str(YEAR)+".gexf")
