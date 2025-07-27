import browsercookie
import requests

cj = browsercookie.chrome()

response = requests.get("https://supercell.com/en/games/brawlstars/", cookies=cj)

print(response.status_code)
print(response.text)
