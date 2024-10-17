# Get a table from a webpage and parse it, getting all the hyperlinks from the first column
import requests
from bs4 import BeautifulSoup
from pdfquery import PDFQuery
import docx

url = 'https://registrar.utexas.edu/catalogs/degree-plans'
response = requests.get(url)


soup = BeautifulSoup(response.text, 'html.parser')
table = soup.find('table')
hyperlinks = table.find_all('a')
# Clean up the hyperlinks
hyperlinks = [link['href'] for link in hyperlinks]
print(hyperlinks)

# # go through the hyperlinks, if its a pdf or docx download file and get the text, if its a webpage, get the text, output everything to a file
for link in hyperlinks:
    if link.endswith('.pdf'):
        try:
            response = requests.get(link)
            with open('temp.pdf', 'wb') as f:
                f.write(response.content)
            pdf = PDFQuery('temp.pdf')
            pdf.load()
            text = pdf.extract_text().encode('utf-8', errors='ignore').decode('utf-8')
            # print(text)
        except:
            pass
    elif link.endswith('.docx'):
        try:
            response = requests.get(link)
            with open('temp.docx', 'wb') as f:
                f.write(response.content)
            doc = docx.Document('temp.docx')
            text = ''
            for para in doc.paragraphs:
                text += para.text + '\n'
            print(text)
        except:
            pass
    else:
        response = requests.get(link)
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text().encode('utf-8', errors='ignore').decode('utf-8')
        # print(text)
    with open('output.txt', 'a', encoding='utf-8') as f:
        f.write(text)               