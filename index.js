const puppeteer = require('puppeteer');
const reddit = require('./reddit');
(async () => {
    await reddit.initialize();

    const posts = await reddit.getPosts('EarthPorn', 100);
    await reddit.storeJson(posts);

    for (const post of posts) {
        await reddit.download(post.imgUrl, './images/' + post.postTitle.substring(0, 5).trim() + '.png', () => {
            console.log('✅ Image Downloaded!');
        });
    }

    await reddit.end();
})();
