from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
import time

# Set up Selenium WebDriver (Chrome example)
driver = webdriver.Chrome()  # Adjust path

# Open the URL
url = "https://laam.pk/nodes/men-21"
driver.get(url)

# Wait for the page to load
time.sleep(25)  # Adjust this based on how long the page takes to load

# Get the page source after it has fully loaded
page_source = driver.page_source

# Parse the content with BeautifulSoup
soup = BeautifulSoup(page_source, 'html.parser')

# Find the product list container
product_list = soup.find('div', class_='product_list_container')

if product_list:
    
    products = product_list.find_all('a')

    # Loop through each product
    for product in products:
        product_card = product.find('div', class_='product_card')

        if product_card:
            image_box = product_card.find('div', class_='image-box')
            if image_box:
                image_tag = image_box.find('img')
                image_url = image_tag['src'] if image_tag else 'No image found'
                print(f"Image URL: {image_url}")
            grow = product_card.find('div', class_='grow')
            if grow:
                display_price = grow.find('div', class_ = 'display-price')
                price = display_price
                print(f"price: {price}")
else:
    print("Product list not found.")

# Close the driver
driver.quit()
