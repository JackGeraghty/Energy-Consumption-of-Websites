import requests
import pprint
import json
from bs4 import BeautifulSoup

source_url = 'https://www.alexa.com/topsites/countries/IE'

urls = []
amount_to_strip_head = len('<a href="/siteinfo/')
# amount_to_strip_tail = len('')

cookies = {
    '_ga': 'GA1.2.1537028672.1606329189',
    'attr_first': '^%^7B^%^22source^%^22^%^3A^%^22(direct)^%^22^%^2C^%^22medium^%^22^%^3A^%^22(none)^%^22^%^2C^%^22campaign^%^22^%^3A^%^22(not^%^20set)^%^22^%^2C^%^22term^%^22^%^3A^%^22(not^%^20provided)^%^22^%^2C^%^22content^%^22^%^3A^%^22(not^%^20set)^%^22^%^2C^%^22lp^%^22^%^3A^%^22www.alexa.com^%^2Ftopsites^%^2Fcountries^%^2FIE^%^22^%^2C^%^22date^%^22^%^3A^%^222020-11-25^%^22^%^2C^%^22timestamp^%^22^%^3A1606329189520^%^7D',
    '__auc': 'c3799ea617600ae451379c19f02',
    '_gid': 'GA1.2.860637909.1611853233',
    'attr_last': '^%^7B^%^22source^%^22^%^3A^%^22google^%^22^%^2C^%^22medium^%^22^%^3A^%^22organic^%^22^%^2C^%^22campaign^%^22^%^3A^%^22(not^%^20set)^%^22^%^2C^%^22term^%^22^%^3A^%^22(not^%^20provided)^%^22^%^2C^%^22content^%^22^%^3A^%^22(not^%^20set)^%^22^%^2C^%^22lp^%^22^%^3A^%^22www.alexa.com^%^2Ftopsites^%^2Fcountries^%^2FGB^%^22^%^2C^%^22date^%^22^%^3A^%^222021-01-28^%^22^%^2C^%^22timestamp^%^22^%^3A1611853233481^%^7D',
    '__asc': '4067c97217749f07e4460f13307',
    'captcha': '',
    'session_www_alexa_com': '1fc03343-5749-4733-992b-7cf3e19a7cc3',
    'session_www_alexa_com_daily': '1611854710',
    '_alx_ss': '^%^7B^%^22status^%^22^%^3A0^%^7D',
    'AgencyBarSeen': 'true',
    'AgencyBarNotYetExpired': 'true',
    'lv': '1611854851',
    'session_key': 'ArY9o2tMP8s^%^2FbiHqxndcE524rIPuhDXvCtrZTiso39coTwLjAHJ0^%^2FwJJO6UNm7vuYOopKVfwqoEndyPtmsR^%^2FLiJx6aJ9pkZ^%^2BZs4rHatMkexjzA^%^2F93tI7KRUfAGVG2W4thjPjJ^%^2Fzw5jguPQ0z6ED0ZNAsQT2dz5QJKSuGE^%^2B2FCuvEsLx^%^2FEBIH6FfcAbFXUk5KE1F930EF5O0wMyYqDg5CRNydKN632c9jYjw^%^2FQtiCzlK0N5hRWjDQvdmoxsKyIUPh',
    'alexa_user_lifecycles': '^%^7B^%^224CYYE0Mtpy_7dfnCNXwnKt0fORdrJA3AM_zTpcdwqxg^%^22^%^3A^%^22prospect^%^22^%^7D',
    'jwtScribr': 'eJyrViopVrIyNDM0tDC1NDO30DM1N9RRys0BihkY6CgVZ6YApZXMLQ3MDAz1ElPKEvOSU1OUQBIlqSAZoCo9IDcZxleqBQBqfRXb.cT3xEHGQEEvmbkLVm98zANwffXKmneMsGLkOe_j4gp8',
    'mp_23564df485f0237ed31a0187a9aa3aad_mixpanel': '^%^7B^%^22distinct_id^%^22^%^3A^%^20^%^225kZ_REhSST04jtDgBTA6InFmtBXpyILmPSl7pfP-hLY^%^22^%^2C^%^22^%^24device_id^%^22^%^3A^%^20^%^2217600ae444a1a8-00f6341b604f26-c791e37-384000-17600ae444b7c9^%^22^%^2C^%^22logged_in^%^22^%^3A^%^20true^%^2C^%^22^%^24initial_referrer^%^22^%^3A^%^20^%^22^%^24direct^%^22^%^2C^%^22^%^24initial_referring_domain^%^22^%^3A^%^20^%^22^%^24direct^%^22^%^2C^%^22^%^24search_engine^%^22^%^3A^%^20^%^22google^%^22^%^2C^%^22^%^24user_id^%^22^%^3A^%^20^%^225kZ_REhSST04jtDgBTA6InFmtBXpyILmPSl7pfP-hLY^%^22^%^2C^%^22lifecycle_stage^%^22^%^3A^%^20^%^22prospect^%^22^%^2C^%^22highest_subscription^%^22^%^3A^%^20^%^22Advanced^%^22^%^2C^%^22agency^%^22^%^3A^%^20false^%^7D',
}

headers = {
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0',
    'sec-ch-ua': '^\\^Chromium^\\^;v=^\\^88^\\^, ^\\^Google',
    'sec-ch-ua-mobile': '?0',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'If-None-Match': 'W/^\\^1c2e9-jA0VwpbMb9YRIWkoXbHZ6pg/YYs^\\^',
}

template_source = 'https://www.alexa.com/topsites/countries;{}/IE'
template_filename = 'urls_{}.json'

for i in range(20):
    page = requests.get(template_source.format(i), headers=headers, cookies=cookies)
    soup = BeautifulSoup(page.content, features="html.parser")
    print(template_source.format(i))
    for div_tag in soup.find_all('div', class_='tr site-listing'):
        for p_tag in div_tag.find_all('p', class_=''):
            for a_tag in p_tag.find_all('a', href=True):
                # stripped_url = a_tag[amount_to_strip_head:]
                stripped_url = str(a_tag)[amount_to_strip_head:].split('"', 1)[0]
                if stripped_url not in urls:
                    # print(stripped_url)
                    urls.append(stripped_url)
    # print("\n\n")

verification_set = set(urls)
print("Size of verification Set = " + str(len(verification_set)))
print("Number of URLS = " + str(len(urls)))
with open("urls.json", "w") as f:
    json.dump(urls, f, indent=4)
f.close()
# pp.pprint(page.content)
