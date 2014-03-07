library(corrgram)
library(ggplot2)

countryData <- read.delim("atlantic_top_countries.tsv")

#countryData <- countryData[c("inPercent","HDI")]

countryData <- head(countryData,10)

#countryData = countryData[countryData$currencyName=="Euro",]

cor.test(countryData$HDI,countryData$inPercent)

#corrgram(countryData, order = TRUE, lower.panel=panel.shade,upper.panel=panel.conf, diag.panel=panel.density)

plotData = countryData

#plotData = countryData[,c("HDI","inPercent","currencyName")]

#plotData = countryData[,c("HDI","inPercent")]

#ggplot(plotData,aes(x=HDI, y=inPercent, colour=currencyName)) + geom_point() + stat_smooth(method=lm,se=FALSE)

ggplot(plotData,aes(x=HDI, y=inPercent)) + geom_point() + stat_smooth(method=lm,level=0.75) + geom_text(aes(label=name),size=2)