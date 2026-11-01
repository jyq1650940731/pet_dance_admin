/**
 * @description 3个子配置，vue/cli配置|通用配置|网络配置导出
 *              config中的部分配置由构建工具读取，本质是构建期模块，故不可使用 window 等浏览器对象
 */
import cli from './cli.config'
import setting from './setting.config'
import network from './net.config'

export default {
  ...cli,
  ...setting,
  ...network,
}
