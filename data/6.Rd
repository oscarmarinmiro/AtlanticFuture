library(corrgram)
library(ggplot2)

year = "2013"

movementData <- read.delim("atlantic_top_movements.tsv")

movementData <- movementData[movementData$year==year,]

movementData <- movementData[with(movementData,order(-value)),]

movementData <- head(movementData,20)

#plotData = movementData[movementData$sourceTarget=="MX-US",]

plot<-ggplot(plotData,aes(x=sourceHDI, y=targetHDI, colour=distance,size=value)) + geom_point() + geom_text(aes(label=sourceTarget,y=targetHDI+0.005),size=2)

plot + ggtitle(paste("20 topmost migration flows in",year))


