library(corrgram)
library(ggplot2)

movementData <- read.delim("atlantic_top_movements.tsv")

movementData <- movementData[movementData$year=="2013",]

movementData <- movementData[with(movementData,order(-value)),]

movementData <- head(movementData,100)




#cor.test(~valueSource+sameLanguage, data = movementData)

cor.test(movementData$targetHDI-movementData$sourceHDI,movementData$value)

#movementData <- movementData[c("value","sourceHDI","targetHDI","valueSource","valueTarget","distance","sameCurrency","sameLanguage","sourcePopulation","targetPopulation")]
#corrgram(movementData, order = TRUE, lower.panel=panel.shade,upper.panel=panel.conf, diag.panel=panel.density)


