// src/data/parser.js
// 题库解析器：把 Q:/A:/D: 格式的原始字符串解析成结构化数组

/**
 * 解析题库原始文本
 * @param {string} rawText - 原始题库字符串
 * @returns {Array<{question: string, answers: string[], desc: string}>}
 */
export function parseQuestionBank(rawText) {
  const entries = []
  let currentEntry = null // 正在组装的词条|条目
  const lines = rawText.split('\n').filter(line=>Boolean)
  for(const raw of lines){
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const separator_index = line.indexOf(":")
    if(separator_index === -1){
      continue
    }
    const prefix = line.substring(0,separator_index).trim()
    const content = line.substring(separator_index+1).trim()
    if(prefix === "Q" ){
      if(currentEntry && currentEntry.answers.length > 0){
        entries.push(currentEntry)
      }
      currentEntry = {'question': content,'answers': [],'desc': "",'status': 'needs-mastery'}
      
      continue
    }
    if(prefix === "A" && currentEntry){
      currentEntry.answers.push(content)
    }
    if(prefix === "D" && currentEntry){
      currentEntry.desc = content
    }
    // ← 新增分支
    if (prefix === 'S' && currentEntry) {
      currentEntry.status = content;   // 'mastered' 或 'needs-mastery'
    }
  
  }
  if(currentEntry && currentEntry.answers.length>0){
    entries.push(currentEntry)
  }
  return entries
}


