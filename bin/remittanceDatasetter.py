import sys
import json
import xlrd


countries = dict()

with open(sys.argv[1],'r') as source_file:
    lines = source_file.readlines()
    count = 1
    for line in lines:
        line = line.strip()
        if line == 'Venezuela, RB':
            line = 'Venezuela'
        countries[line] = count
        count += 1

countries_atlantic = list()
countries_atlantic_list = list()
countries_atlantic_dict = dict()

with open(sys.argv[2],'r') as source_file:
    lines = source_file.readlines()
    for line in lines[1:]:
        line = line.strip()
        line_parts = line.split('\t')
        countries_atlantic.append({"shortName":line_parts[0],"longName":line_parts[2]})
        countries_atlantic_list.append(line_parts[2])
        countries_atlantic_dict[line_parts[2]] = line_parts[0]



workbook = xlrd.open_workbook(sys.argv[3])
worksheet = workbook.sheet_by_index(0)

year=2012
results = {2012:dict()}
for rownum in range(4,worksheet.nrows):
    source_country = worksheet.cell_value(rownum, 0)
    if source_country == 'Venezuela, RB':
        source_country = 'Venezuela'
    if source_country in countries_atlantic_list:
        if not countries_atlantic_dict[source_country] in results[year]:
            results[year][countries_atlantic_dict[source_country]] = dict()
        for target_country in countries_atlantic:
            if not target_country['shortName'] in results[year][countries_atlantic_dict[source_country]]:
                results[year][countries_atlantic_dict[source_country]][target_country['shortName']] = 0
            remit_value = worksheet.cell_value(rownum,countries[target_country['longName']])
            results[year][countries_atlantic_dict[source_country]][target_country['shortName']] = remit_value

json.dump(results,open(sys.argv[4],'w'),indent=4)
