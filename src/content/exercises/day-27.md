---
day: 27
title: "State与事件处理练习"
description: "通过实战练习掌握React State管理、事件系统和受控组件的使用"
exercises:
  - title: "购物车组件"
    description: "创建一个功能完整的购物车组件，包含商品展示、添加到购物车、修改数量、删除商品、计算总价等功能"
    difficulty: "intermediate"
    requirements:
      - "商品列表展示（至少5个商品）"
      - "添加商品到购物车功能"
      - "购物车中商品数量增减"
      - "删除购物车商品"
      - "实时计算总价和商品总数"
      - "购物车为空时显示友好提示"
      - "防止库存不足（每个商品设置最大购买量）"
      - "保存购物车到localStorage"
    tips:
      - "使用对象存储购物车数据，以商品ID为键"
      - "计算属性使用useMemo优化性能"
      - "考虑使用reduce计算总价"
      - "处理边界情况（如数量为0时自动删除）"
    
  - title: "多步骤表单向导"
    description: "实现一个多步骤的用户注册表单，包含个人信息、联系方式、账户设置三个步骤，支持步骤导航和数据验证"
    difficulty: "advanced"
    requirements:
      - "三个步骤：个人信息（姓名、生日、性别）、联系方式（邮箱、电话、地址）、账户设置（用户名、密码、偏好设置）"
      - "步骤进度指示器"
      - "前进/后退导航"
      - "每步实时验证"
      - "步骤间数据保持"
      - "最终提交前的数据预览"
      - "支持直接跳转到已完成的步骤"
      - "未保存退出时警告"
    tips:
      - "使用单一状态存储所有表单数据"
      - "将验证逻辑抽取为独立函数"
      - "考虑使用useReducer管理复杂状态"
      - "使用受控组件确保数据同步"
    
  - title: "实时搜索组件"
    description: "构建一个高性能的实时搜索组件，支持防抖、搜索历史、热门搜索推荐和键盘导航"
    difficulty: "advanced"
    requirements:
      - "输入防抖（延迟300ms）"
      - "搜索历史记录（最近10条）"
      - "热门搜索推荐"
      - "搜索结果高亮匹配文本"
      - "键盘导航（上下箭头选择，Enter确认）"
      - "加载状态显示"
      - "空结果友好提示"
      - "清除历史记录功能"
      - "支持ESC键关闭搜索结果"
    tips:
      - "使用useEffect处理防抖逻辑"
      - "考虑使用useRef存储定时器"
      - "键盘事件处理注意preventDefault"
      - "使用正则表达式实现高亮功能"

selfCheckQuestions:
  - "State更新后，为什么有时候立即读取state还是旧值？如何解决？"
  - "什么情况下需要使用函数式的setState？"
  - "受控组件和非受控组件各有什么优缺点？"
  - "如何防止表单提交时的页面刷新？"
  - "事件处理函数中的this指向问题如何解决？"

resources:
  - title: "React表单处理完全指南"
    url: "https://react.dev/reference/react-dom/components/form"
    type: "article"
    description: "深入了解React中的表单处理"
  - title: "防抖和节流的实现"
    url: "https://www.joshwcomeau.com/snippets/javascript/debounce/"
    type: "article"
    description: "理解和实现防抖函数"
  - title: "React性能优化"
    url: "https://react.dev/learn/render-and-commit"
    type: "documentation"
    description: "了解React的渲染机制"

estimatedTime: 180
objectives:
  - "掌握State的更新机制和最佳实践"
  - "熟练使用React事件系统"
  - "实现复杂的表单处理逻辑"
  - "理解并应用状态提升模式"
  - "优化组件性能，避免不必要的渲染"
---