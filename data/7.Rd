library(corrgram)
library(ggplot2)

countryData <- read.delim("atlantic_top_countries.tsv")

#countryData = countryData[countryData$currencyName=="Euro",]

countryData <- head(countryData,20)


plotData = countryData

plot <- ggplot(plotData,aes(x=HDI, y=inPercent,size=totalMig)) + geom_point() + geom_text(aes(label=name),color="red",size=2)

plot + ggtitle(paste("20 main migration actors"))
#ggplot(plotData)

ggsave(file="7.top20Quadrant.pdf")
