library(corrgram)
library(ggplot2)

year = "2013"

movementData <- read.delim("atlantic_top_movements.tsv")

movementData <- movementData[movementData$year==year,]

movementData <- movementData[with(movementData,order(-value)),]

cat("==============================","\n")
cat("Typical migrant for year",year,"\n")

cat("Average distance weighted by movement mass",weighted.mean(movementData$distance, movementData$value)," kilometers\n")
cat("Average source HDI weighted by movement mass",weighted.mean(movementData$sourceHDI, movementData$value),"\n")
cat("Average target HDI weighted by movement mass",weighted.mean(movementData$targetHDI, movementData$value),"\n")
cat("Average source Population weighted by movement mass",weighted.mean(movementData$sourcePopulation, movementData$value)," habitants\n")
cat("Average target Population weighted by movement mass",weighted.mean(movementData$targetPopulation, movementData$value)," habitants\n")

cat("==============================","\n")

#summary(movementData$sourceHDI)
#summary(movementData$targetHDI)

#summary(movementData$distance)

#summary(movementData$sourcePopulation)
#summary(movementData$targetPopulation)
