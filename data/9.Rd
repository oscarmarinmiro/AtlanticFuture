library(corrgram)
library(ggplot2)

countryData <- read.delim("atlantic_top_countries.tsv")

countryData = countryData[countryData$currencyName=="Euro",]

countryData <- countryData[c("lat","HDI")]

countryData <- head(countryData,10)

cor.test(countryData$lat,countryData$HDI)

corrgram(countryData, order = TRUE, lower.panel=panel.shade,upper.panel=panel.conf, diag.panel=panel.density)


