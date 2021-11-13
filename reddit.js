const puppeteer = require('puppeteer');
const BASE_URL = 'https://www.reddit.com/r/EarthPorn';

const fs = require('fs');
const request = require('request');

let browser = null;
let page = null;

const reddit = {


initialize: async () => {
        browser = await puppeteer.launch({
            headless: true
        });
        page = await browser.newPage();
        await page.goto(BASE_URL);
    },

    getPosts: async (subreddit, count = 10) => {
        let url = await page.url() + 'r/' + subreddit;

        await page.waitFor('div.ListingLayout-outerContainer');
        await page.waitFor(2000);

        let postsArray = await page.$$('div.Post.scrollerItem');

        let lastPostsArrayLength = 0;
        let posts = [];

        // count is the amount of posts that we need
        while (postsArray.length < count) {
            await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
            await page.waitFor(3000);

            postsArray = await page.$$('div.Post.scrollerItem');

            if (lastPostsArrayLength >= postsArray.length) {
                break;
            }

            lastPostsArrayLength = postsArray.length;
            console.log('Total posts ->' + lastPostsArrayLength);
        }

        for (let postElement of postsArray) {
            try {
                let postTitle = await postElement.$eval('div[data-click-id="background"] h3', element => element.innerText);
                let imgUrl = '';
                try {
                    imgUrl = await postElement.$eval('img.ImageBox-image.media-element', element => element.src);
                    posts.push({ postTitle, imgUrl });
                } catch(error) {
                    console.log(error)
                }

            } catch (error) {
                console.log(error);
            }
        }

        posts = posts.slice(0, count);
        console.log('✅ getPosts Completed!');
        return posts;
    },
    download: async (url, path, callback) => {
        console.log(url, 'URL');
        console.log(path, 'PATH');
        request.head(url, (err, res, body) => {
            request(url)
                .pipe(fs.createWriteStream(path))
                .on('close', callback)
        })
    },
    storeJson: async (array) => {
        fs.writeFile('./data/posts.json', JSON.stringify(array), function (err) {
                if (err) throw err;
                console.log('✅ storeJson Completed!');
            }
        );
    },
    end: async () => {
        await browser.close();
    }
};

module.exports = reddit;
