import random
from this import s
from fpdf import FPDF
import datetime
from pathlib import Path


def get_descr(package:dict)->str:
    s = f"{package['name']} - QTY: {package['qty']} \n"

    for item in package['item_list']:
        if 'name' in item:
            s += item['name']+'\n'

    return s

def get_price(package:dict)->str:
    s = f"\n"

    for item in package['item_list']:
        if 'name' in item:
            s += 'R '+str(item['price'])+'\n'
    return s

def get_index(i:int, package):
    s = f"#{i}\n"
    for item in package['item_list']:
        if 'name' in item:
            s +='\n'
    return s

def get_indices(cart_list:list)->str:
    count = 0
    s = ''
    for cart_item in cart_list:
        s+=get_index(count, cart_item['package'])
        count+=1
    return s

def get_descriptions(cart_list:list)->str:
    s = ""

    for cart_item in cart_list:
        cart_item['package']['qty'] = cart_item['qty']
        s+=get_descr(cart_item['package'])
    return s

def get_prices(cart_list:list)->str:
    s = ""
    for cart_item in cart_list:
        s+= get_price(cart_item['package'])
    return s



def generate_pdf(filename, cart_list:list, user_data:dict=None)->Path:
    pdf = FPDF('P', 'mm', 'A4')
    pdf.set_font('helvetica', 'B', 18)
    pdf.set_text_color(0,0,0)
    pdf.add_page()
    pdf.set_auto_page_break(True, 10)
    # pdf.image('rb_bg.png', 0, 0, 210, 297)
    pdf.rect(5,5, 195, 285)


    pdf.set_xy(10, 5)
    pdf.cell(216, 10, 'Quote', 0, 0, 'L', False)
    # create the heading
    pdf.set_font('helvetica', 'B', 12)

    dt = datetime.datetime.now()
    day = dt.strftime("%A")
    date = dt.strftime("%D")
    st = f"{day} {date}"

    y= pdf.get_y()
    pdf.set_xy(10, y+10)
    pdf.set_fill_color(255, 251, 228)
    pdf.cell(90, 10, '#REF:'+''.join(date.split('/'))+f"{random.randint(100, 999)}", 0, 0, 'L', True)

    pdf.set_xy(105, y+10)
    
    pdf.cell(90, 10,st , 0, 0, 'R', True)

    y = pdf.get_y()
    s = f"Novapower\nSandton, Bryanston, 2191\n011 463 0073 - www.novapower.co.za"
    pdf.set_xy(10, y+15)
    pdf.multi_cell(90, 10,s, 0, 'J', True)

    s2 = f"To\n \n \n"
    pdf.set_xy(105, y+15)
    pdf.multi_cell(10, 10, s2, 0, 'J', False)

    s2 = f"{user_data['name']}\n{user_data['address']}\n{user_data['cell'].strip()} - {user_data['email']}"
    pdf.set_xy(115, y+15)
    c = pdf.multi_cell(80, 10,s2, 0, 'J', True)

    # table header for the quote
    pdf.set_fill_color(243, 229, 136)
    y = pdf.get_y()
    pdf.set_xy(10, y+15)
    pdf.cell(20, 10, 'Item#', 1, 0, '', True)

    pdf.set_xy(30,y+15)
    pdf.cell(130, 10, 'Description', 1, 0, '', True)

    pdf.set_xy(160, y+15)
    pdf.cell(35, 10, 'Price', 1, 0, '', True)

    
    indices = get_indices(cart_list)
    descriptions = get_descriptions(cart_list)
    prices = get_prices(cart_list)

    y = pdf.get_y()
    pdf.set_xy(10, y+10) # indices
    pdf.multi_cell(20, 10, indices, 1,'J')

    pdf.set_xy(30, y+10) # descriptions
    pdf.multi_cell(130, 10, descriptions,1,'J')

    pdf.set_xy(160, y+10)
    pdf.multi_cell(35, 10, prices, 1, 'J', False)

    # ad the last row  For totals
    y = pdf.get_y()

    pdf.set_xy(120, y+1)
    pdf.multi_cell(40, 10, 'Subtotal:\nTax:\nDiscount:\nTotal:\n', 1,'J', True)

    pdf.set_xy(160, y+1)

    tot = user_data['sub-tot']
    sub_tot = round(tot- 0.15*tot, 2)
    discount  = 0
    tax = round(0.15*tot, 2)
    pdf.multi_cell(35, 10, f"R {sub_tot}\nR {tax}\nR {discount}\nR {tot}\n", 1, False)

    p = Path('./Quotes/'+filename)
    
    pdf.output(p.absolute().as_posix()).encode('latin-1')

    return p









if __name__ == '__main__':
    generate_pdf('Structure.pdf', {})