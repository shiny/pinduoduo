# Pinduoduo
拼多多开放平台非官方 Promise Node 库
Non-official Promise Node library for pinduoduo.com

## 安装
`npm i pinduoduo --save`

## 快速上手
```javascript
const client_id = '8aa57095eacf449f94fa61e6c761a202'; //这里设置你自己的 client_id
const client_secret = ''; // 这里设置成自己的 client_secret
const Pinduoduo = require('pinduoduo');
const pdd = new Pinduoduo({
    client_id,
}, client_secret);
const goods = await pdd.ddk.goods.recommend.get({
    offset: 0
});
```

## 设计理念
使用 Proxy 对 API 进行了映射，使得以简单的元编程（meta programming）方式支持了全部 API（暂时不覆盖授权部分）。

## Pinduoduo 构造函数
```javascript
class Pinduoduo {
    constructor(commonArgs[, client_secret, options]) { }
}
```


### commonArgs - 公共参数
必填项：client_id
对于不需要授权的 API，本类库会自动生成公众请求参数并签名；
需要授权的 API 需要手动传入 access_token

### client_secret 
请在 open.pinduoduo.com 后台获取
第二个参数也可以是 options，client_secret 作为它的一个键传入。

### options 参数

```javascript
options = {
    url: 'https://gw-api.pinduoduo.com/api/router',
    getNestedResponse: true
}
```

#### 类库的使用选项
- url - 请求网关地址，默认为正式环境 `https://gw-api.pinduoduo.com/api/router`。注意官方提供的 url 是 http 而非 https 的。如果希望以官方形式，或者希望传入沙箱 url 可修改此配置。
- getNestedResponse - 是否自动解析嵌套的 response
#### 返回数据的自动解析 getNestedResponse
目的是使拼多多返回数据更简洁易读，仅仅解析第一级 JSON 数据。更深层次的内容不会解析。

- 当响应的 JSON 格式仅只有一个 key 时，自动返回 key 内的值；
- 当响应的 JSON 格式 key 以 `_response` 结尾时，自动返回此 key 内的值；
- 其他情况会抛出 Error，提示 `Can't get nested response.`

## API 调用
使用 new 生成变量名为 pdd 的实例后，即可以官方文档中的风格调用，请求参数以 Object 对象传入函数的第一个参数。
### 示例：pdd.goods.cats.get（商品标准类目接口）

```javascript
const cats = await pdd.goods.cats.get({
    parent_cat_id: 0
})
```

## 错误处理
当拼多多返回出错信息时，将会抛出 Error 对象。
Error.name - 错误码 
Error.message - 错误描述
```javascript
try {
    const goods = await pdd.ddk.goods.recommend.get({
        offset: 0
    });
    console.log(goods);
} catch (err) {
    console.log('#', err.name, err.message);
}
```
## Contributors
Dai Jie <daijie@php.net>
