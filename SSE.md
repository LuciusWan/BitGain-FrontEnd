



          
我将查看practice-center.vue文件中的SSE接口构建方式，分析其实现细节和使用模式。
        
            
toolName: view_files
            
status: success
          
            
filePath: c:\Users\86180\Desktop\EAX-frontend\EduAgentX-frontend\src\views\student\practice-center.vue
          
继续查看SSE连接的创建和配置部分。
        
            
toolName: view_files
            
status: success
          
            
filePath: c:\Users\86180\Desktop\EAX-frontend\EduAgentX-frontend\src\views\student\practice-center.vue
          
查看SSE工具类的实现细节。
        
            
toolName: view_files
            
status: success
          
            
filePath: c:\Users\86180\Desktop\EAX-frontend\EduAgentX-frontend\src\utils\sse.js
          
## practice-center.vue 中的 SSE 接口构建方式总结

### 1. SSE 工具类引入
```javascript
import { SSE } from '../../utils/sse';
```
使用了自定义的 SSE 工具类，这是一个 EventSource 的 polyfill/替代品。

### 2. SSE 连接创建
```javascript
sseConnection = new SSE('http://localhost:8080/api/student/adapt-practice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Token': localStorage.getItem('token')
  },
  payload: JSON.stringify({
    subjectId: practiceConfig.subjectId,
    questionCount: practiceConfig.questionCount,
    know: practiceConfig.know || undefined,
    category: practiceConfig.category
  }),
  start: false // 禁止自动连接
});
```

### 3. 事件监听器配置

**消息监听**：
```javascript
sseConnection.addEventListener('message', (event) => {
  try {
    const data = JSON.parse(event.data);
    
    if (data.type === 'question') {
      // 收到新题目
      questions.value.push(data);
      
      // 如果是第一题，立即显示
      if (questions.value.length === 1) {
        currentQuestion.value = data;
        generating.value = false;
      }
    } else if (data.type === 'complete') {
      // 题目生成完成
      generating.value = false;
      console.log('所有题目生成完成');
    }
  } catch (error) {
    console.error('解析SSE数据失败:', error);
  }
});
```

**错误监听**：
```javascript
sseConnection.addEventListener('error', (event) => {
  console.error('SSE连接错误:', event);
  ElMessage.error('题目生成失败，请重试');
  generating.value = false;
  practiceStarted.value = false;
});
```

### 4. 连接管理

**启动连接**：
```javascript
sseConnection.stream();
```

**关闭连接**：
```javascript
if (sseConnection) {
  sseConnection.close();
  sseConnection = null;
}
```

### 5. 核心特点

- **POST 方法**：支持通过 POST 请求发送参数
- **认证机制**：通过 Token header 进行身份验证
- **数据格式**：使用 JSON 格式传输数据
- **类型区分**：通过 `data.type` 字段区分不同类型的消息（question/complete）
- **错误处理**：完善的错误监听和处理机制
- **连接控制**：手动控制连接的开始和关闭
- **状态管理**：与 Vue 响应式数据结合，实时更新 UI 状态

这种 SSE 实现方式特别适合需要服务器主动推送数据的场景，如实时题目生成、进度更新等。
        