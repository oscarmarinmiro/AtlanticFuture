library(corrgram)
library(ggplot2)

#[-] datos del 1990 y 2013 para la zona Atlántica de:
#- porcentaje de gente migrante (source) de low HDI, medium, high y very high
#- porcentaje de gente inmigrante (target) de low HDI, medium, high, very high
#
#

year = "2013"
lowHDI = 0.466
mediumHDI = 0.64
highHDI = 0.708
veryHighHDI = 0.905


movementData <- read.delim("atlantic_top_movements.tsv")

movementData <- movementData[movementData$year==year,]

total = sum(movementData$value)

print(paste("Sum of people migrated in Atlantic Zone",year))
print(total)
print("Split of sourceHDI")
print("================")

lowSource = (sum(movementData[movementData$sourceHDI < mediumHDI,]$value)/total)*100
mediumSource = (sum(movementData[movementData$sourceHDI > mediumHDI & movementData$sourceHDI < highHDI,]$value)/total)*100
highSource = (sum(movementData[movementData$sourceHDI > highHDI & movementData$sourceHDI < veryHighHDI,]$value)/total)*100
veryHighSource = (sum(movementData[movementData$sourceHDI > veryHighHDI,]$value)/total)*100
totalSource = lowSource + mediumSource + highSource + veryHighSource

print("lowSource")
print(lowSource)
print("mediumSource")
print(mediumSource)
print("highSource")
print(highSource)
print("veryHighSource")
print(veryHighSource)



print("Split of targetHDI")
print("================")


lowTarget = (sum(movementData[movementData$targetHDI < mediumHDI,]$value)/total)*100
mediumTarget = (sum(movementData[movementData$targetHDI > mediumHDI & movementData$targetHDI < highHDI,]$value)/total)*100
highTarget = (sum(movementData[movementData$targetHDI > highHDI & movementData$targetHDI < veryHighHDI,]$value)/total)*100
veryHighTarget = (sum(movementData[movementData$targetHDI > veryHighHDI,]$value)/total)*100

totalTarget = lowTarget + mediumTarget + highTarget + veryHighTarget


print("lowTarget")
print(lowTarget)
print("mediumTarget")
print(mediumTarget)
print("highTarget")
print(highTarget)
print("veryHighTarget")
print(veryHighTarget)



