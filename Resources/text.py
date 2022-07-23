import pdfkit 

pdf = pdfkit.from_file("./Resources/quote.html", 'res.pdf')

print(pdf)