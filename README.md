# Running the Individual Components

The first thing to install is NodeJS (https://nodejs.org/en/download/), installation instructions can also be found on that page. With NodeJS installed, next is the Node Package Manager(npm). This is required for install all the required packages and TypeScript. 



ECOW uses the Node Package Manager(npm) system for handling packages. To install the required packages for each component, the ``npm install`` command needs to be run. This should install all the necessary packages.



ECOW is written in TypeScript. TypeScript can be installed using npm as follows: ``npm install typescript``



Each of the components must first be compiled using TypeScript. Inside the root folder of each component(e.g. ecow/Energy-Consumption-of-Websites/puppeteer/) execute the following command, ``tsc`` .  This will compile the TypeScript code to JavaScript, which can then be run using Node.



Each component uses the same structure for a build directory, ``build/src/<component_name>/``. From the root folder of each component, it can be executed by the following command: ``node build/src/<component_name>/main.js <args>``. The arguments for each of the components are described in the next section.



## Puppeteer

``--urls``: A comma-separated string of the URLs to test, no``http(s)://`` or ``www.`` is required.

​	<u>Example</u> : ``node build/src/puppeteer/main.js --urls="ucdsu.ie,tcdsu.org"``

``--pathToUrlsFile``: A path to a JSON file containing the URLs to test. Look at ``resources/urls_500.json`` as an example.

​	<u>Example</u> :``node build/src/puppeteer/main.js --pathToUrlsFile="path/to/some/JSON/file.json"``

**One of the above to is required, both cannot be passed at the same time**

``--doMobile`` : A flag that can be set so as to emulate mobile browsing.

​	<u>Example</u> :``node build/src/puppeteer/main.js --pathToUrlsFile="path/to/some/JSON/file.json" --doMobile`` 

``--browserPath`` : Path to the browser to be used to load the URLs, **required**

​	<u>Example</u> : ``node build/src/puppeteer/main.js --pathToUrlsFile="path/to/some/JSON/file.json" --browserPath="path/to/chrome.exe"``

``--num_iterations`` : The number of iterations to perform per URL, default is 5. 

​	<u>Example</u> : ``node build/src/puppeteer/main.js --pathToUrlsFile="path/to/some/JSON/file.json" --browserPath="path/to/chrome.exe" --num_iterations=10``



## PageSpeed

``--urls``: A comma-separated string of the URLs to test, no``http(s)://`` or ``www.`` is required.

​	<u>Example</u> : ``node build/src/pagespeed/main.js --urls="ucdsu.ie,tcdsu.org"``

``--pathToUrlsFile``: A path to a JSON file containing the URLs to test. Look at ``resources/urls_500.json`` as an example.

​	<u>Example</u> :``node build/src/pagespeed/main.js --pathToUrlsFile="path/to/some/JSON/file.json"``

**One of the above to is required, both cannot be passed at the same time**

``--num_iterations`` : The number of iterations to perform per URL, default is 5. 

​	<u>Example</u> : ``node build/src/pagespeed/main.js --pathToUrlsFile="path/to/some/JSON/file.json"  --num_iterations=10``



## Papillon

Papillon is slightly more complicated since it needs to have Papillon already running.



``--webpageName`` : The name of the webpage being tested.

``--category`` : The category being tested.



**Both of the above are required, they are used to create output directories**

The Papillon code can then be launched by the following command:

``node build/src/papillon/main.js --webpageName="Youtube" --category="Video_Streaming"``



