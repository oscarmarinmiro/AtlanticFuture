library(corrgram)
library(ggplot2)

countryData <- read.delim("atlantic_top_countries.tsv")

allTotal = 99434262

for (i in 1:62)
{
	countryDataRed <- head(countryData,i)

	total = sum(countryDataRed$totalMig)


	cat ("Top ",i," is the ", (total/allTotal)*100," % of all movements","\n")

}


pdf(file="2.pdf", width=10, height=10)

ggplot(countryData,aes(y=reorder(name, totalMig), x=totalMig))+ geom_point() + ggtitle("Distribution of total migrations among countries as of 2013")

#ggplot(countryData,aes(x=name, y=totalMig))+ geom_point()


dev.off()
