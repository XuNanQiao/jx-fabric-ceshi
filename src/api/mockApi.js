/**
 * 模拟API服务 - 用于测试标注数据的保存和获取
 */

// 使用 localStorage 模拟数据库存储
const STORAGE_KEY = 'annotation_data';

/**
 * 获取所有保存的标注数据
 */
const getAllAnnotations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('获取数据失败:', error);
    return [];
  }
};

/**
 * 保存标注数据到存储
 */
const saveAnnotationData = (newData) => {
  try {
    const allData = getAllAnnotations();
    allData.push({
      ...newData,
      savedAt: new Date().toISOString(),
      id: Date.now().toString(),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    return true;
  } catch (error) {
    console.error('保存数据失败:', error);
    return false;
  }
};

/**
 * 模拟API：保存多边形标注数据
 * @param {Object} data - 标注数据
 * @returns {Promise} - 返回保存结果
 */
export const savePolygonAnnotations = (data) => {
  return new Promise((resolve, reject) => {
    // 模拟网络延迟
    setTimeout(() => {
      try {
        // 验证数据
        if (!data || !data.polygons) {
          reject(new Error('数据格式错误：缺少多边形数据'));
          return;
        }

        // 保存数据
        const success = saveAnnotationData(data);

        if (success) {
          resolve({
            success: true,
            message: '多边形标注数据保存成功',
            data: {
              id: Date.now().toString(),
              polygonCount: data.polygons.length,
              timestamp: new Date().toISOString(),
            },
          });
        } else {
          reject(new Error('保存失败'));
        }
      } catch (error) {
        reject(error);
      }
    }, 500); // 模拟500ms的网络延迟
  });
};

/**
 * 模拟API：根据帧号获取多边形标注数据
 * @param {number} frameNumber - 帧号
 * @returns {Promise} - 返回标注数据
 */
export const getPolygonsByFrame = (frameNumber) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const allData = getAllAnnotations();

        // 查找对应帧的数据
        const frameData = allData.filter(item => item.currentFrame === frameNumber);

        if (frameData.length === 0) {
          resolve({
            success: true,
            message: '该帧暂无标注数据',
            data: {
              frame: frameNumber,
              polygons: [],
              annotations: [],
            },
          });
        } else {
          // 返回最新的标注数据
          const latestData = frameData[frameData.length - 1];
          resolve({
            success: true,
            message: '获取标注数据成功',
            data: {
              frame: frameNumber,
              polygons: latestData.polygons || [],
              annotations: latestData.annotations || [],
              scale: latestData.scale || 1.0,
              savedAt: latestData.savedAt,
            },
          });
        }
      } catch (error) {
        reject(error);
      }
    }, 300);
  });
};

/**
 * 模拟API：获取所有帧的标注数据
 * @returns {Promise} - 返回所有标注数据
 */
export const getAllPolygonAnnotations = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const allData = getAllAnnotations();

        // 按帧号分组
        const groupedByFrame = allData.reduce((acc, item) => {
          const frame = item.currentFrame;
          if (!acc[frame]) {
            acc[frame] = [];
          }
          acc[frame].push(item);
          return acc;
        }, {});

        resolve({
          success: true,
          message: '获取所有标注数据成功',
          data: {
            totalFrames: Object.keys(groupedByFrame).length,
            totalAnnotations: allData.length,
            annotationsByFrame: groupedByFrame,
            allData: allData,
          },
        });
      } catch (error) {
        reject(error);
      }
    }, 300);
  });
};

/**
 * 模拟API：删除指定帧的标注数据
 * @param {number} frameNumber - 帧号
 * @returns {Promise} - 返回删除结果
 */
export const deleteAnnotationsByFrame = (frameNumber) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const allData = getAllAnnotations();
        const filteredData = allData.filter(item => item.currentFrame !== frameNumber);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));

        resolve({
          success: true,
          message: `已删除第 ${frameNumber} 帧的标注数据`,
          data: {
            deletedCount: allData.length - filteredData.length,
          },
        });
      } catch (error) {
        reject(error);
      }
    }, 300);
  });
};

/**
 * 模拟API：清空所有标注数据
 * @returns {Promise} - 返回清空结果
 */
export const clearAllAnnotations = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        resolve({
          success: true,
          message: '已清空所有标注数据',
        });
      } catch (error) {
        reject(error);
      }
    }, 300);
  });
};

/**
 * 模拟API：根据ID更新标注数据
 * @param {string} id - 标注数据ID
 * @param {Object} updateData - 更新的数据
 * @returns {Promise} - 返回更新结果
 */
export const updateAnnotationById = (id, updateData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const allData = getAllAnnotations();
        const index = allData.findIndex(item => item.id === id);

        if (index === -1) {
          reject(new Error('未找到对应的标注数据'));
          return;
        }

        allData[index] = {
          ...allData[index],
          ...updateData,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));

        resolve({
          success: true,
          message: '标注数据更新成功',
          data: allData[index],
        });
      } catch (error) {
        reject(error);
      }
    }, 300);
  });
};

export default {
  savePolygonAnnotations,
  getPolygonsByFrame,
  getAllPolygonAnnotations,
  deleteAnnotationsByFrame,
  clearAllAnnotations,
  updateAnnotationById,
};
