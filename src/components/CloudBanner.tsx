import { retrySave } from '../lib/cloud';
import { useCloudInfo } from './Boot';

/**
 * 全局提示条：数据只存云端，一旦写失败必须让家长立刻看到，
 * 否则刷新页面就丢了刚才的打卡。
 */
export default function CloudBanner() {
  const info = useCloudInfo();
  if (!info.unsaved) return null;

  return (
    <div className="cloud-banner" role="alert">
      <span>⚠️ {info.message || '刚才的改动还没存到云端'}</span>
      <button className="cloud-banner-btn" onClick={() => retrySave()}>
        重试
      </button>
    </div>
  );
}
