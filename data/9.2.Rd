library(corrgram)
library(ggplot2)

countryData <- read.delim("atlantic_top_countries.tsv")

#countryData = countryData[countryData$currencyName=="Euro",]

countryData <- head(countryData,20)


plotData = countryData

ggplot(plotData,aes(x=HDI, y=inPercent)) + geom_point() + stat_smooth(method=lm) + geom_text(aes(label=name),size=2)

ggsave(file="9.HDI_inPercent_correlation.pdf")