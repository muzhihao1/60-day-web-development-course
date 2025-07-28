---
day: 14
exerciseTitle: "函数式编程实战：学生成绩数据处理"
approach: "使用纯函数、数组方法和函数组合构建完整的数据处理管道"
files:
  - path: "utils.js"
    language: "javascript"
    description: "工具函数和函数组合库"
  - path: "validators.js"
    language: "javascript"
    description: "数据验证函数"
  - path: "processors.js"
    language: "javascript"
    description: "数据处理和转换函数"
  - path: "analyzers.js"
    language: "javascript"
    description: "统计分析函数"
  - path: "reporters.js"
    language: "javascript"
    description: "报告生成函数"
  - path: "main.js"
    language: "javascript"
    description: "主程序和处理管道"
keyTakeaways:
  - "纯函数使代码更容易测试和理解"
  - "函数组合能够构建复杂的数据处理流程"
  - "reduce是最强大的数组方法，可以实现其他所有方法"
  - "柯里化让函数更加灵活和可重用"
  - "将副作用与纯计算分离提高代码质量"
commonMistakes:
  - "直接修改原始数据而不是创建新数据"
  - "在reduce中忘记返回累加器"
  - "过度使用链式调用导致性能问题"
  - "忽略边缘情况和错误处理"
  - "函数职责不单一，做了太多事情"
extensions:
  - title: "添加数据可视化"
    description: "生成适合Chart.js的数据格式"
  - title: "历史趋势分析"
    description: "比较多次考试的成绩变化"
  - title: "智能建议系统"
    description: "基于数据分析提供个性化学习建议"
---

# 解决方案：函数式编程实战 - 学生成绩数据处理

## 实现思路

这个解决方案展示了如何使用函数式编程技术构建一个复杂的数据处理系统。核心思想是：
1. 每个功能都是一个纯函数
2. 通过组合小函数构建大功能
3. 数据不可变，总是返回新数据
4. 使用管道模式处理数据流

## 完整代码实现

### 工具函数库 (utils.js)

```javascript
// 函数组合工具
export const pipe = (...fns) => x => 
    fns.reduce((v, f) => f(v), x);

export const compose = (...fns) => x => 
    fns.reduceRight((v, f) => f(v), x);

// 柯里化
export const curry = (fn) => {
    const arity = fn.length;
    return function curried(...args) {
        if (args.length >= arity) {
            return fn(...args);
        }
        return (...nextArgs) => curried(...args, ...nextArgs);
    };
};

// 调试工具
export const trace = (label) => (value) => {
    console.log(`[${label}]:`, value);
    return value;
};

export const tap = (fn) => (value) => {
    fn(value);
    return value;
};

// 数学工具
export const sum = (numbers) => 
    numbers.reduce((a, b) => a + b, 0);

export const average = (numbers) => 
    numbers.length > 0 ? sum(numbers) / numbers.length : 0;

export const standardDeviation = (numbers) => {
    const avg = average(numbers);
    const squaredDiffs = numbers.map(n => Math.pow(n - avg, 2));
    const variance = average(squaredDiffs);
    return Math.sqrt(variance);
};

// 对象工具
export const pick = (keys) => (obj) => 
    keys.reduce((acc, key) => {
        if (key in obj) acc[key] = obj[key];
        return acc;
    }, {});

export const omit = (keys) => (obj) => 
    Object.entries(obj).reduce((acc, [key, value]) => {
        if (!keys.includes(key)) acc[key] = value;
        return acc;
    }, {});

// 数组工具
export const groupBy = (key) => (array) => 
    array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});

export const sortBy = (key, order = 'asc') => (array) => 
    [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        const result = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return order === 'asc' ? result : -result;
    });

export const take = (n) => (array) => array.slice(0, n);

export const unique = (array) => [...new Set(array)];

// 条件工具
export const when = (predicate, fn) => (x) => 
    predicate(x) ? fn(x) : x;

export const unless = (predicate, fn) => (x) => 
    predicate(x) ? x : fn(x);

export const ifElse = (predicate, onTrue, onFalse) => (x) => 
    predicate(x) ? onTrue(x) : onFalse(x);
```

### 数据验证函数 (validators.js)

```javascript
import { curry } from './utils.js';

// 基础验证函数
export const isValidStudentId = (id) => 
    typeof id === 'string' && /^STU\d{3}$/.test(id);

export const isValidGrade = (grade) => 
    typeof grade === 'number' && 
    !isNaN(grade) && 
    grade >= 0 && 
    grade <= 100;

export const isValidName = (name) => 
    typeof name === 'string' && 
    name.trim().length > 0;

export const isValidClass = (className) => 
    typeof className === 'string' && 
    /^高三\d+班$/.test(className);

// 验证成绩对象
export const validateGrades = (grades) => {
    const errors = [];
    const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'];
    
    subjects.forEach(subject => {
        if (!(subject in grades)) {
            errors.push(`缺少${subject}成绩`);
        } else if (!isValidGrade(grades[subject])) {
            errors.push(`${subject}成绩无效: ${grades[subject]}`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// 验证学生数据
export const validateStudent = (student) => {
    const errors = [];
    
    if (!isValidStudentId(student.studentId)) {
        errors.push('学生ID格式错误');
    }
    
    if (!isValidName(student.name)) {
        errors.push('学生姓名无效');
    }
    
    if (!isValidClass(student.class)) {
        errors.push('班级格式错误');
    }
    
    if (!student.grades || typeof student.grades !== 'object') {
        errors.push('成绩数据缺失');
    } else {
        const gradeValidation = validateGrades(student.grades);
        if (!gradeValidation.isValid) {
            errors.push(...gradeValidation.errors);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        student
    };
};

// 批量验证
export const validateStudents = (students) => {
    const results = students.map(validateStudent);
    
    return {
        totalRecords: students.length,
        validRecords: results.filter(r => r.isValid).length,
        invalidRecords: results.filter(r => !r.isValid).length,
        errors: results
            .filter(r => !r.isValid)
            .map(r => ({
                studentId: r.student.studentId,
                name: r.student.name || '未知',
                errors: r.errors
            })),
        validStudents: results
            .filter(r => r.isValid)
            .map(r => r.student)
    };
};
```

### 数据处理函数 (processors.js)

```javascript
import { pipe, curry, sum, average } from './utils.js';
import { isValidGrade } from './validators.js';

// 清洗成绩数据
export const cleanGrade = (grade) => 
    isValidGrade(grade) ? grade : null;

export const cleanGrades = (grades) => 
    Object.entries(grades).reduce((cleaned, [subject, grade]) => {
        cleaned[subject] = cleanGrade(grade);
        return cleaned;
    }, {});

// 清洗学生数据
export const cleanStudent = (student) => ({
    ...student,
    name: student.name?.trim() || '未知学生',
    grades: cleanGrades(student.grades || {})
});

// 计算有效成绩
export const getValidGrades = (grades) => 
    Object.values(grades).filter(grade => grade !== null);

// 计算总分（只计算有效成绩）
export const calculateTotal = (grades) => {
    const validGrades = getValidGrades(grades);
    return validGrades.length > 0 ? sum(validGrades) : 0;
};

// 计算平均分
export const calculateAverage = (grades) => {
    const validGrades = getValidGrades(grades);
    return validGrades.length > 0 ? average(validGrades) : 0;
};

// 计算有效科目数
export const countValidSubjects = (grades) => 
    getValidGrades(grades).length;

// 获取成绩等级
export const getGradeLevel = (score) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 60) return '及格';
    return '不及格';
};

// 丰富学生数据
export const enrichStudent = (student) => {
    const validGrades = getValidGrades(student.grades);
    const total = calculateTotal(student.grades);
    const avg = calculateAverage(student.grades);
    
    return {
        ...student,
        total,
        average: Number(avg.toFixed(2)),
        validSubjects: countValidSubjects(student.grades),
        gradeLevel: getGradeLevel(avg),
        // 计算每科的等级
        subjectLevels: Object.entries(student.grades).reduce((levels, [subject, grade]) => {
            if (grade !== null) {
                levels[subject] = getGradeLevel(grade);
            }
            return levels;
        }, {})
    };
};

// 分析学科强弱
export const analyzeStrengths = (student) => {
    const { grades, average } = student;
    const threshold = 5; // 与平均分相差5分以上视为强弱科目
    
    const strengths = [];
    const weaknesses = [];
    
    Object.entries(grades).forEach(([subject, grade]) => {
        if (grade !== null) {
            const diff = grade - average;
            if (diff > threshold) {
                strengths.push({ subject, grade, diff: Number(diff.toFixed(2)) });
            } else if (diff < -threshold) {
                weaknesses.push({ subject, grade, diff: Number(diff.toFixed(2)) });
            }
        }
    });
    
    return {
        ...student,
        analysis: {
            strengths: strengths.sort((a, b) => b.diff - a.diff),
            weaknesses: weaknesses.sort((a, b) => a.diff - b.diff)
        }
    };
};

// 完整的学生数据处理管道
export const processStudent = pipe(
    cleanStudent,
    enrichStudent,
    analyzeStrengths
);
```

### 统计分析函数 (analyzers.js)

```javascript
import { curry, groupBy, average, standardDeviation, sortBy } from './utils.js';

// 计算科目统计
export const calculateSubjectStats = curry((subject, students) => {
    const grades = students
        .map(s => s.grades[subject])
        .filter(g => g !== null);
    
    if (grades.length === 0) {
        return { subject, noData: true };
    }
    
    const sorted = [...grades].sort((a, b) => a - b);
    const avg = average(grades);
    const std = standardDeviation(grades);
    
    // 计算分布
    const distribution = grades.reduce((dist, grade) => {
        const level = grade >= 90 ? '优秀' :
                     grade >= 80 ? '良好' :
                     grade >= 60 ? '及格' : '不及格';
        dist[level] = (dist[level] || 0) + 1;
        return dist;
    }, {});
    
    return {
        subject,
        count: grades.length,
        average: Number(avg.toFixed(2)),
        standardDeviation: Number(std.toFixed(2)),
        highest: Math.max(...grades),
        lowest: Math.min(...grades),
        median: sorted[Math.floor(sorted.length / 2)],
        distribution,
        passRate: Number((grades.filter(g => g >= 60).length / grades.length * 100).toFixed(2))
    };
});

// 计算班级统计
export const calculateClassStats = (students) => {
    if (students.length === 0) return null;
    
    const averages = students.map(s => s.average);
    const className = students[0].class;
    
    return {
        className,
        studentCount: students.length,
        classAverage: Number(average(averages).toFixed(2)),
        highest: {
            score: Math.max(...averages),
            student: students.find(s => s.average === Math.max(...averages))
        },
        lowest: {
            score: Math.min(...averages),
            student: students.find(s => s.average === Math.min(...averages))
        },
        gradeDistribution: students.reduce((dist, s) => {
            dist[s.gradeLevel] = (dist[s.gradeLevel] || 0) + 1;
            return dist;
        }, {}),
        subjects: ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology']
            .map(subject => ({
                subject,
                average: Number(average(
                    students.map(s => s.grades[subject]).filter(g => g !== null)
                ).toFixed(2))
            }))
    };
};

// 添加排名
export const addRanking = curry((key, students) => {
    const sorted = sortBy(key, 'desc')(students);
    return sorted.map((student, index) => ({
        ...student,
        [`${key}Rank`]: index + 1
    }));
});

// 按总分排名
export const rankByTotal = addRanking('total');

// 按科目排名
export const rankBySubject = curry((subject, students) => {
    const sorted = [...students].sort((a, b) => {
        const gradeA = a.grades[subject] ?? -1;
        const gradeB = b.grades[subject] ?? -1;
        return gradeB - gradeA;
    });
    
    return sorted.map((student, index) => ({
        ...student,
        subjectRanks: {
            ...student.subjectRanks,
            [subject]: student.grades[subject] !== null ? index + 1 : null
        }
    }));
});

// 综合排名（总分 + 各科）
export const addAllRankings = (students) => {
    let rankedStudents = rankByTotal(students);
    
    const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'];
    subjects.forEach(subject => {
        rankedStudents = rankBySubject(subject, rankedStudents);
    });
    
    return rankedStudents;
};

// 找出进步空间最大的学生
export const findImprovementOpportunities = (students) => {
    return students.map(student => {
        const { analysis, average, grades } = student;
        const weakSubjects = analysis.weaknesses;
        
        // 计算如果弱科提升到平均水平能提高多少分
        const potentialImprovement = weakSubjects.reduce((total, weak) => {
            const currentGrade = grades[weak.subject];
            const improvedGrade = average;
            return total + (improvedGrade - currentGrade);
        }, 0);
        
        return {
            ...student,
            improvementPotential: {
                weakSubjects: weakSubjects.map(w => w.subject),
                currentAverage: average,
                potentialAverage: Number((average + potentialImprovement / 6).toFixed(2)),
                potentialGain: Number(potentialImprovement.toFixed(2))
            }
        };
    }).sort((a, b) => b.improvementPotential.potentialGain - a.improvementPotential.potentialGain);
};
```

### 报告生成函数 (reporters.js)

```javascript
import { groupBy, pipe, curry } from './utils.js';
import { calculateSubjectStats, calculateClassStats } from './analyzers.js';

// 生成个人成绩报告
export const generateStudentReport = (student) => {
    const { 
        studentId, name, class: className, 
        total, average, totalRank, 
        gradeLevel, analysis, subjectRanks,
        improvementPotential 
    } = student;
    
    return {
        基本信息: {
            学号: studentId,
            姓名: name,
            班级: className
        },
        成绩概览: {
            总分: total,
            平均分: average,
            年级排名: totalRank,
            成绩等级: gradeLevel
        },
        各科成绩: Object.entries(student.grades).map(([subject, grade]) => ({
            科目: subject,
            成绩: grade ?? '缺考',
            等级: student.subjectLevels[subject] || '-',
            排名: subjectRanks?.[subject] ?? '-'
        })),
        优势科目: analysis.strengths.map(s => 
            `${s.subject} (${s.grade}分，高于平均${s.diff}分)`
        ),
        弱势科目: analysis.weaknesses.map(w => 
            `${w.subject} (${w.grade}分，低于平均${Math.abs(w.diff)}分)`
        ),
        提升建议: improvementPotential ? {
            重点提升科目: improvementPotential.weakSubjects,
            当前平均分: improvementPotential.currentAverage,
            潜在平均分: improvementPotential.potentialAverage,
            预计提升: `${improvementPotential.potentialGain}分`
        } : null
    };
};

// 生成班级报告
export const generateClassReport = (classData) => {
    const { className, students } = classData;
    const stats = calculateClassStats(students);
    
    if (!stats) return null;
    
    return {
        班级: className,
        基本统计: {
            学生人数: stats.studentCount,
            班级平均分: stats.classAverage,
            最高分: `${stats.highest.student.name} (${stats.highest.score}分)`,
            最低分: `${stats.lowest.student.name} (${stats.lowest.score}分)`
        },
        成绩分布: Object.entries(stats.gradeDistribution).map(([level, count]) => ({
            等级: level,
            人数: count,
            占比: `${(count / stats.studentCount * 100).toFixed(1)}%`
        })),
        各科平均分: stats.subjects,
        前三名: students.slice(0, 3).map((s, i) => ({
            排名: i + 1,
            姓名: s.name,
            总分: s.total,
            平均分: s.average
        })),
        需要关注的学生: students
            .filter(s => s.gradeLevel === '不及格')
            .map(s => ({
                姓名: s.name,
                平均分: s.average,
                不及格科目: Object.entries(s.grades)
                    .filter(([_, grade]) => grade !== null && grade < 60)
                    .map(([subject, grade]) => `${subject}(${grade}分)`)
            }))
    };
};

// 生成学科分析报告
export const generateSubjectReport = curry((subject, students) => {
    const stats = calculateSubjectStats(subject, students);
    
    if (stats.noData) {
        return { subject, message: '无有效数据' };
    }
    
    // 找出该科目表现最好和最差的学生
    const studentsWithGrade = students
        .filter(s => s.grades[subject] !== null)
        .sort((a, b) => b.grades[subject] - a.grades[subject]);
    
    const top3 = studentsWithGrade.slice(0, 3);
    const bottom3 = studentsWithGrade.slice(-3).reverse();
    
    return {
        科目: subject,
        统计概要: {
            参考人数: stats.count,
            平均分: stats.average,
            标准差: stats.standardDeviation,
            最高分: stats.highest,
            最低分: stats.lowest,
            中位数: stats.median,
            及格率: `${stats.passRate}%`
        },
        成绩分布: stats.distribution,
        优秀学生: top3.map(s => ({
            姓名: s.name,
            班级: s.class,
            成绩: s.grades[subject]
        })),
        需要帮助的学生: bottom3.map(s => ({
            姓名: s.name,
            班级: s.class,
            成绩: s.grades[subject],
            与平均分差距: Number((s.grades[subject] - stats.average).toFixed(2))
        })),
        教学建议: generateTeachingSuggestions(stats)
    };
});

// 生成教学建议
const generateTeachingSuggestions = (stats) => {
    const suggestions = [];
    
    if (stats.passRate < 60) {
        suggestions.push('及格率较低，建议加强基础知识教学');
    }
    
    if (stats.standardDeviation > 15) {
        suggestions.push('成绩分散度较大，建议实施分层教学');
    }
    
    if (stats.distribution['优秀'] < stats.count * 0.1) {
        suggestions.push('优秀率偏低，建议增加拓展内容培养尖子生');
    }
    
    if (stats.distribution['不及格'] > stats.count * 0.3) {
        suggestions.push('不及格人数较多，建议开展补习辅导');
    }
    
    if (stats.average < 70) {
        suggestions.push('整体平均分偏低，建议调整教学方法和进度');
    }
    
    return suggestions.length > 0 ? suggestions : ['整体表现良好，继续保持'];
};

// 生成综合报告
export const generateSummaryReport = (validationResult, processedStudents) => {
    const classes = groupBy('class')(processedStudents);
    const subjects = ['chinese', 'math', 'english', 'physics', 'chemistry', 'biology'];
    
    return {
        数据验证结果: {
            总记录数: validationResult.totalRecords,
            有效记录: validationResult.validRecords,
            无效记录: validationResult.invalidRecords,
            错误详情: validationResult.errors
        },
        
        整体统计: {
            学生总数: processedStudents.length,
            整体平均分: Number(
                (processedStudents.reduce((sum, s) => sum + s.average, 0) / 
                processedStudents.length).toFixed(2)
            ),
            各科平均分: subjects.reduce((acc, subject) => {
                const grades = processedStudents
                    .map(s => s.grades[subject])
                    .filter(g => g !== null);
                acc[subject] = grades.length > 0 ? 
                    Number((grades.reduce((a, b) => a + b) / grades.length).toFixed(2)) : 0;
                return acc;
            }, {})
        },
        
        班级报告: Object.entries(classes).map(([className, students]) => 
            generateClassReport({ className, students })
        ),
        
        学科报告: subjects.map(subject => 
            generateSubjectReport(subject, processedStudents)
        ),
        
        年级排名: {
            总分排名: processedStudents.slice(0, 10).map(s => ({
                排名: s.totalRank,
                姓名: s.name,
                班级: s.class,
                总分: s.total,
                平均分: s.average
            })),
            各科第一: subjects.map(subject => {
                const top = processedStudents
                    .filter(s => s.grades[subject] !== null)
                    .sort((a, b) => b.grades[subject] - a.grades[subject])[0];
                return {
                    科目: subject,
                    第一名: top ? `${top.name} (${top.grades[subject]}分)` : '无数据'
                };
            })
        },
        
        特别关注: {
            学习标兵: processedStudents
                .filter(s => s.gradeLevel === '优秀')
                .slice(0, 5)
                .map(s => `${s.name} (${s.class}, 平均${s.average}分)`),
            
            进步空间大: processedStudents
                .filter(s => s.improvementPotential?.potentialGain > 20)
                .slice(0, 5)
                .map(s => ({
                    姓名: s.name,
                    班级: s.class,
                    当前平均分: s.average,
                    潜在提升: `${s.improvementPotential.potentialGain}分`,
                    重点科目: s.improvementPotential.weakSubjects
                })),
            
            需要帮助: processedStudents
                .filter(s => s.average < 60)
                .map(s => ({
                    姓名: s.name,
                    班级: s.class,
                    平均分: s.average,
                    不及格科目数: Object.values(s.grades).filter(g => g !== null && g < 60).length
                }))
        }
    };
};
```

### 主程序 (main.js)

```javascript
import { pipe, trace, groupBy } from './utils.js';
import { validateStudents } from './validators.js';
import { processStudent } from './processors.js';
import { 
    addAllRankings, 
    findImprovementOpportunities,
    calculateClassStats 
} from './analyzers.js';
import { 
    generateStudentReport,
    generateSummaryReport 
} from './reporters.js';

// 原始数据（与练习中相同）
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
    // 异常数据
    {
        studentId: 'INVALID',
        name: '测试学生1',
        class: '高三3班',
        grades: {
            chinese: 120,
            math: -10,
            english: 85,
            physics: null,
            chemistry: undefined,
            biology: 'absent'
        }
    },
    {
        studentId: 'STU006',
        name: '',
        class: '高三3班',
        grades: {}
    }
];

// 主处理管道
const processGrades = pipe(
    // 1. 验证数据
    validateStudents,
    trace('验证结果'),
    
    // 2. 处理有效学生数据
    (validationResult) => {
        const processedStudents = pipe(
            // 处理每个学生
            students => students.map(processStudent),
            trace('处理后的学生'),
            
            // 添加排名
            addAllRankings,
            trace('添加排名后'),
            
            // 分析提升空间
            findImprovementOpportunities,
            trace('分析提升空间后')
        )(validationResult.validStudents);
        
        return {
            validation: validationResult,
            students: processedStudents
        };
    },
    
    // 3. 生成报告
    ({ validation, students }) => {
        const summaryReport = generateSummaryReport(validation, students);
        
        // 生成个人报告（示例：前3名学生）
        const individualReports = students
            .slice(0, 3)
            .map(generateStudentReport);
        
        return {
            summary: summaryReport,
            individualReports,
            // 原始处理后的数据，便于进一步分析
            processedData: {
                validation,
                students
            }
        };
    }
);

// 执行处理
console.log('开始处理学生成绩数据...\n');
const result = processGrades(rawGrades);

// 输出结果
console.log('\n========== 处理完成 ==========\n');
console.log('验证结果:');
console.log(`- 总记录数: ${result.summary.数据验证结果.总记录数}`);
console.log(`- 有效记录: ${result.summary.数据验证结果.有效记录}`);
console.log(`- 无效记录: ${result.summary.数据验证结果.无效记录}`);

console.log('\n整体统计:');
console.log(`- 学生总数: ${result.summary.整体统计.学生总数}`);
console.log(`- 整体平均分: ${result.summary.整体统计.整体平均分}`);

console.log('\n各科平均分:');
Object.entries(result.summary.整体统计.各科平均分).forEach(([subject, avg]) => {
    console.log(`- ${subject}: ${avg}`);
});

console.log('\n年级前三名:');
result.summary.年级排名.总分排名.slice(0, 3).forEach(student => {
    console.log(`${student.排名}. ${student.姓名} (${student.班级}) - 总分: ${student.总分}, 平均: ${student.平均分}`);
});

console.log('\n需要特别关注的学生:');
result.summary.特别关注.需要帮助.forEach(student => {
    console.log(`- ${student.姓名} (${student.班级}) - 平均分: ${student.平均分}, 不及格科目: ${student.不及格科目数}门`);
});

// 导出结果到文件（可选）
const exportResults = () => {
    const fs = require('fs');
    
    // 导出完整报告
    fs.writeFileSync(
        'grade_analysis_report.json', 
        JSON.stringify(result, null, 2),
        'utf-8'
    );
    
    // 导出Excel友好的CSV格式
    const csvData = result.processedData.students.map(s => ({
        学号: s.studentId,
        姓名: s.name,
        班级: s.class,
        语文: s.grades.chinese,
        数学: s.grades.math,
        英语: s.grades.english,
        物理: s.grades.physics,
        化学: s.grades.chemistry,
        生物: s.grades.biology,
        总分: s.total,
        平均分: s.average,
        年级排名: s.totalRank,
        成绩等级: s.gradeLevel
    }));
    
    const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    fs.writeFileSync('grade_analysis.csv', csvContent, 'utf-8');
    
    console.log('\n报告已导出到文件！');
};

// 如果需要导出，取消注释下面这行
// exportResults();

// 性能测试（处理大量数据）
const performanceTest = () => {
    console.log('\n========== 性能测试 ==========\n');
    
    // 生成1000个学生的数据
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        studentId: `STU${String(i + 1).padStart(3, '0')}`,
        name: `学生${i + 1}`,
        class: `高三${(i % 10) + 1}班`,
        grades: {
            chinese: Math.floor(Math.random() * 40) + 60,
            math: Math.floor(Math.random() * 40) + 60,
            english: Math.floor(Math.random() * 40) + 60,
            physics: Math.floor(Math.random() * 40) + 60,
            chemistry: Math.floor(Math.random() * 40) + 60,
            biology: Math.floor(Math.random() * 40) + 60
        }
    }));
    
    console.time('处理1000条记录');
    const largeResult = processGrades(largeDataset);
    console.timeEnd('处理1000条记录');
    
    console.log(`\n处理完成: ${largeResult.processedData.students.length}个学生`);
};

// 如果需要性能测试，取消注释下面这行
// performanceTest();

// 导出函数供其他模块使用
export {
    processGrades,
    processStudent,
    generateStudentReport,
    generateSummaryReport
};
```

## 关键实现亮点

### 1. 纯函数设计

所有数据处理函数都是纯函数，相同输入总是产生相同输出：

```javascript
// 纯函数示例
const calculateAverage = (grades) => {
    const validGrades = getValidGrades(grades);
    return validGrades.length > 0 ? average(validGrades) : 0;
};
```

### 2. 函数组合

通过组合小函数构建复杂功能：

```javascript
const processStudent = pipe(
    cleanStudent,
    enrichStudent,
    analyzeStrengths
);
```

### 3. 不可变数据

始终返回新数据，从不修改原始数据：

```javascript
const enrichStudent = (student) => ({
    ...student,  // 创建新对象
    total: calculateTotal(student.grades),
    average: calculateAverage(student.grades)
});
```

### 4. 高阶函数和柯里化

创建灵活可重用的函数：

```javascript
const rankBySubject = curry((subject, students) => {
    // 实现按科目排名
});

const rankByMath = rankBySubject('math');
```

### 5. 错误处理

通过验证函数集中处理错误：

```javascript
const validateStudent = (student) => {
    const errors = [];
    // 收集所有错误
    return { isValid: errors.length === 0, errors };
};
```

## 性能优化技巧

1. **避免重复计算**：使用缓存和记忆化
2. **延迟计算**：只在需要时计算结果
3. **批量处理**：使用单次遍历完成多个操作
4. **并行处理**：对独立的数据处理可以并行执行

## 总结

这个解决方案展示了函数式编程的强大之处：

1. **模块化**：每个功能都是独立的模块
2. **可测试**：纯函数易于测试
3. **可组合**：通过组合构建复杂功能
4. **可维护**：代码清晰，易于理解和修改
5. **可扩展**：易于添加新功能

通过这个项目，你应该能够掌握函数式编程的核心概念，并能够应用到实际项目中！