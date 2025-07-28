---
day: 14
title: "函数式编程实战：学生成绩数据处理"
description: "使用函数式编程技术构建一个完整的数据处理管道，处理和分析学生成绩数据"
difficulty: "intermediate"
estimatedTime: 90
requirements:
  - "使用纯函数处理所有数据转换"
  - "使用map、filter、reduce等数组方法"
  - "实现函数组合和管道"
  - "不使用任何for循环或while循环"
  - "处理边缘情况和无效数据"
  - "生成多维度的统计报告"
hints:
  - "先验证和清洗数据"
  - "将复杂逻辑拆分为小的纯函数"
  - "使用函数组合构建处理管道"
  - "reduce可以实现很多复杂的聚合操作"
  - "考虑使用柯里化创建可重用的函数"
checkpoints:
  - task: "创建数据验证函数"
    completed: false
  - task: "实现成绩统计计算"
    completed: false
  - task: "按班级分组统计"
    completed: false
  - task: "按科目分析成绩"
    completed: false
  - task: "生成学生排名"
    completed: false
  - task: "创建成绩报告生成器"
    completed: false
  - task: "实现函数组合管道"
    completed: false
starterCode:
  language: "javascript"
  path: "/exercises/day-14/student-grades.js"
---

# 练习：函数式编程实战 - 学生成绩数据处理

## 🎯 任务目标

你是一所学校的数据分析师，需要处理和分析学生的考试成绩数据。使用函数式编程技术，构建一个强大的数据处理管道，能够：

1. 验证和清洗原始数据
2. 计算各种统计指标
3. 生成多维度的分析报告
4. 提供有价值的教学建议

## 📋 任务要求

### 数据结构

```javascript
// 学生成绩数据示例
const studentGrades = [
    {
        studentId: 'STU001',
        name: '张三',
        class: '高三1班',
        grades: {
            chinese: 85,
            math: 92,
            english: 78,
            physics: 88,
            chemistry: 90,
            biology: 86
        }
    },
    // ... 更多学生数据
];
```

### 功能需求

1. **数据验证与清洗**
   - 验证学生ID格式
   - 确保成绩在0-100之间
   - 处理缺失的成绩数据
   - 标记异常数据

2. **基础统计计算**
   - 每个学生的总分和平均分
   - 每个科目的平均分
   - 最高分和最低分
   - 标准差计算

3. **高级分析**
   - 按班级分组统计
   - 成绩分布分析（优秀、良好、及格、不及格）
   - 学科强弱分析
   - 进步/退步趋势（如果有历史数据）

4. **报告生成**
   - 班级成绩报告
   - 个人成绩单
   - 学科分析报告
   - 教学建议

## 🔍 初始代码

### student-grades.js

```javascript
// 学生成绩数据处理系统 - 函数式编程实战

// 原始成绩数据
const rawGrades = [
    {
        studentId: 'STU001',
        name: '张三',
        class: '高三1班',
        grades: {
            chinese: 85,
            math: 92,
            english: 78,
            physics: 88,
            chemistry: 90,
            biology: 86
        }
    },
    {
        studentId: 'STU002',
        name: '李四',
        class: '高三1班',
        grades: {
            chinese: 92,
            math: 85,
            english: 88,
            physics: 76,
            chemistry: 84,
            biology: 90
        }
    },
    {
        studentId: 'STU003',
        name: '王五',
        class: '高三2班',
        grades: {
            chinese: 78,
            math: 96,
            english: 82,
            physics: 94,
            chemistry: 92,
            biology: 88
        }
    },
    {
        studentId: 'STU004',
        name: '赵六',
        class: '高三2班',
        grades: {
            chinese: 88,
            math: 72,
            english: 90,
            physics: 78,
            chemistry: 80,
            biology: 82
        }
    },
    {
        studentId: 'STU005',
        name: '钱七',
        class: '高三1班',
        grades: {
            chinese: 95,
            math: 98,
            english: 92,
            physics: 96,
            chemistry: 94,
            biology: 97
        }
    },
    // 一些异常数据用于测试
    {
        studentId: 'INVALID',
        name: '测试学生1',
        class: '高三3班',
        grades: {
            chinese: 120, // 超出范围
            math: -10,    // 负数
            english: 85,
            physics: null, // 缺失
            chemistry: undefined,
            biology: 'absent' // 非数字
        }
    },
    {
        studentId: 'STU006',
        name: '',  // 空名字
        class: '高三3班',
        grades: {} // 空成绩
    }
];

// TODO: 实现以下功能

// 1. 数据验证函数
// 验证学生ID格式（STU开头，后跟3位数字）
const isValidStudentId = (id) => {
    // 实现验证逻辑
};

// 验证成绩是否有效（0-100之间的数字）
const isValidGrade = (grade) => {
    // 实现验证逻辑
};

// 验证学生数据完整性
const validateStudent = (student) => {
    // 返回 { isValid: boolean, errors: string[] }
};

// 2. 数据清洗函数
// 清洗单个成绩（无效成绩设为null）
const cleanGrade = (grade) => {
    // 实现清洗逻辑
};

// 清洗学生数据
const cleanStudent = (student) => {
    // 返回清洗后的学生数据
};

// 3. 成绩计算函数
// 计算有效成绩的平均分
const calculateAverage = (grades) => {
    // 只计算有效成绩
};

// 计算总分
const calculateTotal = (grades) => {
    // 只计算有效成绩
};

// 添加计算字段到学生数据
const enrichStudent = (student) => {
    // 添加 total, average, validSubjects 等字段
};

// 4. 统计分析函数
// 计算成绩等级（优秀>=90，良好>=80，及格>=60，不及格<60）
const getGradeLevel = (score) => {
    // 返回等级字符串
};

// 分析学生的学科强弱
const analyzeStrengths = (student) => {
    // 返回 { strengths: [], weaknesses: [] }
};

// 5. 分组聚合函数
// 按班级分组
const groupByClass = (students) => {
    // 使用reduce实现分组
};

// 计算班级统计信息
const calculateClassStats = (students) => {
    // 返回班级的平均分、最高分、最低分等
};

// 6. 排名函数
// 按总分排名
const rankByTotal = (students) => {
    // 添加rank字段
};

// 按单科排名
const rankBySubject = (subject) => (students) => {
    // 返回该科目的排名
};

// 7. 报告生成函数
// 生成个人成绩报告
const generateStudentReport = (student) => {
    // 返回格式化的报告对象
};

// 生成班级报告
const generateClassReport = (className, students) => {
    // 返回班级整体分析报告
};

// 生成学科分析报告
const generateSubjectReport = (subject, students) => {
    // 返回该学科的分析报告
};

// 8. 主处理管道
// 使用函数组合构建完整的数据处理流程
const processGrades = (rawData) => {
    // 1. 验证和清洗数据
    // 2. 计算统计信息
    // 3. 生成各类报告
    // 返回完整的分析结果
};

// 执行处理
const result = processGrades(rawGrades);
console.log('处理结果:', result);

// 测试用例（可选）
const runTests = () => {
    console.log('运行测试...');
    
    // 测试数据验证
    console.assert(isValidStudentId('STU001') === true);
    console.assert(isValidStudentId('INVALID') === false);
    
    // 测试成绩验证
    console.assert(isValidGrade(85) === true);
    console.assert(isValidGrade(120) === false);
    console.assert(isValidGrade(-10) === false);
    console.assert(isValidGrade('absent') === false);
    
    console.log('测试完成！');
};

// runTests();
```

## 📝 实现提示

### 1. 数据验证示例

```javascript
const isValidStudentId = (id) => /^STU\d{3}$/.test(id);

const isValidGrade = (grade) => 
    typeof grade === 'number' && 
    grade >= 0 && 
    grade <= 100;
```

### 2. 使用函数组合

```javascript
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const processStudent = pipe(
    validateStudent,
    cleanStudent,
    enrichStudent,
    analyzeStrengths
);
```

### 3. 灵活使用reduce

```javascript
// 同时计算多个统计值
const stats = grades.reduce((acc, grade) => {
    if (isValidGrade(grade)) {
        return {
            sum: acc.sum + grade,
            count: acc.count + 1,
            max: Math.max(acc.max, grade),
            min: Math.min(acc.min, grade)
        };
    }
    return acc;
}, { sum: 0, count: 0, max: -Infinity, min: Infinity });
```

### 4. 柯里化的应用

```javascript
const filterByGradeLevel = curry((level, students) => 
    students.filter(student => 
        getGradeLevel(student.average) === level
    )
);

const getExcellentStudents = filterByGradeLevel('优秀');
```

## 🎨 期望输出格式

```javascript
{
    // 验证结果
    validation: {
        totalRecords: 7,
        validRecords: 5,
        invalidRecords: 2,
        errors: [
            { studentId: 'INVALID', errors: ['Invalid ID', 'Grade out of range'] },
            { studentId: 'STU006', errors: ['Missing name', 'No grades'] }
        ]
    },
    
    // 整体统计
    summary: {
        totalStudents: 5,
        averageScore: 85.3,
        subjectAverages: {
            chinese: 89.6,
            math: 88.6,
            english: 86.0,
            // ...
        }
    },
    
    // 班级报告
    classReports: {
        '高三1班': {
            studentCount: 3,
            classAverage: 87.2,
            topStudent: '钱七',
            // ...
        },
        // ...
    },
    
    // 学科报告
    subjectReports: {
        math: {
            average: 88.6,
            highest: { name: '钱七', score: 98 },
            lowest: { name: '赵六', score: 72 },
            distribution: {
                '优秀': 3,
                '良好': 1,
                '及格': 1,
                '不及格': 0
            }
        },
        // ...
    },
    
    // 学生排名
    rankings: {
        overall: [
            { rank: 1, name: '钱七', total: 572, average: 95.3 },
            // ...
        ],
        bySubject: {
            math: [/* ... */],
            chinese: [/* ... */],
            // ...
        }
    }
}
```

## 💡 额外挑战

1. **性能优化**：处理10000+条记录时如何优化？
2. **趋势分析**：如果有多次考试数据，如何分析进步趋势？
3. **异常检测**：自动识别异常的成绩模式
4. **可视化准备**：生成适合图表展示的数据格式

## 🚀 进阶思考

- 如何让这个系统更加通用，适应不同的数据格式？
- 如何添加更多的统计指标（方差、中位数、四分位数）？
- 如何实现一个插件系统，让用户自定义分析维度？

记住：**函数式编程的核心是组合小的、专注的函数来解决复杂问题**。享受构建优雅数据管道的过程！