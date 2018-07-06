module.exports = {
    firefox: {
        base: 'BrowserStack',
        browser: 'firefox',
        os: 'Windows',
        os_version: '10',
        browserstack: {
            debug: false,
            video: false
        }
    },

    chrome: {
        base: 'BrowserStack',
        browser: 'chrome',
        os: 'Windows',
        os_version: '10',
        browserstack: {
            debug: false,
            video: false
        }
    },

    ie11: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11.0',
        os: 'Windows',
        os_version: '7',
        browserstack: {
            debug: false,
            video: false
        }
    },

    edge: {
        base: 'BrowserStack',
        browser: 'edge',
        os: 'Windows',
        os_version: '10',
        browserstack: {
            debug: false,
            video: false
        }
    },

    iphone: {
        base: 'BrowserStack',
        device: 'iPhone 7',
        device_browser: 'safari',
        os: 'iOS',
        os_version: '10.0',
        real_mobile: true,
        browserstack: {
            debug: false,
            video: false
        }
    },

    android: {
        base: 'BrowserStack',
        device: 'Samsung Galaxy S8',
        device_browser: 'chrome',
        os: 'android',
        os_version: '7.0',
        real_mobile: true,
        browserstack: {
            debug: false,
            video: false
        }
    }
};
