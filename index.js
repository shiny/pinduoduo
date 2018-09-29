const urllib = require('urllib');
const md5 = function(data, encoding = 'hex') {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(data).digest(encoding);
};

const querystring = require('querystring');

const sign = function(args = {}, client_secret = '') {
    const defaultArgs = {
        client_id: '',
    }
    args = Object.assign(defaultArgs, args);
    const items = Object.entries(args).map(item => item[0]+item[1]);
    const hash = md5(client_secret + items.sort().join('') + client_secret);
    return hash.toUpperCase();
}

const time = function() {
    return Math.ceil((new Date()).getTime() / 1000);
}

const defaultOptions = {
    url: 'https://gw-api.pinduoduo.com/api/router',
    getNestedResponse: true,
    getBuiltUrl: false
};

module.exports = function(commonArgs, client_secret, options = {}) {
    const hasOptions = Object.keys(options).length > 0;
    if (typeof client_secret === 'string') {
        options.client_secret = client_secret;
    } else if(typeof client_secret === 'object' &&  !hasOptions) {
        options = client_secret;
    }
    options = Object.assign(defaultOptions, options);
    const stack = [];
    const clearStack = () => {
        stack.splice(0, stack.length);
    }
    return new Proxy((...argumentsList) => {
        let args = {};
        if(argumentsList[0]) {
            args = Object.assign({}, argumentsList[0]);
        }
        const type = 'pdd.'+stack.join('.');
        const form = Object.assign(args, commonArgs, {
            type,
            timestamp: time()
        });
        form.sign = sign(form, options.client_secret);
        const url = options.url + '?' + querystring.stringify(form);
        if(options.getBuiltUrl) {
          return url;
        }
        return new Promise((resolve, reject) => {
            urllib.request(url, {
                dataType: 'json',
                gzip: true,
                method: 'POST'
            })
            .then(result => {
                if(result.data.error_response) {
                    const { error_code = -1, error_msg = '' } = result.data.error_response;
                    const err = new Error(error_msg);
                    err.name = error_code;
                    return reject(err);
                }
                if(options.getNestedResponse) {
                    const keys = Object.keys(result.data);
                    let response;
                    if(keys.length === 1) {
                        const theOnlyKey = keys[0];
                        response = result.data[theOnlyKey];
                        return resolve(response);
                    } else if (keys.length > 1) {
                        for(let key of keys) {
                            if(key.endsWith('_response')) {
                                response = result.data[key];
                                return resolve(response);
                            }
                        }
                    }
                    const err = new Error('Can\'t get nested response.');
                    err.name = -1;
                    throw new Error(err);
                } else {
                    return resolve(result.data);
                }
            }).catch(err => {
                reject(err);
            });
        });
    }, {
        get(target, key, receiver) {
            if (typeof key === 'string') {
                stack.push(key);
            }
            return receiver;
        },
        apply: function(target, thisArg, argumentsList) {
            const result = target(...argumentsList);
            clearStack();
            return result;
        }
    });
};
