import sys
import json




countries = list()
results = dict()

with open(sys.argv[1],'r') as source_file:
    lines = source_file.readlines()
    for line in lines[1:]:
        print line
        line = line.strip()
        line_parts = line.split("\t")
        year = line_parts[0]
        source = line_parts[1]
        target = line_parts[2]
        value = line_parts[3]

        if not year in results:
            results[year] = dict()

        if not source in countries:
            aux_country = source
            countries.append(aux_country)


        if not target in countries:
            aux_country = target
            countries.append(aux_country)

        if not source in results[year]:
            results[year][source] = dict()

        if not target in results[year][source]:
            results[year][source][target] = value


salida = {'data':dict(),'datalabel':{'countries':countries}}

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
