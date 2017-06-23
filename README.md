# webCrawler
Web crawling using node.js and cheerio with mongodb as data storage

## Steps
1. Run mongoDB (Pre-requisite)
2. Go to webCrawler directory and run $nodemon
3. Go to browser enter http://localhost:3000/crawler (make sure nothing running on port 3000)
4. You have to stop it "ctrl+c" otherwise it will go in infinite loop.

It will crawl https://python.org (to be simple) and data will store in mongoDB's "crawler" database and "nodes" document.
