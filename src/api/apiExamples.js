/**
 * 虚拟API使用示例
 * 展示如何使用 mockApi.js 中的各种API
 */

import {
  savePolygonAnnotations,
  getPolygonsByFrame,
  getAllPolygonAnnotations,
  deleteAnnotationsByFrame,
  clearAllAnnotations,
  updateAnnotationById,
} from './mockApi.js';

// ============ 示例1: 保存多边形数据 ============
export const example1_save = async () => {
  console.log('=== 示例1: 保存多边形数据 ===');

  const mockPolygonData = {
    videoUrl: '/src/assets/img.jpg',
    currentFrame: 0,
    scale: 0.6,
    timestamp: new Date().toISOString(),
    annotations: [
      {
        id: 1001,
        type: 'polygon',
        label: 'car',
        frame: 0,
      },
    ],
    polygons: [
      {
        id: 1001,
        label: 'car',
        vertices: [
          { x: 100.5, y: 150.2 },
          { x: 200.8, y: 150.2 },
          { x: 200.8, y: 250.5 },
          { x: 100.5, y: 250.5 },
        ],
        vertexCount: 4,
        fill: 'rgba(255, 0, 255, 0.1)',
        stroke: '#ff00ff',
        strokeWidth: 2,
      },
    ],
  };

  try {
    const response = await savePolygonAnnotations(mockPolygonData);
    console.log('保存成功:', response);
    return response;
  } catch (error) {
    console.error('保存失败:', error);
    throw error;
  }
};

// ============ 示例2: 获取指定帧的数据 ============
export const example2_getByFrame = async (frameNumber = 0) => {
  console.log(`=== 示例2: 获取第 ${frameNumber} 帧的数据 ===`);

  try {
    const response = await getPolygonsByFrame(frameNumber);
    console.log('获取成功:', response);

    if (response.data.polygons.length > 0) {
      console.log('多边形数据:');
      console.table(response.data.polygons);
    }

    return response;
  } catch (error) {
    console.error('获取失败:', error);
    throw error;
  }
};

// ============ 示例3: 获取所有数据统计 ============
export const example3_getAllData = async () => {
  console.log('=== 示例3: 获取所有数据统计 ===');

  try {
    const response = await getAllPolygonAnnotations();
    console.log('统计信息:', {
      总帧数: response.data.totalFrames,
      总标注数: response.data.totalAnnotations,
    });

    console.log('详细数据:');
    console.table(
      response.data.allData.map((item) => ({
        ID: item.id,
        帧号: item.currentFrame,
        多边形数量: item.polygons?.length || 0,
        缩放比例: item.scale,
        保存时间: new Date(item.savedAt).toLocaleString('zh-CN'),
      }))
    );

    return response;
  } catch (error) {
    console.error('获取失败:', error);
    throw error;
  }
};

// ============ 示例4: 批量保存多帧数据 ============
export const example4_saveMultipleFrames = async () => {
  console.log('=== 示例4: 批量保存多帧数据 ===');

  const frames = [0, 1, 2];

  for (const frameNum of frames) {
    const data = {
      videoUrl: '/src/assets/img.jpg',
      currentFrame: frameNum,
      scale: 0.6,
      timestamp: new Date().toISOString(),
      annotations: [
        {
          id: 2000 + frameNum,
          type: 'polygon',
          label: `frame_${frameNum}`,
          frame: frameNum,
        },
      ],
      polygons: [
        {
          id: 2000 + frameNum,
          label: `frame_${frameNum}`,
          vertices: [
            { x: 50 + frameNum * 10, y: 50 + frameNum * 10 },
            { x: 150 + frameNum * 10, y: 50 + frameNum * 10 },
            { x: 150 + frameNum * 10, y: 150 + frameNum * 10 },
          ],
          vertexCount: 3,
          fill: 'rgba(255, 0, 255, 0.1)',
          stroke: '#ff00ff',
          strokeWidth: 2,
        },
      ],
    };

    try {
      const response = await savePolygonAnnotations(data);
      console.log(`第 ${frameNum} 帧保存成功:`, response.data);
    } catch (error) {
      console.error(`第 ${frameNum} 帧保存失败:`, error);
    }
  }

  console.log('批量保存完成');
};

// ============ 示例5: 更新已保存的数据 ============
export const example5_updateData = async (annotationId) => {
  console.log(`=== 示例5: 更新数据 ID=${annotationId} ===`);

  const updateData = {
    polygons: [
      {
        id: 1001,
        label: 'updated_car',
        vertices: [
          { x: 110.5, y: 160.2 },
          { x: 210.8, y: 160.2 },
          { x: 210.8, y: 260.5 },
          { x: 110.5, y: 260.5 },
        ],
        vertexCount: 4,
        fill: 'rgba(0, 255, 0, 0.1)',
        stroke: '#00ff00',
        strokeWidth: 3,
      },
    ],
  };

  try {
    const response = await updateAnnotationById(annotationId, updateData);
    console.log('更新成功:', response);
    return response;
  } catch (error) {
    console.error('更新失败:', error);
    throw error;
  }
};

// ============ 示例6: 删除指定帧的数据 ============
export const example6_deleteFrame = async (frameNumber) => {
  console.log(`=== 示例6: 删除第 ${frameNumber} 帧的数据 ===`);

  try {
    const response = await deleteAnnotationsByFrame(frameNumber);
    console.log('删除成功:', response);
    return response;
  } catch (error) {
    console.error('删除失败:', error);
    throw error;
  }
};

// ============ 示例7: 清空所有数据 ============
export const example7_clearAll = async () => {
  console.log('=== 示例7: 清空所有数据 ===');

  try {
    const response = await clearAllAnnotations();
    console.log('清空成功:', response);
    return response;
  } catch (error) {
    console.error('清空失败:', error);
    throw error;
  }
};

// ============ 完整测试流程 ============
export const runFullTest = async () => {
  console.log('\n\n========== 开始完整测试流程 ==========\n');

  try {
    // 1. 清空现有数据
    console.log('\n步骤1: 清空现有数据');
    await example7_clearAll();

    // 2. 保存单个多边形
    console.log('\n步骤2: 保存单个多边形');
    const saveResult = await example1_save();
    const savedId = saveResult.data.id;

    // 3. 获取刚保存的数据
    console.log('\n步骤3: 获取第0帧数据');
    await example2_getByFrame(0);

    // 4. 批量保存多帧
    console.log('\n步骤4: 批量保存多帧数据');
    await example4_saveMultipleFrames();

    // 5. 查看所有数据
    console.log('\n步骤5: 查看所有数据统计');
    await example3_getAllData();

    // 6. 更新数据
    console.log('\n步骤6: 更新第一条数据');
    await example5_updateData(savedId);

    // 7. 再次查看所有数据
    console.log('\n步骤7: 查看更新后的数据');
    await example3_getAllData();

    console.log('\n\n========== 测试流程完成 ==========\n');
  } catch (error) {
    console.error('\n测试过程中出现错误:', error);
  }
};

// 在浏览器控制台中使用:
// import { runFullTest } from '@/api/apiExamples.js';
// runFullTest();
