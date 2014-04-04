import csv
import pprint
import json


YEAR = "1990"

TOP_N = 63

TOP_N_MOVEMENTS = 63

COUNTRY_CODE_FILE = "../assets/country_codes_and_facts.csv"

ATLANTIC_COUNTRIES_FILE = "../assets/atlantic_countries.csv"

HDI_FILE = "../assets/HDI.csv"

MIGRATION_DATA_FILE = "../assets/migrationData.json"

MIGRATION_EXTRA = "../assets/extraData.json"

DISTANCES_FILE = "../assets/atlantic_countries_distances.csv"

LANGUAGES_FILE = "../assets/atlantic_countries_lang.tsv"

MOVEMENTS_IN = "../data/atlantic_movements.tsv"

def getISO2FromM49(myM49):
    if str(myM49) in countryCodesM49:
        return countryCodesM49[str(myM49)]['ISO2']
    else:
        return "-1"


# Get languages indexed by ISO2

fileIn = open(LANGUAGES_FILE,"rbU")

langDict = {}

reader = csv.reader(fileIn,delimiter="\t")

header = reader.next()

for row in reader:
    code = row[1]
    langs = row[5]
    langVector = langs.split("/")

    langDict[code] = langVector

fileIn.close()

# pprint.pprint(langDict)
#
# print sameLanguage("BE","VE")
#
# exit(1)

# Get distances in km for each pair of ISO2 in atlantic

distanceMatrix = {}

fileIn = open(DISTANCES_FILE,"rb")

reader = csv.reader(fileIn)

header = reader.next()

for row in reader:
    source = row[0]
    for i in range(1,len(row)):
        distance = row[i]
        target = header[i]
        if source not in distanceMatrix:
            distanceMatrix[source] = {}
        distanceMatrix[source][target] = distance

fileIn.close()


# Get country codes and facts indexed by ISO2+M49

countryCodesISO2 = {}
countryCodesM49 = {}

fileIn = open(COUNTRY_CODE_FILE,"rb")

reader = csv.reader(fileIn)

header = reader.next()

for row in reader:
    countryData = {}
    for i in range(0,len(row)):
        countryData[header[i]] = row[i].decode("utf8")

    countryCodesISO2[countryData['ISO2']] = countryData
    countryCodesM49[countryData['M49']] = countryData

fileIn.close()


# pprint.pprint(countryCodesISO2)
# print "======================="
# pprint.pprint(countryCodesM49)


# Get atlantic countries additional data indexed by ISO2

atlanticCountriesData = {}

fileIn = open(ATLANTIC_COUNTRIES_FILE,"rb")

reader = csv.reader(fileIn)

header = reader.next()

for row in reader:
    countryData = {}
    for i in range(0,len(row)):
        countryData[header[i]] = row[i].decode("utf8")

    atlanticCountriesData[countryData['name']] = countryData

    #pprint.pprint(countryData)

fileIn.close()

#pprint.pprint(atlanticCountriesData)

# Get HDI Data and augment atlanticCountriesData

fileIn = open(HDI_FILE,"rb")

reader = csv.reader(fileIn)

header = reader.next()

numAtlantic = 0

HDICountries = {}

for row in reader:
    name = row[1].decode("utf8")

    # Take 2012 data

    if row[3]!="..":
        # 2012
        #avgHDI = float(row[12])
        # 1990
        avgHDI = float(row[3])
        # 2000
        #avgHDI = float(row[4])
        # 2010
        #avgHDI = float(row[10])

    else:
        # Average for 2012
        #avgHDI = 0.64
        # Average for 1990
        avgHDI = 0.481
        # Average for 2000
        #avgHDI = 0.549
        # Average for 2010
        #avgHDI = 0.631


    HDICountries[name] = True

    # Old commented way: average of all HDI
    # HDI_Series = row[2:]
    #
    # # Calculate avg of every point (when points are != '..' [NA])
    #
    # numPoints = 0
    # sumPoints = 0
    #
    # for point in HDI_Series:
    #     if point!="..":
    #         sumPoints += float(point)
    #         numPoints += 1
    #
    #
    # if numPoints!= 0:
    #     avgHDI = sumPoints/numPoints
    # else:
    #     avgHDI = 0
    #
    # HDICountries[name] = True
    #
    # #print "%s: %f" % (name,avgHDI)

    if name in atlanticCountriesData:
        atlanticCountriesData[name]['HDI'] = avgHDI

fileIn.close()

#print "NumAtlantic: %d Real: %d" % (numAtlantic,len(atlanticCountriesData.keys()))

for country in atlanticCountriesData:
    if country not in HDICountries:
        print "ERROR IN %s" % country

#pprint.pprint(atlanticCountriesData)

# Get atlanticData by ISO2

atlanticISO2 = {}

for country in atlanticCountriesData:
    myISO2 = atlanticCountriesData[country]['iso2']
    atlanticISO2[atlanticCountriesData[country]['iso2']] = atlanticCountriesData[country]
    atlanticISO2[atlanticCountriesData[country]['iso2']]['M49'] = countryCodesISO2[atlanticCountriesData[country]['iso2']]['M49']
    for field in ['currencyName','currencyNumeric','isIndependent']:
        atlanticISO2[atlanticCountriesData[country]['iso2']][field] = countryCodesISO2[atlanticCountriesData[country]['iso2']][field]


#pprint.pprint(atlanticISO2)

# At this point we have data like (so -> lat, lon, name, pop2005,HDI, currencyName, currencyNumeric, isIndependent)
#  u'VE': {'HDI': 0.70472727272727276,
#          'M49': u'862',
#          'currencyName': u'Bolivar',
#          'currencyNumeric': u'937',
#          'isIndependent': u'Yes',
#          'iso2': u'VE',
#          'lat': u'7.125',
#          'lon': u'-66.166',
#          'name': u'Venezuela',
#          'pop2005': u'26725573'}


#pprint.pprint(atlanticISO2)
#pprint.pprint(langDict)

# Build reverse hash of language

reverseLang = {}

for ISO2 in langDict:
    for lang in langDict[ISO2]:
        if lang not in reverseLang:
            reverseLang[lang] = []
        reverseLang[lang].append(ISO2)

#pprint.pprint(reverseLang)


# Build distances, HDI, Percent hash

inTotal = 0
outTotal = 0
totalTotal = 0

countryTotals = {}

langDistance = {}

langHDI = {}

langPercent = {}


fileIn = open(MOVEMENTS_IN,"rbU")

reader = csv.reader(fileIn,delimiter="\t")

header = reader.next()

movements = []


countryTotals['all'] = {'in':0,'out':0,'total':0}

for row in reader:
    myData = {}
    for i in range(0,len(row)):
        myData[header[i]] = row[i]

    if myData['year']== YEAR:
        source = myData['source']
        target = myData['target']
        value = int(myData['value'])

        for lang in langDict[source]:

            if lang not in langPercent:
                langPercent[lang] = {'in':{'value':0,'count':0},'out':{'value':0,'count':0},'total':{'value':0,'count':0}}

            if lang not in langHDI:
                langHDI[lang] = {'in':{'value':0,'count':0},'out':{'value':0,'count':0},'total':{'value':0,'count':0}}

            if lang not in langDistance:
                langDistance[lang] = {'in':{'value':0,'count':0},'out':{'value':0,'count':0},'total':{'value':0,'count':0}}

            langPercent[lang]['out']['value']+= value
            langPercent[lang]['out']['count']+= 1
            langPercent[lang]['total']['value']+= value
            langPercent[lang]['total']['count']+= 1

            langDistance[lang]['out']['value'] += float(myData['distance'])*value
            langDistance[lang]['out']['count'] += value

            langDistance[lang]['total']['value'] += float(myData['distance'])*value
            langDistance[lang]['total']['count'] += value

            langHDI[lang]['out']['value'] += float(myData['sourceHDI'])*value
            langHDI[lang]['out']['count'] += value

            langHDI[lang]['total']['value'] += float(myData['sourceHDI'])*value
            langHDI[lang]['total']['count'] += value



        if source not in countryTotals:
            countryTotals[source] = {'in':0,'out':0,'total':0}

        countryTotals[source]['out']+=value
        countryTotals[source]['total']+=value


        countryTotals['all']['out']+=value
        countryTotals['all']['total']+=value


        for lang in langDict[target]:

            if lang not in langPercent:
                langPercent[lang] = {'in':{'value':0,'count':0},'out':{'value':0,'count':0},'total':{'value':0,'count':0}}

            if lang not in langHDI:
                langHDI[lang] = {'in':{'value':0,'count':0},'out':{'value':0,'count':0},'total':{'value':0,'count':0}}

            if lang not in langDistance:
                langDistance[lang] = {'in':{'value':0,'count':0},'out':{'value':0,'count':0},'total':{'value':0,'count':0}}

            langPercent[lang]['in']['value']+= value
            langPercent[lang]['in']['count']+= 1

            langPercent[lang]['total']['value']+= value
            langPercent[lang]['total']['count']+= 1

            langDistance[lang]['in']['value'] += float(myData['distance'])*value
            langDistance[lang]['in']['count'] += value

            langDistance[lang]['total']['value'] += float(myData['distance'])*value
            langDistance[lang]['total']['count'] += value

            langHDI[lang]['in']['value'] += float(myData['targetHDI'])*value
            langHDI[lang]['in']['count'] += value

            langHDI[lang]['total']['value'] += float(myData['targetHDI'])*value
            langHDI[lang]['total']['count'] += value



        if target not in countryTotals:
            countryTotals[target] = {'in':0,'out':0,'total':0}

        countryTotals[target]['in']+=value
        countryTotals[target]['total']+=value

        countryTotals['all']['in']+=value
        countryTotals['all']['total']+=value


fileIn.close()

# pprint.pprint(langPercent)
#
# pprint.pprint(countryTotals)
#
# pprint.pprint(langHDI)
#
# pprint.pprint(langDistance)

# And now, calculate averages

for lang in langHDI:
    for direction in ['in','out','total']:
        langHDI[lang][direction]['avg'] = langHDI[lang][direction]['value'] / langHDI[lang][direction]['count']

for lang in langDistance:
    for direction in ['in','out','total']:
        langDistance[lang][direction]['avg'] = langDistance[lang][direction]['value'] / langDistance[lang][direction]['count']

for lang in langPercent:
    for direction in ['in','out','total']:
        langPercent[lang][direction]['percent'] = (float(langPercent[lang][direction]['value'])/ float(countryTotals['all'][direction])+0.0)* 100.0

#pprint.pprint(countryTotals)

for country in countryTotals:
    for direction in ['in','out','total']:
        countryTotals[country][direction+'Percent'] = (float(countryTotals[country][direction])/ float(countryTotals['all'][direction])+0.0)* 100.0

#pprint.pprint(langPercent)

#pprint.pprint(countryTotals)

#pprint.pprint(langHDI)
#
#pprint.pprint(langDistance)

explicacion = {'in': 'Llega a un pais de esa lengua, HDI del destino','out':'Sale de un pais de esa lengua, HDI del origen', 'total':'Llega o sale de un pais de esa lengua. HDI medio de origenes y destinos'}
for lang in ['es','en','fr','pt']:
    print "========================="
    print "Para el idioma *%s*, anyo %s" % (lang,YEAR)
    print "========================="
    print "Distancias medias"
    for direction in ['in','out','total']:
        print "\tDirecccion %s (%s)" % (direction,explicacion[direction])
        print "\tDistancia media: %f" % langDistance[lang][direction]['avg']
    print "HDI medios"
    for direction in ['in','out','total']:
        print "\tDirecccion %s (%s)" % (direction,explicacion[direction])
        print "\tHDI medio: %f" % langHDI[lang][direction]['avg']
    print "Porcentajes de personas respecto al total"
    for direction in ['in','out','total']:
        print "\tDirecccion %s (%s)" % (direction,explicacion[direction])
        print "\tPorcentaje: %f" % langPercent[lang][direction]['percent']

    print "Paises implicados y su % por direccion"

    for country in countryTotals:
        if country!='all':
            myLangs = langDict[country]
            thisLang = False
            for idiom in myLangs:
                if idiom==lang:
                    thisLang=True
            if thisLang:
                print "Nombre %s In: %f Out %f Total %f" % (atlanticISO2[country]['name'],countryTotals[country]['inPercent'],countryTotals[country]['outPercent'],countryTotals[country]['totalPercent'])

    #for direction in ['in','out','total']:

#pprint.pprint(countryTotals)