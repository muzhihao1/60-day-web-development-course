import MDXCodeBlock from './MDXCodeBlock.astro'

// MDX组件映射
export const components = {
  // 替换pre标签为我们的自定义代码块组件
  pre: MDXCodeBlock,
}