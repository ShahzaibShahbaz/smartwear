from selenium import webdriver
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import time
import os
import json

#Selenium WebDriver 
driver = webdriver.Chrome() 

# Open the URL
url = "https://laam.pk/nodes/men-21"  # Replace with the actual URL
driver.get(url)

# Wait for the page to load
time.sleep(15)  

# Get the page source after it has fully loaded
page_source = driver.page_source

# Parse the content with BeautifulSoup
soup = BeautifulSoup(page_source, 'html.parser')

# Find the product list container
product_list = soup.find('div', class_='product_list_container')
data = []
if product_list:
    products = product_list.find_all('a')  # Find all links in the product list

    # Loop through each product link
    for i, product in enumerate(products[:5]):
        product_link = product.get('href')  # Extract the href attribute
        if product_link:
            
            if not product_link.startswith("http"):
                product_link = f"https://laam.pk{product_link}"

            # Open the product page
            driver.get(product_link)
            time.sleep(10)  # Wait for the page to load

            # Get the page source of the product page
            product_page_source = driver.page_source

            # Parse the product page
            product_soup = BeautifulSoup(product_page_source, 'html.parser')

            # get images
            div_img = product_soup.find('div', class_ ="temp__product-detail-container")
            product_image_div = div_img.find('div', class_="gap-7xl flex flex-col lg:col-span-6")
            
            product_image_url = [img['src'] for img in product_image_div.find_all('img')]



            # Extract details from the product page
            div_text = product_soup.find('div', class_="lg:col-span-6 gap-xl lg:gap-3xl flex flex-col")
            #title
            product_title = div_text.find('h1', class_="text-md font-semibold text-gray-800 capitalize").text
            

            # price
            price_card = div_text.find('div', class_ = "pdp__price")
            if price_card:
              
                product_price_currency = price_card.find('span', class_="price-currency")
                product_price_amount = price_card.find('span', class_="price-amount")                
            else:
                print("Price card not found.")

            product_price = product_price_currency.text + product_price_amount.text if product_price_currency and product_price_amount else "NA"

            # Clean the price: Remove non-numeric characters (e.g., currency symbols and commas)
            if product_price != "NA":
                product_price = product_price.replace('PKR', '').replace(',', '').strip()  # Remove currency symbol and commas
                try:
                    product_price = float(product_price)  # Convert to float for calculations
                except ValueError:
                    product_price = "NA"
            

            #size
            sizes = []
            size_div = div_text.find('form', class_="pdp__form")
            
            size_div1 = size_div.find('div', class_="space-y-sm pdp--form-item gap-3xl lg:gap-md px-3xl lg:p-0 flex flex-col")
          
            size_card = size_div1.find('div', id = "radix-siNM9WAguS:11-form-item")
            
            btns = size_card.find_all('button', class_='flex p-xl gap-md text-sm text-gray-500 font-semibold rounded-small data-[state=checked]:bg-gray-50 data-[state=checked]:text-gray-800 pdp__form-options-button')
            
            for btn in btns:
                value = btn.get('value')
                sizes.append(value)
                
            #description
            des_dic = div_text.find('div', class_="pdp__description gap-xl flex flex-col relative px-3xl lg:p-none")
            des_div1 = des_dic.find('div', class_="pb-3xl pt-none p-xl lg:p-3xl pt-none gap-xl flex flex-col")
            p_tags = des_div1.find_all("p")

            product_data = {}

            # Initialize variables with default values to ensure they are always defined
            description = "NA"
            gender = "NA"
            subcategory = "NA"
            color = "NA"
            product_type = "NA"

            # Iterate over all the p_tags
            for p_tag in p_tags:
                # Get the text and clean it
                text = p_tag.get_text(separator=' ', strip=True)
                
                # Check if the text contains certain keywords and extract accordingly
                if "Additional Description:" in text:
                    # Extract the description part (after the label)
                    description = text.replace('Additional Description:', '').strip()
                    product_data['description'] = description
                
                if "Gender:" in text:
                    # Extract gender part
                    gender = text.replace('Gender:', '').strip()
                    product_data['gender'] = gender
                
                if "Sub-Category:" in text:
                    # Extract subcategory part
                    subcategory = text.replace('Sub-Category:', '').strip()
                    product_data['subcategory'] = subcategory
                
                if "Color Type:" in text:
                    # Extract color part
                    color = text.replace('Color Type:', '').strip()
                    product_data['color'] = color
                
                if "Product Type:" in text:
                    # Extract product type part
                    product_type = text.replace('Product Type:', '').strip()
                    product_data['product_type'] = product_type
            
            data.append(
                {
                    "name": product_title if product_title else "NA",
                    "price": product_price if product_price else "NA",
                    "image_url": product_image_url[0] if product_image_url else "NA",
                    "size": sizes if sizes else "NA",
                    "description": description,  # Use initialized variables
                    "gender": gender,
                    "subcategory": subcategory,
                    "color": color,
                    "product_type": product_type,
                }
            )
            print("data:", data)
            
            print("-" * 50)

else:
    print("Product list not found.")


# Close the driver
driver.quit()
directory = os.path.join(os.getcwd(), 'output')  # or specify any folder path you want
if not os.path.exists(directory):
    os.makedirs(directory)  # Create the folder if it doesn't exist

json_file_path = os.path.join(directory, 'products.json')

# Save data to the specified path
with open(json_file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print(f"Scraping completed. Data saved to '{json_file_path}'.")