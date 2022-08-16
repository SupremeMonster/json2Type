// version 1.0.0
// convert json to typescript interface

/**
 * 判断是否是合法json
 */
var fs = require("fs")

class JSON2Type {
  constructor(jsonFileUrl, typeFileUrl, options) {
    this.jsonFileUrl = jsonFileUrl
    this.typeFileUrl = typeFileUrl
    this.json = null
    this.ResultObj = {}
    this.options = { ...{ wrapName: "Result", export: false }, options }
  }

  isJSONObject() {
    this.json = fs.readFileSync(this.jsonFileUrl).toString()
    if (typeof this.json === "string") {
      try {
        const jsonObject = JSON.parse(this.json)
        if (this.getTypeofObj(jsonObject) === "object") {
          return jsonObject
        }
      } catch (e) {
        return false
      }
    }
    return false
  }

  isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]"
  }

  isNull(obj) {
    return Object.prototype.toString.call(obj) === "[object Null]"
  }

  getTypeofObj(obj) {
    return this.isArray(obj) ? "array" : this.isNull(obj) ? "null" : typeof obj
  }

  // 空对象或者空数组
  isNullObjOrEmptyArray(obj) {
    return (
      (this.isArray(obj) && obj.length === 0) ||
      this.isNull(obj) ||
      Object.keys(obj).length === 0
    )
  }

  convert2CamelCaseName(name) {
    const arr = name.split("")
    for (let i = 0; i < arr.length; i++) {
      if (arr[i - 1] === "_" || i === 0) {
        arr[i] = arr[i].toUpperCase()
        i !== 0 ? arr.splice(i - 1, 1) : null
      }
    }
    return arr.join("")
  }

  convert() {
    const jsonObject = this.isJSONObject()
    if (!jsonObject) return
    this.deepConvertJSON(jsonObject)
    const result = JSON.stringify(this.ResultObj, null, 2) // JSON.stringify 第三个参数
      .replace(/"/g, "")
      .replace(/: {/g, " {")
      .replace(/},/g, "}\n")
      .replace(/,/g, "")
    return result.slice(2, result.length - 2)
  }

  // 深度优先遍历
  deepConvertJSON(obj, objName = this.options.wrapName) {
    const tempTypeObj = {}
    for (let key of Object.keys(obj)) {
      let type = this.getTypeofObj(obj[key])
      if (type === "null" || type === "object") {
        if (type === "null" || this.isNullObjOrEmptyArray(obj[key])) {
          tempTypeObj[key] = "any"
          continue
        } else {
          tempTypeObj[key] = this.convert2CamelCaseName(key)
          this.deepConvert(obj[key], tempTypeObj[key])
        }
      } else if (type === "array") {
        if (
          this.isNullObjOrEmptyArray(obj[key]) ||
          this.isNullObjOrEmptyArray(obj[key][0])
        ) {
          tempTypeObj[key] = "any[]"
          continue
        } else {
          const elType = this.getTypeofObj(obj[key][0])
          // 数组除了对象数组，理想情况下不会存在 多种类型在一个数组中
          if (elType === "object") {
            tempTypeObj[key] = this.convert2CamelCaseName(key) + "[]"
            this.deepConvertJSON(obj[key][0], this.convert2CamelCaseName(key))
          } else {
            tempTypeObj[key] = elType + "[]"
          }
        }
      } else {
        tempTypeObj[key] = type
      }
    }
    this.ResultObj[
      `${(this.options.export ? "export " : "") + "interface " + objName}`
    ] = tempTypeObj
  }

  // 写入文件
  writeInFile() {
    fs.writeFile(this.typeFileUrl, this.convert(), (err) => {
      if (err) return
    })
  }
}

const json2Type = new JSON2Type("./demo.json", "./demo.ts", {
  export: true,
})
json2Type.writeInFile()
