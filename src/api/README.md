# 标注数据虚拟API文档

这是一个基于 `localStorage` 的虚拟API服务，用于模拟后端API的保存和获取功能。

## API列表

### 1. 保存多边形标注数据

```javascript
import { savePolygonAnnotations } from '@/api/mockApi.js';

// 保存数据
const saveData = {
  videoUrl: '/src/assets/img.jpg',
  currentFrame: 0,
  scale: 0.6,
  timestamp: new Date().toISOString(),
  annotations: [...],
  polygons: [...]
};

const response = await savePolygonAnnotations(saveData);

// 响应格式
{
  success: true,
  message: '多边形标注数据保存成功',
  data: {
    id: '1234567890',
    polygonCount: 3,
    timestamp: '2026-04-01T12:00:00.000Z'
  }
}
```

### 2. 根据帧号获取标注数据

```javascript
import { getPolygonsByFrame } from '@/api/mockApi.js';

// 获取第0帧的数据
const response = await getPolygonsByFrame(0);

// 响应格式
{
  success: true,
  message: '获取标注数据成功',
  data: {
    frame: 0,
    polygons: [...],
    annotations: [...],
    scale: 0.6,
    savedAt: '2026-04-01T12:00:00.000Z'
  }
}
```

### 3. 获取所有标注数据

```javascript
import { getAllPolygonAnnotations } from '@/api/mockApi.js';

const response = await getAllPolygonAnnotations();

// 响应格式
{
  success: true,
  message: '获取所有标注数据成功',
  data: {
    totalFrames: 5,
    totalAnnotations: 10,
    annotationsByFrame: {
      '0': [...],
      '1': [...],
      ...
    },
    allData: [...]
  }
}
```

### 4. 删除指定帧的标注数据

```javascript
import { deleteAnnotationsByFrame } from '@/api/mockApi.js';

const response = await deleteAnnotationsByFrame(0);

// 响应格式
{
  success: true,
  message: '已删除第 0 帧的标注数据',
  data: {
    deletedCount: 2
  }
}
```

### 5. 清空所有标注数据

```javascript
import { clearAllAnnotations } from '@/api/mockApi.js';

const response = await clearAllAnnotations();

// 响应格式
{
  success: true,
  message: '已清空所有标注数据'
}
```

### 6. 根据ID更新标注数据

```javascript
import { updateAnnotationById } from '@/api/mockApi.js';

const updateData = {
  polygons: [...],
  annotations: [...]
};

const response = await updateAnnotationById('1234567890', updateData);

// 响应格式
{
  success: true,
  message: '标注数据更新成功',
  data: {
    id: '1234567890',
    ...更新后的数据,
    updatedAt: '2026-04-01T12:30:00.000Z'
  }
}
```

## 多边形数据格式

保存的多边形数据格式（已应用0.6缩放比例）：

```javascript
{
  id: 1234567890,              // 标注ID
  label: 'polygon',            // 标签
  vertices: [                  // 顶点数组（绝对坐标，已缩放）
    { x: 120.5, y: 180.3 },
    { x: 200.8, y: 250.6 },
    { x: 150.2, y: 300.9 }
  ],
  vertexCount: 3,              // 顶点数量
  fill: 'rgba(255, 0, 255, 0.1)',
  stroke: '#ff00ff',
  strokeWidth: 2
}
```

## 完整保存数据格式

```javascript
{
  videoUrl: '/src/assets/img.jpg',
  currentFrame: 0,
  scale: 0.6,                  // 缩放比例
  timestamp: '2026-04-01T12:00:00.000Z',
  annotations: [...],          // 原始标注数据
  polygons: [...],            // 多边形数据（包含绝对坐标）
  savedAt: '2026-04-01T12:00:00.000Z',  // API自动添加
  id: '1234567890'            // API自动生成
}
```

## 特性

- ✅ 自动处理多边形顶点的绝对坐标计算
- ✅ 自动应用缩放比例（0.6）
- ✅ 支持按帧号查询
- ✅ 支持查看所有数据统计
- ✅ 模拟500ms网络延迟
- ✅ 数据持久化到 localStorage
- ✅ 错误处理和验证

## 使用示例

在 `AnnotationPage.vue` 中已集成以下功能：

1. **保存按钮** - 保存当前帧的所有多边形标注
2. **从API加载当前帧** - 加载已保存的当前帧数据
3. **查看所有数据** - 在控制台查看所有已保存的数据统计
4. **清空存储** - 清空所有保存的数据
5. **下载JSON数据** - 下载当前数据为JSON文件

## 替换为真实API

要替换为真实的后端API，只需：

1. 修改 `mockApi.js` 中的实现
2. 将 `localStorage` 操作替换为 `fetch` 或 `axios` 调用
3. 保持返回数据格式不变

示例：

```javascript
export const savePolygonAnnotations = async (data) => {
  const response = await fetch('/api/annotations/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('保存失败');
  }

  return await response.json();
};
```

## 注意事项

- localStorage 有存储大小限制（通常5-10MB）
- 数据格式必须符合JSON规范
- 所有API调用都是异步的，返回 Promise
- 多边形顶点坐标已自动应用0.6的缩放比例
