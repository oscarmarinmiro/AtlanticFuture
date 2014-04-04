library(corrgram)
library(ggplot2)

year = "2013"

movementData <- read.delim("atlantic_top_movements.tsv")

movementData <- movementData[movementData$year==year,]

movementData <- movementData[with(movementData,order(-value)),]

#movementData <- head(movementData,20)

plotData = movementData[movementData$sourceTarget!="MX-US" & movementData$target=="US",]
plotData = head(plotData,20)

#plotData = movementData

plot<-ggplot(plotData,aes(x=sourceHDI, y=distance,size=value)) + geom_point() + geom_text(aes(label=sourceTarget),size=2,color="red")

plot + ggtitle(paste("20 topmost migration to the US in",year))
#ggplot(plotData)

ggsave(file="6.US.target.2013.pdf")

