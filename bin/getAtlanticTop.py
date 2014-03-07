import csv
import pprint
import json


TOP_N = 20

COUNTRY_CODE_FILE = "../assets/country_codes_and_facts.csv"

ATLANTIC_COUNTRIES_FILE = "../assets/atlantic_countries.csv"

HDI_FILE = "../assets/HDI.csv"

MIGRATION_DATA_FILE = "../assets/migrationData.json"

MIGRATION_EXTRA = "../assets/extraData.json"

DISTANCES_FILE = "../assets/atlantic_countries_distances.csv"

LANGUAGES_FILE = "../assets/atlantic_countries_lang.txt"

MOVEMENTS_OUT = "../data/atlantic_movements.tsv"

MOVEMENTS_OUT_TOP = "../data/atlantic_top_movements.tsv"

COUNTRIES_OUT = "../data/atlantic_top_countries.tsv"

def getISO2FromM49(myM49):
    if str(myM49) in countryCodesM49:
        return countryCodesM49[str(myM49)]['ISO2']
    else:
        return "-1"

def getISO2FromName(country):
    if country in extraData and 'Country code' in extraData[country]:
        return getISO2FromM49(extraData[country]['Country code'])
    else:
        return "-1"

def insertSourceTarget(year,source, target, value, struct):
    if year not in struct:
        struct[year] = {}
    if source not in struct[year]:
        struct[year][source] = {}
    # Only fill if not exists same year, target and source (to avoid duplication)
    if target not in struct[year][source]:
        if 'HDI' in atlanticISO2[source] and 'HDI' in atlanticISO2[target]:
            struct[year][source][target] = {}
            struct[year][source][target]['value'] = value

            myData = struct[year][source][target]

            if atlanticISO2[source]['currencyNumeric'] == atlanticISO2[target]['currencyNumeric']:
                myData['sameCurrency'] = "1"
            else:
                myData['sameCurrency'] = "0"

            myData['sourcePopulation'] = atlanticISO2[source]['pop2005']
            myData['targetPopulation'] = atlanticISO2[target]['pop2005']
            myData['sourceHDI'] = atlanticISO2[source]['HDI']
            myData['targetHDI'] = atlanticISO2[target]['HDI']
            myData['sourceGeo'] = atlanticISO2[source]['lat']+","+atlanticISO2[source]['lon']
            myData['targetGeo'] = atlanticISO2[target]['lat']+","+atlanticISO2[target]['lon']

            myData['distance'] = distanceMatrix[source][target]

            if sameLanguage(source,target):
                myData['sameLanguage'] = "1"
            else:
                myData['sameLanguage'] = "0"


    return

def addGlobalCount(source, target, value, struct,inCount,outCount):

    value = int(value)

    if source not in struct:
        struct[source] = 0
    if target not in struct:
        struct[target] = 0

    if target not in inCount:
        inCount[target] = 0

    if source not in outCount:
        outCount[source] = 0



    struct[source]+=value
    struct[target]+=value
    inCount[target]+=value
    outCount[source]+=value

    return

def sameLanguage(iso2First,iso2Second):

    langsFirst = langDict[iso2First]
    langsSecond = langDict[iso2Second]

    matched = False

    for lang in langsFirst:
        if lang in langsSecond:
            matched = True

    return matched



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
    HDI_Series = row[2:]

    # Calculate avg of every point (when points are != '..' [NA])

    numPoints = 0
    sumPoints = 0

    for point in HDI_Series:
        if point!="..":
            sumPoints += float(point)
            numPoints += 1


    if numPoints!= 0:
        avgHDI = sumPoints/numPoints
    else:
        avgHDI = 0

    HDICountries[name] = True

    #print "%s: %f" % (name,avgHDI)

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

# Load migrationData extraData.json to resolve country codes

extraData = {}

fileIn = open(MIGRATION_EXTRA,"rb")

extraData = json.load(fileIn)

fileIn.close()

# Now... from migrationData, go through each year, country, and if atlantic, count global movements

fileIn = open(MIGRATION_DATA_FILE,"rb")

mStruct = json.load(fileIn)

movements = {}

countryMovements = {}

for year in mStruct:

    for country in mStruct[year]:
        if country in extraData and 'Country code' in extraData[country]:
            myM49 = extraData[country]['Country code']
            myISO2 = getISO2FromM49(myM49)


            # If atlantic country...
            if myISO2 in atlanticISO2:
                migrationData = mStruct[year][country]['migration_data']
                for countryData in migrationData['IN']:
                    thisISO2 = getISO2FromName(countryData['name'])
                    if thisISO2 in atlanticISO2:
                        #print "%s --- %s -> %s %d" % (year,thisISO2,myISO2,countryData['value'])
                        insertSourceTarget(year,myISO2, thisISO2,countryData['value'],countryMovements)
                for countryData in migrationData['OUT']:
                    thisISO2 = getISO2FromName(countryData['name'])
                    if thisISO2 in atlanticISO2:
                        #print "%s --- %s -> %s %d" % (year,myISO2,thisISO2,countryData['value'])
                        insertSourceTarget(year,thisISO2,myISO2,countryData['value'],countryMovements)




fileIn.close()

#pprint.pprint(countryMovements)

# Output contry movements (unfiltered) and count global movements for each country

globalCount = {}
inCount = {}
outCount = {}

fileOut = open(MOVEMENTS_OUT,"wb")

fields = ['value','distance','sameCurrency','sameLanguage','sourceGeo','targetGeo','sourceHDI','targetHDI','sourcePopulation','targetPopulation']

fileOut.write("\t".join(["year","source","target"]+fields)+"\n")


for year in countryMovements:
    for source in countryMovements[year]:
        for target in countryMovements[year][source]:
            myData = countryMovements[year][source][target]
            auxData = [str(myData[field]) for field in fields]
            fileOut.write("\t".join([str(year),source,target]+auxData)+"\n")

            if year=='2013':
                addGlobalCount(source, target, myData['value'],globalCount,inCount,outCount)

fileOut.close()

pprint.pprint(globalCount)

sortedCount = sorted(globalCount.keys(), key = lambda iso2: globalCount[iso2],reverse = True)

sortedCount = sortedCount[:TOP_N]

fileOut = open(COUNTRIES_OUT,"wb")

fields = ['M49','name','lat','lon','pop2005','currencyName','currencyNumeric','HDI','isIndependent']

fileOut.write("\t".join(['ISO2']+fields+['totalMig','inMig','outMig','languages'])+"\n")

for country in sortedCount:
    writeData = [country]+[str(atlanticISO2[country][field]) for field in fields]+[str(globalCount[country]),str(inCount[country]),str(outCount[country]),("/").join(langDict[country])]
    fileOut.write("\t".join(writeData)+"\n")

fileOut.close()

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


# Rewrite reduced movements with only top_N

fileOut = open(MOVEMENTS_OUT_TOP,"wb")

fields = ['value','distance','sameCurrency','sameLanguage','sourceGeo','targetGeo','sourceHDI','targetHDI','sourcePopulation','targetPopulation']

fileOut.write("\t".join(["year","source","target"]+fields)+"\n")


for year in countryMovements:
    for source in countryMovements[year]:
        for target in countryMovements[year][source]:
            if source in sortedCount and target in sortedCount:
                myData = countryMovements[year][source][target]
                auxData = [str(myData[field]) for field in fields]
                fileOut.write("\t".join([str(year),source,target]+auxData)+"\n")

fileOut.close()
