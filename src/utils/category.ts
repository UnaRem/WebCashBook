// 1. 定义分类规则的数据类型
interface CategoryRule {
  category: string
  keywords: string[]
}

// 基础分类规则数据
const DEFAULT_CATEGORIES: CategoryRule[] = [
  {
    category: '早餐',
    keywords: ['早餐', '颜邦芹'],
  },
  {
    category: '房租',
    keywords: ['房租', '爱尚'],
  },
  {
    category: '收入',
    keywords: ['收入', '打开拼多多，领更多现金红包'],
  },
  {
    category: '餐饮美食',
    keywords: ['外卖', '螺蛳粉', '火锅', '面馆', '餐饮', '美团', '拼一餐餐饮', '娟', '麦当劳', '肯德基', '文森纪'],
  },
  {
    category: '交通出行',
    keywords: ['滴滴', '出租车', '公交', '地铁', '共享单车', '花小猪', '哈啰', '易通卡', '北京鸿易博'],
  },
  {
    category: '购物消费',
    keywords: ['淘宝', '京东', '拼多多', '超市', '便利店', '消费', '购物', '收款', '电商'],
  },
  {
    category: '充值缴费',
    keywords: ['充值', '缴费', '话费', '电费', '水费'],
  },
  {
    category: '娱乐休闲',
    keywords: ['电影', '游戏', 'KTV', '娱乐'],
  },
  {
    category: '医疗健康',
    keywords: ['医院', '药店', '体检', '医疗'],
  },
  {
    category: '教育培训',
    keywords: ['教育', '培训', '课程', '学习'],
  },
  {
    category: '生活服务',
    keywords: ['生活', '服务'],
  },
  {
    category: '数码电器',
    keywords: ['数码', '电器'],
  },
  {
    category: '投资理财',
    keywords: ['投资', '理财'],
  },
  {
    category: '人情世故',
    keywords: ['转账'],
  },
]

/**
 * 字符串关键字分类匹配器
 */
export class CategoryMatcher {
  // 核心数据结构：Map<关键字, 分类名称>
  private keywordMap: Map<string, string>
  private isLoaded: boolean = false

  /**
   * 构造函数：初始化并加载分类规则。
   * 自动从数据库加载分类规则
   */
  constructor() {
    this.keywordMap = new Map<string, string>()
    this.loadRules()
  }

  /**
   * 将分类规则从数据库加载到 Map 中，实现关键字到分类的快速查找。
   */
  private async loadRules(): Promise<void> {
    try {
      // 动态导入数据库
      const { default: db } = await import('@/dexie')
      const rules = await db.categories.toArray()
      console.log(`正在从数据库加载 ${rules.length} 条分类规则...`)
      let keywordCount = 0

      // 如果数据库为空，使用默认分类规则初始化数据
      if (rules.length === 0) {
        console.log('数据库为空，正在使用默认分类规则初始化数据...')
        await this.initDatabaseWithDefaults()
        // 重新加载数据
        const newRules = await db.categories.toArray()
        for (const rule of newRules) {
          const category = rule.category
          for (const keyword of rule.keywords) {
            this.keywordMap.set(keyword, category)
            keywordCount++
          }
        }
      } else {
        for (const rule of rules) {
          const category = rule.category
          for (const keyword of rule.keywords) {
            // 将关键字及其对应分类存入 Map
            this.keywordMap.set(keyword, category)
            keywordCount++
          }
        }
      }

      console.log(`分类加载完成，共 ${keywordCount} 个关键字。`)
      this.isLoaded = true
    } catch (error) {
      console.error('从数据库加载分类规则失败:', error)
    }
  }

  /**
   * 使用默认分类规则初始化数据库
   */
  private async initDatabaseWithDefaults(): Promise<void> {
    try {
      const { default: db } = await import('@/dexie')

      // 添加默认分类数据
      await db.categories.bulkAdd(DEFAULT_CATEGORIES)
      console.log(`已使用默认分类规则初始化 ${DEFAULT_CATEGORIES.length} 条分类规则到数据库`)
    } catch (error) {
      console.error('使用默认分类规则初始化数据库失败:', error)
    }
  }

  /**
   * 重新加载分类规则
   */
  public async reload(): Promise<void> {
    this.keywordMap.clear()
    this.isLoaded = false
    await this.loadRules()
  }

  /**
   * 根据输入字符串匹配并返回对应的分类名称。
   * 使用 Map 进行关键字检索，一旦匹配成功即返回。
   * @param input 待分类的输入字符串
   * @returns 匹配到的分类名称，如果未匹配到则返回 null
   */
  public matchCategory(input: string): string | null {
    if (!this.isLoaded) {
      console.warn('分类规则尚未加载完成')
      return null
    }

    // 遍历 keywordMap 中的所有关键字
    for (const [keyword, category] of this.keywordMap.entries()) {
      // 使用 String.prototype.includes() 进行关键字匹配
      if (input.includes(keyword)) {
        // 匹配成功，返回对应的分类名称
        return category
      }
    }

    // 遍历完成后仍未匹配到任何关键字
    return null
  }

  /**
   * 检查分类器是否已加载完成
   */
  public get loaded(): boolean {
    return this.isLoaded
  }
}

// 创建单例实例
export const categoryMatcher = new CategoryMatcher()
