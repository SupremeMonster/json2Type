# json2Type-file
convert a valid json to typescript interface


#### 使用方法
```
const json2Type = new JSON2Type("./demo.json", "./demo.ts", {
  export: true,
})
```
demo.json和demo.ts是测试文件

#### 主要参数options
- export:boolean  // 是否需要导出  默认false
- wrapName:string // 最外层的接口名 默认 Result

#### 主要逻辑
- 先判断json的合法性 结合try catch
- 递归遍历json 包括生成驼峰接口名，
- interface接近于一个对象，因此先把interface当成对象生成
- 对象的格式处理，格式化，逗号，冒号等符号的处理

#### 如下假设
- 空数组或者空对象数组一律any[] 
- 数组只以第一个类型为基准，暂不考虑做个简单的对比

