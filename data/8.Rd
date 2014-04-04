library(corrgram)
library(ggplot2)

movementData <- read.delim("atlantic_top_movements.tsv")

movementData <- movementData[movementData$year=="2013",]

movementData <- movementData[with(movementData,order(-value)),]

movementData <- head(movementData,100)

plotData = movementData[movementData$sourceTarget!="MX-US" & movementData$sameLanguage,]

#plotData = movementData

plot <- ggplot(plotData,aes(x=targetHDI-sourceHDI, y=distance,size=value)) + geom_point() + geom_text(aes(label=sourceTarget),color="red",size=2)

plot + ggtitle(paste("HDI Difference and distance in migrations, same language"))
#ggplot(plotData)

ggsave(file="8.HDIDifference.sameLanguage.pdf")

