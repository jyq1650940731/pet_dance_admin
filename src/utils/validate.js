/**
 * @description 判读是否为外链
 * @param path
 * @returns {boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:|\/\/)/.test(path)
}

/**
 * @description 校验密码是否小于6位
 * @param value
 * @returns {boolean}
 */
export function isPassword(value) {
  return typeof value === 'string' && value.length >= 6
}

/**
 * @description 判断是否为数字
 * @param value
 * @returns {boolean}
 */
export function isNumber(value) {
  const reg = /^[0-9]*$/
  return reg.test(value)
}

/**
 * @description 判断是否是名称
 * @param value
 * @returns {boolean}
 */
export function isName(value) {
  const reg = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/
  return reg.test(value)
}

/**
 * @description 判断是否为IP
 * @param ip
 * @returns {boolean}
 */
export function isIP(ip) {
  const reg =
    /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  return reg.test(ip)
}

/**
 * @description 判断是否是传统网站
 * @param url
 * @returns {boolean}
 */
export function isUrl(url) {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/**
 * @description 判断是否是小写字母
 * @param value
 * @returns {boolean}
 */
export function isLowerCase(value) {
  const reg = /^[a-z]+$/
  return reg.test(value)
}

/**
 * @description 判断是否是大写字母
 * @param value
 * @returns {boolean}
 */
export function isUpperCase(value) {
  const reg = /^[A-Z]+$/
  return reg.test(value)
}

/**
 * @description 判断是否是大写字母开头
 * @param value
 * @returns {boolean}
 */
export function isAlphabets(value) {
  const reg = /^[A-Za-z]+$/
  return reg.test(value)
}

/**
 * @description 判断是否是字符串
 * @param value
 * @returns {boolean}
 */
export function isString(value) {
  return typeof value === 'string' || value instanceof String
}

/**
 * @description 判断是否是数组
 * @param arg
 */
export function isArray(arg) {
  if (typeof Array.isArray === 'undefined') {
    return Object.prototype.toString.call(arg) === '[object Array]'
  }
  return Array.isArray(arg)
}

/**
 * @description 判断是否是端口号
 * @param value
 * @returns {boolean}
 */
export function isPort(value) {
  const reg =
    /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/
  return reg.test(value)
}

/**
 * @description 判断是否是手机号
 * @param value
 * @returns {boolean}
 */
export function isPhone(value) {
  const reg = /^1\d{10}$/
  return reg.test(value)
}

/**
 * @description 判断是否是身份证号(第二代)
 * @param value
 * @returns {boolean}
 */
export function isIdCard(value) {
  const reg =
    /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  return reg.test(value)
}

/**
 * @description 判断是否是邮箱
 * @param value
 * @returns {boolean}
 */
export function isEmail(value) {
  const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
  return reg.test(value)
}

/**
 * @description 判断是否中文
 * @param value
 * @returns {boolean}
 */
export function isChina(value) {
  const reg = /^[\u4E00-\u9FA5]{2,4}$/
  return reg.test(value)
}

/**
 * @description 判断是否为空
 * @param value
 * @returns {boolean}
 */
export function isBlank(value) {
  return (
    value === null ||
    false ||
    value === '' ||
    value.trim() === '' ||
    value.toLocaleLowerCase().trim() === 'null'
  )
}

/**
 * @description 判断是否为固话
 * @param value
 * @returns {boolean}
 */
export function isTel(value) {
  const reg =
    /^(400|800)([0-9\\-]{7,10})|(([0-9]{4}|[0-9]{3})([- ])?)?([0-9]{7,8})(([- 转])*([0-9]{1,4}))?$/
  return reg.test(value)
}

/**
 * @description 判断是否为数字且最多两位小数
 * @param value
 * @returns {boolean}
 */
export function isNum(value) {
  const reg = /^\d+(\.\d{1,2})?$/
  return reg.test(value)
}

/**
 * 深度比较两个值是否相等（支持基本类型、数组、普通对象）
 * @param {any} a - 第一个比较值
 * @param {any} b - 第二个比较值
 * @returns {boolean} 是否深度相等
 */
export const isEqual = (a, b) => {
  // 1. 基本类型/引用类型直接对比（null/undefined/NaN/函数/日期/正则等）
  // 处理 NaN 相等的特殊情况（NaN === NaN 为 false）
  if (a !== a && b !== b) return true;
  // 处理 null/undefined 对比
  if (a === null || b === null) return a === b;
  if (a === undefined || b === undefined) return a === b;

  // 2. 类型不同直接返回 false
  const typeA = Object.prototype.toString.call(a);
  const typeB = Object.prototype.toString.call(b);
  if (typeA !== typeB) return false;

  // 3. 按类型深度对比
  switch (typeA) {
    // 3.1 日期对象：对比时间戳
    case '[object Date]':
      return a.getTime() === b.getTime();

    // 3.2 正则对象：对比源文本和标志
    case '[object RegExp]':
      return a.source === b.source && a.flags === b.flags;

    // 3.3 函数/符号：直接对比引用（函数/符号不建议深度对比）
    case '[object Function]':
    case '[object Symbol]':
      return a === b;

    // 3.4 数组：递归对比每个元素
    case '[object Array]':
      // 长度不同直接不等
      if (a.length !== b.length) return false;
      // 递归对比每个元素
      for (let i = 0; i < a.length; i++) {
        if (!isEqual(a[i], b[i])) return false;
      }
      return true;

    // 3.5 普通对象：递归对比每个键值对
    case '[object Object]':
      // 排除原型链上的属性，只对比自身可枚举属性
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      // 键的数量不同直接不等
      if (keysA.length !== keysB.length) return false;
      // 递归对比每个键值对
      for (const key of keysA) {
        if (!keysB.includes(key) || !isEqual(a[key], b[key])) return false;
      }
      return true;

    // 3.6 其他基本类型（字符串/数字/布尔）：直接对比
    default:
      return a === b;
  }
};

/**
 * @description 判断是否为json
 * @param value
 * @returns {boolean}
 */
export function isJson(value) {
  if (typeof value === 'string') {
    const obj = JSON.parse(value)
    return !!(typeof obj === 'object' && obj)
  }
  return false
}

/**
 * 经度校验函数
 * @param {string/number} value 经度值
 * @param {function} callback 校验回调（Element UI表单校验规范）
 */
export const validateLongitude = (value, callback) => {
  // 空值校验
  if (!value) {
    return callback(new Error("请输入经度"));
  }
  // 转换为数字
  const lng = Number(value);
  // 格式校验：是否为有效数字
  if (isNaN(lng)) {
    return callback(new Error("经度必须为数字（支持小数点）"));
  }
  // 范围校验：经度范围 -180 ~ 180
  if (lng < -180 || lng > 180) {
    return callback(new Error("经度范围必须在 -180 ~ 180 之间"));
  }
  // 校验通过
  callback();
};

/**
 * 纬度校验函数
 * @param {string/number} value 纬度值
 * @param {function} callback 校验回调
 */
export const validateLatitude = (value, callback) => {
  // 空值校验
  if (!value) {
    return callback(new Error("请输入纬度"));
  }
  // 转换为数字
  const lat = Number(value);
  // 格式校验：是否为有效数字
  if (isNaN(lat)) {
    return callback(new Error("纬度必须为数字（支持小数点）"));
  }
  // 范围校验：纬度范围 -90 ~ 90
  if (lat < -90 || lat > 90) {
    return callback(new Error("纬度范围必须在 -90 ~ 90 之间"));
  }
  // 校验通过
  callback();
};

/**
 * 经纬度联合校验函数（适配单个表单项校验两个字段）
 * @param {object} formData 表单数据对象（需包含longitude/latitude字段）
 * @param {function} callback 校验回调
 */
export const validateLocation = (formData, callback) => {
  const { longitude, latitude } = formData;
  let errorMsg = '';

  // 先校验经度
  if (!longitude) {
    errorMsg = "请输入经度";
  } else {
    const lng = Number(longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errorMsg = "经度必须是 -180 ~ 180 之间的数字";
    }
  }

  // 经度通过后校验纬度
  if (!errorMsg) {
    if (!latitude) {
      errorMsg = "请输入纬度";
    } else {
      const lat = Number(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errorMsg = "纬度必须是 -90 ~ 90 之间的数字";
      }
    }
  }

  // 返回校验结果
  if (errorMsg) {
    callback(new Error(errorMsg));
  } else {
    callback();
  }
};

/**
 * 通用的资源类型校验（游玩类/地标类）
 * @param {array} value 选中的资源类型数组
 * @param {object} formData 表单数据对象
 * @param {function} callback 校验回调
 */
export const validateResources = (value, formData, callback) => {
  if (value.length === 0) {
    return callback(new Error("请至少选择一个地点类型（游玩类/地标类）"));
  }

  let errorMsg = "";

  // 游玩类勾选但未选树形选择器
  if (value.includes("play") && !formData.play_category) {
    errorMsg = "请选择游玩分类";
  }
  // 地标类勾选但未选树形选择器
  if (value.includes("landmark") && !formData.landmark_category) {
    errorMsg = "请选择地标分类";
  }

  if (errorMsg) {
    callback(new Error(errorMsg));
  } else {
    callback();
  }
};

/**
 * isSever最终校验
 */
// ;(() => {
//   const dev = process['env']['NODE_' + 'ENV'] === 'dev' + 'elop' + 'ment'
//   const key: any = process['env']['VUE_' + 'APP_' + 'SEC' + 'RET_' + 'KEY']
//   const hostname = window.location.hostname
//   const local = '127.' + '0.' + '0.' + '1'
//   const server = hostname !== 'local' + 'host' || hostname !== local

//   if (!dev && server) {
//     if (key.substring(key.length - 2) !== '=' + '=')
//       localStorage.setItem('theme', '{"lay' + 'out","nu' + 'll"}')
//   }
// })()
