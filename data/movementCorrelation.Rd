library(corrgram)
library(ggplot2)

movementData <- read.delim("atlantic_top_movements.tsv")

movementData <- movementData[movementData$year=="2013",]

movementData <- movementData[with(movementData,order(-value)),]

movementData <- head(movementData,100)

summary(movementData$sourceHDI)
summary(movementData$targetHDI)

summary(movementData$distance)

summary(movementData$sourcePopulation)
summary(movementData$targetPopulation)


#movementData <- movementData[c("value","sourceHDI","targetHDI")]


#cor.test(~valueSource+sameLanguage, data = movementData)

#cor.test(movementData$valueSource,movementData$targetHDI)

#movementData <- movementData[c("value","sourceHDI","targetHDI","valueSource","valueTarget","distance","sameCurrency","sameLanguage","sourcePopulation","targetPopulation")]
#corrgram(movementData, order = TRUE, lower.panel=panel.shade,upper.panel=panel.conf, diag.panel=panel.density)


plotData = movementData[movementData$sourceTarget!="MX-US",]

pdf(file="output.pdf", width=10, height=10)

ggplot(plotData,aes(x=sourceHDI, y=targetHDI, colour=distance,size=value)) + geom_point() + geom_text(aes(label=sourceTarget,y=targetHDI+0.01),size=1,hjust=0)

#ggplot(plotData,aes(x=HDI, y=inPercent)) + geom_point() + stat_smooth(method=lm,level=0.75) + geom_text(aes(label=name),size=2) + scale_size_area(max_size=15)

dev.off()