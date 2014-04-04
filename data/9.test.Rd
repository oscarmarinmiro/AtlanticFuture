library(corrgram)
library(ggplot2)

countryData <- read.delim("atlantic_countries.tsv")

#countryData = countryData[countryData$currencyName!="Euro",]

#countryData <- head(countryData,20)


plotData = countryData

ggplot(plotData,aes(x=HDI, y=abs(lat))) + geom_point() + stat_smooth(method=lm) + geom_text(aes(label=name),color="red",size=2)

ggsave(file="9.HDI_Lat_graph_abs.pdf")

print(cor.test(plotData$HDI,abs(plotData$lat)))

total = sum(countryData$pop2005)

print(total)