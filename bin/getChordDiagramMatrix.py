import sys
import json




countries = list()
countries_values = list()
movements = dict()
results = dict()

with open(sys.argv[1],'r') as source_file:
    lines = source_file.readlines()
    for line in lines[1:]:
        #print line
        line = line.strip()
        line_parts = line.split("\t")
        print len(line_parts)
        year = line_parts[0]
        source = line_parts[1]
        target = line_parts[2]
        movement_id = line_parts[3]
        value = line_parts[4]
        valueSource = line_parts[5]
        valueTarget  = line_parts[6]
        distance = line_parts[7]
        sameCurrency = line_parts[8]
        sameLanguage = line_parts[9]
        sourceGeo = line_parts[10]
        targetGeo = line_parts[11]
        sourceHDI = line_parts[12]
        targetHDI = line_parts[13]
        sourcePopulation = line_parts[14]
        targetPopulation = line_parts[15]

        if not year in results:
            results[year] = dict()
            movements[year] = dict()

        if not source in countries:
            aux_country = source
            countries.append(aux_country)
            country_values = {'name':source,'valueCountry':valueSource,'geo':sourceGeo,'HDI':sourceHDI,'Population':sourcePopulation}
            countries_values.append(country_values)


        if not target in countries:
            aux_country = target
            countries.append(aux_country)
            country_values = {'name':target,'valueCountry':valueTarget,'geo':targetGeo,'HDI':targetHDI,'Population':targetPopulation}
            countries_values.append(country_values)

        if not source in results[year]:
            results[year][source] = dict()
            movements[year][source] = dict()

        if not target in results[year][source]:
            print "VALUE : -%s-" % value
            results[year][source][target] = value
            movements[year][source][target] = {'value':value,'sameCurrency':sameCurrency,'sameLanguage':sameLanguage,'distance':distance,'movement_id':movement_id}


salida = {'data':dict(),'datalabel':{'countries':countries,'countries_data':countries_values,'movements_data':movements}}

for year in results.keys():
    matrix = list()
    for country_source in countries:
        country_matrix = list()
        if country_source in results[year]:
            for country_target in countries:
                if country_target in results[year][country_source]:
                    results[year][country_source][country_target]
                    country_matrix.append(int(results[year][country_source][country_target]))
                else:
                    country_matrix.append(0)

        else:
            for i in range(len(countries)):
                country_matrix.append(0)

        matrix.append(country_matrix)

    salida['data'][year] = matrix


json.dump(salida,open(sys.argv[2],'w'),indent=4)
